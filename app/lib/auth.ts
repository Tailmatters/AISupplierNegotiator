import { db, users } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { compare, hash } from 'bcrypt'
import { randomBytes } from 'crypto'
import { InsertUser, User } from '@/schema'
import * as jose from 'jose'

// JWT settings
const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || randomBytes(32).toString('hex')
)
const JWT_ISSUER = 'ai-negotiator'
const JWT_AUDIENCE = 'ai-negotiator-users'
const JWT_EXPIRATION = '7d' // 7 days
const TOKEN_COOKIE_NAME = 'auth_token'

/**
 * Generate a JWT token for a user
 */
async function generateToken(user: User): Promise<string> {
  const payload = {
    sub: user.id.toString(),
    name: user.name,
    role: user.role,
    iss: JWT_ISSUER,
    aud: JWT_AUDIENCE,
  }

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET)
}

/**
 * Hash a password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10
  return await hash(password, saltRounds)
}

/**
 * Compare a password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

/**
 * Register a new user
 */
export async function registerUser(userData: InsertUser) {
  // Check if user with the same username already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, userData.username),
  })

  if (existingUser) {
    throw new Error('Username already exists')
  }

  // Hash the password
  const hashedPassword = await hashPassword(userData.password)

  // Create the user
  const [user] = await db
    .insert(users)
    .values({ ...userData, password: hashedPassword })
    .returning()

  return user
}

/**
 * Get a user by their username
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
  return await db.query.users.findFirst({
    where: eq(users.username, username),
  })
}

/**
 * Get the current authenticated user from the request
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })

    if (!payload.sub) {
      return null
    }

    const userId = parseInt(payload.sub)
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    return user || null
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Handle login request
 */
export async function handleLogin(request: Request) {
  const body = await request.json()
  const { username, password } = body

  if (!username || !password) {
    return NextResponse.json(
      { error: 'Username and password are required' },
      { status: 400 }
    )
  }

  const user = await getUserByUsername(username)

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
  }

  const passwordMatch = await comparePassword(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    )
  }

  const token = await generateToken(user)
  const response = NextResponse.json(user)

  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}

/**
 * Handle register request
 */
export async function handleRegister(request: Request) {
  const body = await request.json()

  try {
    const user = await registerUser(body)
    const token = await generateToken(user)
    const response = NextResponse.json(user)

    response.cookies.set({
      name: TOKEN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

/**
 * Handle logout request
 */
export async function handleLogout() {
  const response = NextResponse.json({ success: true })
  
  response.cookies.set({
    name: TOKEN_COOKIE_NAME,
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
 * Authentication middleware for API routes
 */
export async function authMiddleware(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // You can continue with the request, attaching user information
  return NextResponse.next()
}