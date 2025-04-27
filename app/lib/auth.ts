'use server'

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'

// Make scrypt async
const scryptAsync = promisify(scrypt)

// Secret key for JWT signing
const secretKey = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'default_secret_key_for_development'
)

// JWT token expiration time (24 hours)
const tokenExpiration = '24h'

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

/**
 * Compare a password with a hashed one
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split('.')
  const hashedBuf = Buffer.from(hashed, 'hex')
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer
  return timingSafeEqual(hashedBuf, suppliedBuf)
}

/**
 * Create a JWT token and set it as a cookie
 */
export async function createToken(user: any): Promise<void> {
  // Create payload with user info (excluding password)
  const { password, ...payload } = user

  // Sign the JWT token
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(tokenExpiration)
    .sign(secretKey)

  // Set the token in a secure HTTP-only cookie
  cookies().set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 hours in seconds
    sameSite: 'lax',
  })
}

/**
 * Get user data from the token in the cookies
 */
export async function getUserFromToken(): Promise<any | null> {
  try {
    // Get the token from cookies
    const token = cookies().get('auth_token')

    // If no token exists, return null
    if (!token || !token.value) {
      return null
    }

    // Verify the token
    const { payload } = await jwtVerify(token.value, secretKey)
    
    // If the user ID doesn't exist in the payload, return null
    if (!payload.id) {
      return null
    }

    // Get the user from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, Number(payload.id)))
      .limit(1)
    
    // If the user doesn't exist, return null
    if (!user) {
      return null
    }
    
    // Remove the password from the user object
    const { password, ...userWithoutPassword } = user
    
    return userWithoutPassword
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

/**
 * Refresh the user's token
 */
export async function refreshToken(): Promise<void> {
  try {
    const user = await getUserFromToken()
    if (user) {
      await createToken(user)
    }
  } catch (error) {
    console.error('Error refreshing token:', error)
  }
}

/**
 * Log the user out by removing the auth cookie
 */
export async function logout(): Promise<void> {
  cookies().delete('auth_token')
}

/**
 * Middleware function to check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUserFromToken()
  return !!user
}

/**
 * Function to check if user has admin role
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUserFromToken()
  return user ? user.role === 'admin' : false
}

/**
 * Function to check if user has buyer role
 */
export async function isBuyer(): Promise<boolean> {
  const user = await getUserFromToken()
  return user ? user.role === 'buyer' : false
}

/**
 * Function to check if user has supplier role
 */
export async function isSupplier(): Promise<boolean> {
  const user = await getUserFromToken()
  return user ? user.role === 'supplier' : false
}