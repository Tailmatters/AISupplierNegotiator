import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { db } from '@/lib/db'
import { users, User } from '@/schema'
import { eq } from 'drizzle-orm'

// Constants
const TOKEN_NAME = 'auth_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds
const SECRET_KEY = process.env.SESSION_SECRET || 'your-fallback-secret-key-should-be-at-least-32-chars'

// Helper for scrypt (to support Promises)
const scryptAsync = promisify(scrypt)

// JWT payload interface
interface JWTPayload {
  userId: number
  username: string
  role: string
}

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

/**
 * Compare a password with a hashed password
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const [hash, salt] = hashedPassword.split('.')
  const hashBuffer = Buffer.from(hash, 'hex')
  const suppliedBuffer = (await scryptAsync(password, salt, 64)) as Buffer
  return timingSafeEqual(hashBuffer, suppliedBuffer)
}

/**
 * Create a JWT token for a user and set it as a cookie
 */
export async function createToken(user: User): Promise<void> {
  // Create the payload
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  }

  // Create the JWT
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_MAX_AGE}s`)
    .sign(new TextEncoder().encode(SECRET_KEY))

  // Set the cookie
  cookies().set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_MAX_AGE,
    sameSite: 'lax',
  })
}

/**
 * Clear the auth token cookie
 */
export async function clearToken(): Promise<void> {
  cookies().delete(TOKEN_NAME)
}

/**
 * Get the JWT payload from the request cookies
 */
export async function getTokenPayload(
  request?: NextRequest
): Promise<JWTPayload | null> {
  try {
    // Get the token from cookies
    const cookieStore = request ? request.cookies : cookies()
    const token = cookieStore.get(TOKEN_NAME)?.value

    if (!token) {
      return null
    }

    // Verify the token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(SECRET_KEY)
    )

    return payload as JWTPayload
  } catch (error) {
    console.error('Token validation error:', error)
    return null
  }
}

/**
 * Get the current user from the request cookies
 */
export async function getCurrentUser(
  request?: NextRequest
): Promise<User | null> {
  try {
    // Get the token payload
    const payload = await getTokenPayload(request)

    if (!payload) {
      return null
    }

    // Get the user from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1)

    return user || null
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}