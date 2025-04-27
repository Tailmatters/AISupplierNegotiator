'use server'

import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'

// Convert callback-based scrypt to Promise-based
const scryptAsync = promisify(scrypt)

// Name of the cookie that stores the auth token
const AUTH_COOKIE_NAME = 'auth_token'

// JWT settings
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'fallback_secret_only_for_development'
)
const JWT_EXPIRY = '7d' // Token expires after 7 days

// Type for JWT payload
interface JWTPayload {
  userId: number
  username: string
  role: string
}

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex')
  
  // Hash the password with the salt
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
  
  // Return both the derived key and salt, joining with a period
  return `${derivedKey.toString('hex')}.${salt}`
}

/**
 * Compare a password with a stored hash
 */
export async function comparePasswords(
  providedPassword: string,
  storedHash: string
): Promise<boolean> {
  try {
    // Split the stored hash into the hash and the salt
    const [hashedPassword, salt] = storedHash.split('.')
    
    // Hash the provided password with the same salt
    const derivedKey = (await scryptAsync(providedPassword, salt, 64)) as Buffer
    
    // Compare the hashed provided password with the stored hash
    const storedKey = Buffer.from(hashedPassword, 'hex')
    
    // Use timingSafeEqual to avoid timing attacks
    return timingSafeEqual(derivedKey, storedKey)
  } catch (error) {
    console.error('Error comparing passwords:', error)
    return false
  }
}

/**
 * Create a JWT token for a user and store it in a cookie
 */
export async function createToken(user: { id: number; username: string; role: string }): Promise<string> {
  try {
    // Create the JWT payload
    const payload: JWTPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    }
    
    // Sign the JWT
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRY)
      .sign(JWT_SECRET)
    
    // Store the token in a cookie
    cookies().set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    })
    
    return token
  } catch (error) {
    console.error('Error creating token:', error)
    throw new Error('Failed to create authentication token')
  }
}

/**
 * Get the current user from the auth token in the cookie
 * Returns null if no user is authenticated
 */
export async function getUserFromToken() {
  try {
    // Get the token from the cookie
    const token = cookies().get(AUTH_COOKIE_NAME)
    
    // If no token, user is not authenticated
    if (!token) {
      return null
    }
    
    // Verify the token
    const { payload } = await jwtVerify(token.value, JWT_SECRET)
    const { userId } = payload as JWTPayload
    
    // Get the user from the database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    
    // If no user found, return null
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
 * Log out the current user by removing the auth cookie
 */
export async function logout(): Promise<void> {
  try {
    // Delete the auth cookie
    cookies().delete(AUTH_COOKIE_NAME)
  } catch (error) {
    console.error('Error logging out:', error)
    throw new Error('Failed to log out')
  }
}