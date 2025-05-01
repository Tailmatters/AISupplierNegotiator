import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { compare, hash } from 'bcrypt'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'

// JWT secret key for signing/verifying tokens
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback-secret-key-for-development-only'
)

// Authentication cookie name and options
const AUTH_COOKIE = 'auth-token'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 60 * 60 * 24 * 7, // 1 week
  path: '/',
}

/**
 * Token payload for JWT
 */
interface JWTPayload {
  id: number
  username: string
  email: string
  name: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Create a JWT token with user data
 * @param payload User data for token
 * @returns Signed JWT token
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // Expires in 7 days
      .sign(JWT_SECRET)

    return token
  } catch (error) {
    console.error('Failed to create token:', error)
    throw new Error('Authentication token generation failed')
  }
}

/**
 * Verify a JWT token
 * @param token JWT token to verify
 * @returns Token payload if valid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Hash a password with bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10)
}

/**
 * Compare a password with a hash
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns True if match, false otherwise
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainPassword, hashedPassword)
}

/**
 * Set authentication cookie in response
 * @param response NextResponse object
 * @param token JWT token
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(AUTH_COOKIE, token, COOKIE_OPTIONS)
}

/**
 * Clear authentication cookie from response
 * @param response NextResponse object
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.delete(AUTH_COOKIE)
}

/**
 * Get authenticated user from request
 * @param request NextRequest object
 * @returns User object if authenticated, null otherwise
 */
export async function getAuthUser(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get(AUTH_COOKIE)?.value
    
    if (!token) {
      return null
    }
    
    // Verify token
    const payload = await verifyToken(token)
    
    if (!payload?.id) {
      return null
    }
    
    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
    
    return user || null
  } catch (error) {
    console.error('Auth user retrieval failed:', error)
    return null
  }
}

/**
 * Get authentication token from request cookies
 * @returns Token if present, null otherwise
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE)?.value
    return token || null
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}