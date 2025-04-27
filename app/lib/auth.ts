import { getDb, executeQuery } from '@/lib/db'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { users, type User, type InsertUser } from '@/schema'
import { and, eq } from 'drizzle-orm'
import { promisify } from 'util'

// Convert callback-based scrypt to promise-based
const scryptAsync = promisify(scrypt)

// Generate a JWT secret if one isn't provided
if (!process.env.SESSION_SECRET) {
  console.warn('Missing SESSION_SECRET environment variable. Using a random one for now.')
  process.env.SESSION_SECRET = randomBytes(32).toString('hex')
}

/**
 * Hash a password using scrypt with a random salt
 */
export async function hashPassword(password: string): Promise<string> {
  // Generate a random salt
  const salt = randomBytes(16).toString('hex')
  // Hash the password with the salt
  const hash = await scryptAsync(password, salt, 64) as Buffer
  // Join the hash and salt with a dot
  return `${hash.toString('hex')}.${salt}`
}

/**
 * Compare a plaintext password with a stored hash
 */
export async function comparePasswords(plaintext: string, stored: string): Promise<boolean> {
  // Split the stored hash and salt
  const [hash, salt] = stored.split('.')
  // Hash the plaintext password with the stored salt
  const hashBuffer = Buffer.from(hash, 'hex')
  const suppliedHashBuffer = await scryptAsync(plaintext, salt, 64) as Buffer
  // Compare the hashed passwords
  return timingSafeEqual(hashBuffer, suppliedHashBuffer)
}

/**
 * Create a new user
 */
export async function createUser(userData: Omit<InsertUser, 'password'> & { password: string }): Promise<User> {
  // Hash the password before storing
  const hashedPassword = await hashPassword(userData.password)
  
  // Insert the user into the database
  return executeQuery(async (db) => {
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword
      })
      .returning()
    
    return newUser
  })
}

/**
 * Find a user by ID
 */
export async function getUserById(id: number): Promise<User | undefined> {
  return executeQuery(async (db) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
    
    return user
  })
}

/**
 * Find a user by username
 */
export async function getUserByUsername(username: string): Promise<User | undefined> {
  return executeQuery(async (db) => {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    
    return user
  })
}

/**
 * Authenticate a user with username and password
 */
export async function authenticateUser(username: string, password: string): Promise<User | null> {
  const user = await getUserByUsername(username)
  if (!user) return null
  
  const isValid = await comparePasswords(password, user.password)
  if (!isValid) return null
  
  return user
}

// Session cookie name
const SESSION_COOKIE_NAME = 'app.session'

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
}

/**
 * Create a session for a user
 */
export async function createSession(user: User, response?: NextResponse): Promise<NextResponse | void> {
  const session = {
    userId: user.id,
    username: user.username,
    name: user.name,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  }
  
  const sessionStr = JSON.stringify(session)
  const cookieStore = cookies()
  
  if (response) {
    // For API routes
    response.cookies.set(SESSION_COOKIE_NAME, sessionStr, cookieOptions)
    return response
  } else {
    // For server actions
    cookieStore.set(SESSION_COOKIE_NAME, sessionStr, cookieOptions)
  }
}

/**
 * Get the current user session
 */
export async function getSession(): Promise<{ userId: number; exp: number } | null> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
  
  if (!sessionCookie) return null
  
  try {
    const session = JSON.parse(sessionCookie.value)
    // Check if session is expired
    if (session.exp < Date.now()) {
      return null
    }
    return session
  } catch (error) {
    console.error('Error parsing session cookie:', error)
    return null
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) return null
  
  const user = await getUserById(session.userId)
  return user || null
}

/**
 * Clear the session
 */
export async function clearSession(response?: NextResponse): Promise<NextResponse | void> {
  const cookieStore = cookies()
  
  if (response) {
    // For API routes
    response.cookies.delete(SESSION_COOKIE_NAME)
    return response
  } else {
    // For server actions
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

/**
 * Handle login requests
 */
export async function handleLogin(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json()
    const { username, password } = data
    
    // Authenticate the user
    const user = await authenticateUser(username, password)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' }, 
        { status: 401 }
      )
    }
    
    // Create a session
    const response = NextResponse.json({ 
      id: user.id, 
      username: user.username, 
      name: user.name,
      role: user.role
    })
    return await createSession(user, response) as NextResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' }, 
      { status: 500 }
    )
  }
}

/**
 * Handle registration requests
 */
export async function handleRegister(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await request.json()
    const { username, password, name, email } = data
    
    // Check if username already exists
    const existingUser = await getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' }, 
        { status: 400 }
      )
    }
    
    // Create the user
    const user = await createUser({
      username,
      password,
      name,
      email,
      role: 'buyer', // Default role
    })
    
    // Create a session
    const response = NextResponse.json({ 
      id: user.id, 
      username: user.username, 
      name: user.name,
      role: user.role
    }, { status: 201 })
    return await createSession(user, response) as NextResponse
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' }, 
      { status: 500 }
    )
  }
}

/**
 * Handle logout requests
 */
export async function handleLogout(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true })
  await clearSession(response)
  return response
}