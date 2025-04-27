import { getDb } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import * as schema from '@/schema'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import type { User } from '@/schema'
import { SignJWT, jwtVerify } from 'jose'

// When generating the secret key, use a secure random generator like this:
// require('crypto').randomBytes(32).toString('hex')
// This should be stored in your environment variables
const JWT_SECRET = process.env.SESSION_SECRET || 'default_secret_replace_in_production'
const COOKIE_NAME = 'auth_token'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

const scryptAsync = promisify(scrypt)

/**
 * Hashes a password using scrypt
 * @param password The password to hash
 * @returns A string in the format 'hash.salt'
 */
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

/**
 * Compares a supplied password with a stored hash
 * @param suppliedPassword The password to check
 * @param storedPassword The stored password hash
 * @returns True if the passwords match
 */
async function comparePasswords(suppliedPassword: string, storedPassword: string): Promise<boolean> {
  const [hashedPassword, salt] = storedPassword.split('.')
  const hashedPasswordBuf = Buffer.from(hashedPassword, 'hex')
  const suppliedPasswordBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer
  return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf)
}

/**
 * Creates a JWT token for a user
 * @param user The user to create a token for
 * @returns A JWT token
 */
async function createToken(user: Pick<User, 'id' | 'username' | 'role'>): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id, 
    username: user.username,
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(JWT_SECRET))
  
  return token
}

/**
 * Verifies a JWT token
 * @param token The token to verify
 * @returns The decoded token payload if valid, null otherwise
 */
async function verifyToken(token: string): Promise<{ id: number, username: string, role: string } | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    
    return {
      id: payload.id as number,
      username: payload.username as string,
      role: payload.role as string
    }
  } catch (error) {
    return null
  }
}

/**
 * Gets the current authenticated user
 * @returns The user if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const token = cookies().get(COOKIE_NAME)?.value
    
    if (!token) {
      return null
    }
    
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return null
    }
    
    const db = getDb()
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, decoded.id))
    
    return user || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Handles user login
 * @param req The request object
 * @returns A response with the user data and a cookie if successful
 */
export async function handleLogin(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
    
    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    const token = await createToken(user)
    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
    
    // Set cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}

/**
 * Handles user registration
 * @param req The request object
 * @returns A response with the user data and a cookie if successful
 */
export async function handleRegister(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { username, password, email, name, role } = body
    
    if (!username || !password || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const db = getDb()
    
    // Check if username already exists
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }
    
    const hashedPassword = await hashPassword(password)
    
    // Insert new user
    const [user] = await db
      .insert(schema.users)
      .values({
        username,
        password: hashedPassword,
        email,
        name,
        role: role || 'buyer',
      })
      .returning()
    
    const token = await createToken(user)
    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
    
    // Set cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: MAX_AGE,
    })
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}

/**
 * Handles user logout
 * @returns A response with a cleared cookie
 */
export async function handleLogout(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true })
  
  // Clear the cookie
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
  
  return response
}