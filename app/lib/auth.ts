import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { users, type User, type InsertUser } from '@/schema'
import { SignJWT, jwtVerify } from 'jose'

const scryptAsync = promisify(scrypt)

// Secret key for JWT signing - should be in env var
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-me-for-production'
)

// Token expiration time (1 day)
const TOKEN_EXPIRATION_TIME = 60 * 60 * 24

/**
 * Hash a password with salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

/**
 * Compare a password against a stored hash
 */
export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split('.')
  const hashedBuf = Buffer.from(hashed, 'hex')
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer
  return timingSafeEqual(hashedBuf, suppliedBuf)
}

/**
 * Generate a JWT token for a user
 */
export async function generateToken(user: User): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id, 
    username: user.username,
    role: user.role 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRATION_TIME}s`)
    .sign(JWT_SECRET)

  return token
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Get the current user from the session cookie
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value
    
    if (!token) {
      return null
    }
    
    const payload = await verifyToken(token)
    if (!payload || typeof payload.id !== 'number') {
      return null
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
    
    if (!user) {
      return null
    }
    
    // Exclude password from the returned user
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword as User
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Handle login requests
 */
export async function handleLogin(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    
    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    const token = await generateToken(user)
    
    const response = NextResponse.json(
      {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      { status: 200 }
    )
    
    // Set the cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRATION_TIME,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle register requests
 */
export async function handleRegister(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.username || !body.password || !body.email || !body.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if username already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, body.username))
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(body.password)
    
    // Create the user
    const userData: InsertUser = {
      username: body.username,
      password: hashedPassword,
      email: body.email,
      name: body.name,
      role: body.role || 'buyer',
      company: body.company,
      jobTitle: body.jobTitle,
      phone: body.phone,
    }
    
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        name: users.name,
        role: users.role,
      })
    
    const token = await generateToken(newUser as User)
    
    const response = NextResponse.json(newUser, { status: 201 })
    
    // Set the cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: TOKEN_EXPIRATION_TIME,
      path: '/',
    })
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle logout requests
 */
export async function handleLogout() {
  const response = NextResponse.json({ success: true })
  
  response.cookies.set({
    name: 'token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })
  
  return response
}