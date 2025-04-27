import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { users, type User, type InsertUser } from '@/schema'
import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// Hash a password for storage
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const buf = (await scryptAsync(password, salt, 64)) as Buffer
  return `${buf.toString('hex')}.${salt}`
}

// Compare a password with a stored hash
export async function comparePasswords(
  suppliedPassword: string,
  storedPassword: string
): Promise<boolean> {
  const [hashedPassword, salt] = storedPassword.split('.')
  const hashedBuf = Buffer.from(hashedPassword, 'hex')
  const suppliedBuf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer
  return timingSafeEqual(hashedBuf, suppliedBuf)
}

// Create a new user
export async function createUser(userData: InsertUser): Promise<User> {
  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, userData.username))
    .limit(1)

  if (existingUser.length > 0) {
    throw new Error('Username already exists')
  }

  // Hash the password
  const hashedPassword = await hashPassword(userData.password)

  // Insert the new user
  const [user] = await db
    .insert(users)
    .values({
      ...userData,
      password: hashedPassword,
    })
    .returning()

  return user
}

// Get a user by ID
export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1)

  return user
}

// Get a user by username
export async function getUserByUsername(username: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  return user
}

// Authenticate a user
export async function authenticateUser(
  username: string,
  password: string
): Promise<User | null> {
  const user = await getUserByUsername(username)
  
  if (!user) {
    return null
  }

  const isValid = await comparePasswords(password, user.password)
  
  if (!isValid) {
    return null
  }

  return user
}

// Get the current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const userIdCookie = await cookieStore.get('userId')
  
  if (!userIdCookie?.value) {
    return null
  }
  
  const userId = parseInt(userIdCookie.value, 10)
  const user = await getUserById(userId)
  
  return user || null
}

// Log out the current user
export async function logoutUser(): Promise<void> {
  const cookieStore = cookies()
  await cookieStore.delete('userId')
}

// Create session for user
export async function createSession(user: User): Promise<void> {
  const cookieStore = cookies()
  
  await cookieStore.set({
    name: 'userId',
    value: user.id.toString(),
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

// Check if user is authenticated, redirect if not
export async function requireAuth(redirectTo: string = '/auth'): Promise<User> {
  const cookieStore = cookies()
  const userIdCookie = await cookieStore.get('userId')
  
  if (!userIdCookie?.value) {
    redirect(redirectTo)
  }
  
  const userId = parseInt(userIdCookie.value, 10)
  const user = await getUserById(userId)
  
  if (!user) {
    redirect(redirectTo)
  }
  
  return user
}