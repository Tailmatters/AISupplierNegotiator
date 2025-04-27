import { db } from '@/lib/db'
import { users } from '@/schema'
import { cookies } from 'next/headers'
import { jwtVerify, SignJWT } from 'jose'
import { NextRequest } from 'next/server'
import { eq } from 'drizzle-orm'
import { randomBytes, scrypt } from 'crypto'
import { promisify } from 'util'

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt)

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'extremely-secure-secret-key-change-me-in-production'
)

// JWT options
const JWT_OPTIONS = {
  expiresIn: '24h',
}

// User type excluding password
export type AuthUser = Omit<typeof users.$inferSelect, 'password'>

/**
 * Hash a password with a random salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

/**
 * Create a JWT token and set it as a cookie
 */
export async function createToken(user: AuthUser): Promise<void> {
  // Create the token
  const token = await new SignJWT({ id: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_OPTIONS.expiresIn)
    .sign(JWT_SECRET)
  
  // Set the cookie
  cookies().set({
    name: 'auth-token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours
  })
}

/**
 * Get the token from cookies
 */
export async function getToken(): Promise<string | undefined> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth-token')
  return token?.value
}

/**
 * Verify the JWT token and return the user ID
 */
export async function verifyToken(token: string): Promise<number | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.id as number
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Compare a plain password with a hashed one
 */
export async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  try {
    const [hash, salt] = hashed.split('.')
    const hashBuffer = Buffer.from(hash, 'hex')
    const derivedKey = (await scryptAsync(plain, salt, 64)) as Buffer
    return Buffer.compare(hashBuffer, derivedKey) === 0
  } catch (error) {
    console.error('Password comparison failed:', error)
    return false
  }
}

/**
 * Get the current user from the JWT token in cookies
 */
export async function getUserFromToken(): Promise<AuthUser | null> {
  try {
    const token = await getToken()
    
    if (!token) {
      return null
    }
    
    const userId = await verifyToken(token)
    
    if (!userId) {
      return null
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
    
    if (!user) {
      return null
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Get user error:', error)
    return null
  }
}

/**
 * Log out the current user by removing the auth cookie
 */
export async function logout(): Promise<void> {
  cookies().delete('auth-token')
}