import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { db } from './db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { compare, hash } from 'bcrypt'

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback-secret-do-not-use-in-production'

// Cookie name for the auth token
const AUTH_COOKIE = 'auth-token'

// JWT expiration time (24 hours)
const EXPIRES_IN = '24h'

// User schemas
const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(5)
})

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(5),
  name: z.string().optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'buyer', 'supplier']).default('buyer')
})

/**
 * Create a new JWT token
 */
async function createToken(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(new TextEncoder().encode(JWT_SECRET))
  
  return token
}

/**
 * Verify and decode a JWT token
 */
async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    return payload
  } catch (error) {
    return null
  }
}

/**
 * Get user from JWT token in request
 */
export async function getUserFromRequest(request: NextRequest) {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE)?.value || request.headers.get('Authorization')?.split(' ')[1]
  
  if (!token) return null
  
  const payload = await verifyToken(token)
  if (!payload || !payload.id) return null
  
  // Fetch user from database
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, Number(payload.id)))
  
  return user || null
}

/**
 * Handle login request
 */
export async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, validatedData.username))
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await compare(validatedData.password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Create token
    const token = await createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    })
    
    // Get user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
    }
    
    // Set cookie
    const response = NextResponse.json(userData)
    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle register request
 */
export async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)
    
    // Check if username already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, validatedData.username))
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hash(validatedData.password, 10)
    
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        username: validatedData.username,
        password: hashedPassword,
        name: validatedData.name || null,
        email: validatedData.email || null,
        role: validatedData.role,
      })
      .returning({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
      })
    
    // Create token
    const token = await createToken({
      id: user.id,
      username: user.username,
      role: user.role,
    })
    
    // Set cookie
    const response = NextResponse.json(user)
    response.cookies.set({
      name: AUTH_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle logout request
 */
export async function handleLogout(request: NextRequest) {
  // Clear auth cookie
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: AUTH_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  
  return response
}

/**
 * Middleware to protect routes
 */
export function withAuth(
  handler: (req: NextRequest, user: any) => Promise<Response>,
  options?: { roles?: string[] }
) {
  return async (req: NextRequest) => {
    const user = await getUserFromRequest(req)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check role permissions
    if (options?.roles && !options.roles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    
    return handler(req, user)
  }
}