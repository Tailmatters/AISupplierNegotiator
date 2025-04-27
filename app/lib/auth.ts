import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { NextResponse } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

// Convert scrypt to promise-based function
const scryptAsync = promisify(scrypt)

// JWT secret key (use a proper env variable in production)
export const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'procurement-ai-platform-secret-key'
)

// Authentication token cookie name
export const AUTH_COOKIE = 'auth-token'

// Token expiration in seconds (1 day)
export const TOKEN_EXPIRATION = 60 * 60 * 24

// Define JWT payload type
export interface JWTPayload {
  userId: number
  username: string
  role: string
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

// Compare a password with a hashed password
export async function comparePasswords(
  suppliedPassword: string,
  storedPassword: string
): Promise<boolean> {
  const [hashedPassword, salt] = storedPassword.split('.')
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex')
  const suppliedPasswordBuf = (await scryptAsync(
    suppliedPassword,
    salt,
    64
  )) as Buffer
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf)
}

// Create a JWT token
export async function createToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRATION}s`)
    .sign(JWT_SECRET)
  
  return token
}

// Set token in cookie
export async function setTokenCookie(
  response: NextResponse,
  token: string
): Promise<void> {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_EXPIRATION,
    path: '/',
    sameSite: 'lax' as const,
  }
  
  response.cookies.set(AUTH_COOKIE, token, cookieOptions)
}

// Remove token cookie
export async function removeTokenCookie(
  response: NextResponse
): Promise<void> {
  response.cookies.delete(AUTH_COOKIE)
}

// Get auth token from cookies
export async function getAuthToken(
  cookies: ReadonlyRequestCookies
): Promise<string | undefined> {
  const cookie = cookies.get(AUTH_COOKIE)
  return cookie?.value
}

// Verify a JWT token
export async function verifyToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as JWTPayload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

// Get the current user from the request
export async function getCurrentUser(userId: number) {
  try {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        company: users.company,
        position: users.position,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, userId))
    
    return user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}