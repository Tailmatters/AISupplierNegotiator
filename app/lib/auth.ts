import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { users } from '@/schema'
import bcrypt from 'bcrypt'
import { z } from 'zod'

const secretKey = process.env.SESSION_SECRET || 'this_is_not_secure_change_in_production'
const key = new TextEncoder().encode(secretKey)

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
})

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  role: z.enum(['admin', 'buyer', 'supplier']).default('buyer'),
})

// Login handler
export async function handleLogin(request: NextRequest) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    
    const { username, password } = result.data
    
    const [user] = await db.select().from(users).where(eq(users.username, username))
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Create JWT token
    const token = await new SignJWT({ 
      id: user.id, 
      username: user.username,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key)
    
    // Set cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    })
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Register handler
export async function handleRegister(request: NextRequest) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error.format() }, { status: 400 })
    }
    
    const { username, name, email, password, role } = result.data
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username))
    
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 })
    }
    
    // Check if email is already used
    const existingEmail = await db.select().from(users).where(eq(users.email, email))
    
    if (existingEmail.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      name,
      email,
      password: hashedPassword,
      role
    }).returning()
    
    // Create JWT token
    const token = await new SignJWT({ 
      id: newUser.id, 
      username: newUser.username,
      role: newUser.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key)
    
    // Set cookie
    cookies().set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
    })
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    
    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Logout handler
export async function handleLogout() {
  cookies().set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  })
  
  return NextResponse.json({ success: true })
}

// Get user from request
export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value
    
    if (!token) {
      return null
    }
    
    const { payload } = await jwtVerify(token, key)
    
    if (!payload || !payload.id) {
      return null
    }
    
    const [user] = await db.select().from(users).where(eq(users.id, Number(payload.id)))
    
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

// Middleware to check if user is authenticated
export async function isAuthenticated(request: NextRequest) {
  const user = await getUserFromRequest(request)
  return !!user
}

// Middleware to check if user has required role
export async function hasRole(request: NextRequest, requiredRole: string) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return false
  }
  
  return user.role === requiredRole
}