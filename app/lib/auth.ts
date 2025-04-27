import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt)

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const COOKIE_NAME = 'auth_token'

// Hash a password with salt
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

// Compare a password with a hashed password
export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.')
  const hashedBuf = Buffer.from(hashed, 'hex')
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer
  return timingSafeEqual(hashedBuf, suppliedBuf)
}

// Create a JWT token
export async function createToken(payload: any) {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secret)
}

// Verify a JWT token
export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET)
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    return null
  }
}

// Get the current user from the cookie
export async function getUser(request?: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = request
      ? request.cookies.get(COOKIE_NAME)?.value
      : cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const payload = await verifyToken(token)
    if (!payload || !payload.userId) return null

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, Number(payload.userId)))

    return user || null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Set the auth cookie with a token
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day
  })
  return response
}

// Clear the auth cookie
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
  })
  return response
}