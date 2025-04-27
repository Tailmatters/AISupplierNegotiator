import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'

// Constants
const TOKEN_NAME = 'auth-token'
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || 'default-secret-please-change')
const EXPIRY = '30d' // 30 days

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt)

// Types
export interface JWTPayload {
  userId: number
  username: string
  role: string
}

/**
 * Hash password using scrypt with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  return `${derivedKey.toString('hex')}.${salt}`
}

/**
 * Compare password with stored hash
 */
export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashedPassword, salt] = stored.split('.')
  const hashedBuffer = Buffer.from(hashedPassword, 'hex')
  const suppliedBuffer = (await scryptAsync(supplied, salt, 64)) as Buffer
  return timingSafeEqual(hashedBuffer, suppliedBuffer)
}

/**
 * Create JWT token with user data
 */
export async function createToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET)
}

/**
 * Set JWT token in cookies
 */
export async function setTokenCookie(
  response: NextResponse,
  token: string
): Promise<void> {
  const cookieStore = cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    path: '/',
  })
}

/**
 * Remove JWT token from cookies
 */
export async function removeTokenCookie(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(TOKEN_NAME)
}

/**
 * Get JWT token from cookies or authorization header
 */
export async function getToken(
  req?: NextRequest
): Promise<string | null> {
  // Get from cookies first (server component approach)
  const cookieStore = req ? req.cookies : cookies()
  const tokenCookie = cookieStore.get(TOKEN_NAME)
  
  if (tokenCookie?.value) {
    return tokenCookie.value
  }

  // Then try the authorization header (API approach)
  if (req?.headers) {
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7)
    }
  }

  return null
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, SECRET)
  return payload as JWTPayload
}

/**
 * Get current user from token
 */
export async function getCurrentUser(
  req?: NextRequest
): Promise<{ user: any | null; error?: string }> {
  try {
    const token = await getToken(req)
    
    if (!token) {
      return { user: null }
    }
    
    const payload = await verifyToken(token)
    
    // Get user from database to ensure they still exist and get fresh data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
    
    if (!user) {
      // User no longer exists in database
      return { user: null, error: 'User not found' }
    }
    
    // Omit password from user object
    const { password, ...userWithoutPassword } = user
    
    return { user: userWithoutPassword }
  } catch (error) {
    console.error('Auth error:', error)
    return { user: null, error: error.message }
  }
}