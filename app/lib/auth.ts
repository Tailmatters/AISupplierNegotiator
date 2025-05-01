import { compare, hash } from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import * as schema from '@/schema'
import { db, withErrorHandling } from './db'
import { eq } from 'drizzle-orm'

// Configuration settings
const SALT_ROUNDS = 10
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-should-be-at-least-32-chars'
)
const JWT_EXPIRES_IN = '7d'

// Define the session token cookie name
export const AUTH_COOKIE = 'auth-token'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(plainPassword, hashedPassword)
}

/**
 * Create a JWT token for user authentication
 */
export async function signToken(payload: { id: number; username: string }): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
  
  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Set the authentication token in cookies
 */
export async function setAuthCookie(response: NextResponse, token: string): Promise<NextResponse> {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  })
  
  return response
}

/**
 * Clear the authentication token from cookies
 */
export function clearAuthCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  
  return response
}

/**
 * Get the current authenticated user from the request
 */
export async function getAuthUser(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE)?.value
    
    if (!token) {
      return null
    }
    
    const payload = await verifyToken(token)
    
    if (!payload || !payload.id) {
      return null
    }
    
    const user = await withErrorHandling(
      async () => {
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, Number(payload.id)))
        
        return user
      },
      'Failed to fetch authenticated user'
    )
    
    if (!user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

/**
 * Require authentication or redirect to the auth page
 */
export async function requireAuth() {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value
  
  if (!token) {
    redirect('/auth')
  }
  
  const payload = await verifyToken(token)
  
  if (!payload || !payload.id) {
    redirect('/auth')
  }
  
  const user = await withErrorHandling(
    async () => {
      const [user] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, Number(payload.id)))
      
      return user
    },
    'Failed to fetch authenticated user'
  )
  
  if (!user) {
    redirect('/auth')
  }
  
  return user
}