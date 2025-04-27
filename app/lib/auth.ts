import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { compare, hash } from 'bcrypt'
import { db, getUserByUsername, getUserById, createUser } from '@/lib/db'
import { cookies } from 'next/headers'
import { users, insertUserSchema } from '@/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Constants
const JWT_SECRET = process.env.SESSION_SECRET || 'default-secret-change-me'
const COOKIE_NAME = 'auth-token'
const SALT_ROUNDS = 10
const TOKEN_EXPIRY = '7d'

// JWT token structure
interface JWTPayload {
  id: number
  username: string
  iat: number
  exp: number
}

// Authentication helper functions
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS)
}

export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainPassword, hashedPassword)
}

// Generate JWT token
async function generateToken(userId: number, username: string): Promise<string> {
  const encoder = new TextEncoder()
  const secretKey = encoder.encode(JWT_SECRET)
  
  return new SignJWT({ id: userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(secretKey)
}

// Set auth cookie with token
async function setAuthCookie(
  response: NextResponse,
  token: string
): Promise<void> {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  })
}

// Clear auth cookie
async function clearAuthCookie(response: NextResponse): Promise<void> {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
  })
}

// Validate auth token and extract payload
export async function validateToken(token: string): Promise<JWTPayload | null> {
  try {
    const encoder = new TextEncoder()
    const secretKey = encoder.encode(JWT_SECRET)
    
    const { payload } = await jwtVerify(token, secretKey)
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

// Get current user from the request cookie
export async function getCurrentUser(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value
  
  if (!token) {
    return null
  }
  
  const payload = await validateToken(token)
  
  if (!payload) {
    return null
  }
  
  return getUserById(payload.id)
}

// Login schema
const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
})

// Handle login request
export async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    const user = await getUserByUsername(validatedData.username)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    const passwordMatch = await comparePasswords(
      validatedData.password,
      user.password
    )
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    const token = await generateToken(user.id, user.username)
    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      { status: 200 }
    )
    
    await setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// Handle registration request
export async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = insertUserSchema.parse(body)
    
    // Check if username already exists
    const existingUser = await getUserByUsername(validatedData.username)
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create the user
    const newUser = await createUser({
      ...validatedData,
      password: hashedPassword,
    })
    
    // Generate JWT token
    const token = await generateToken(newUser.id, newUser.username)
    
    // Create response
    const response = NextResponse.json(
      {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      { status: 201 }
    )
    
    // Set auth cookie
    await setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid registration data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

// Handle logout request
export async function handleLogout() {
  try {
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    )
    
    await clearAuthCookie(response)
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

// Get current user's data
export async function getCurrentUserData(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    console.error('Get user error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get user data' },
      { status: 500 }
    )
  }
}