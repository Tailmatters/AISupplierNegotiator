import { db } from "@/lib/db"
import { createHash, randomBytes, timingSafeEqual } from "crypto"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { User, insertUserSchema, users } from "@/schema"
import { eq } from "drizzle-orm"

// Session constants
const SESSION_COOKIE = "session_id"
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000 // 30 days

interface Session {
  id: string
  userId: number
  expires: Date
}

// In-memory session storage (in production, use Redis or a database)
const sessions = new Map<string, Session>()

// Helper to hash passwords
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex")
  return new Promise((resolve, reject) => {
    createHash("sha256")
      .update(password + salt)
      .digest("hex") + "." + salt
      .then(resolve)
      .catch(reject)
  })
}

// Helper to compare passwords
export async function comparePasswords(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split(".")
  const suppliedHash = await new Promise<string>((resolve, reject) => {
    createHash("sha256")
      .update(supplied + salt)
      .digest("hex")
      .then(resolve)
      .catch(reject)
  })
  
  return timingSafeEqual(
    Buffer.from(suppliedHash),
    Buffer.from(hashed)
  )
}

// User registration
export async function registerUser(userData: any): Promise<User> {
  // Parse and validate user data
  const parsedUser = insertUserSchema.parse(userData)
  
  // Check if user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.username, parsedUser.username),
  })
  
  if (existingUser) {
    throw new Error("Username already exists")
  }
  
  // Hash password
  const hashedPassword = await hashPassword(parsedUser.password)
  
  // Insert user
  const [user] = await db
    .insert(users)
    .values({
      ...parsedUser,
      password: hashedPassword,
    })
    .returning()
  
  return user
}

// User login
export async function loginUser(
  username: string,
  password: string
): Promise<User> {
  // Find user
  const user = await db.query.users.findFirst({
    where: eq(users.username, username),
  })
  
  if (!user) {
    throw new Error("Invalid username or password")
  }
  
  // Verify password
  const isValidPassword = await comparePasswords(password, user.password)
  
  if (!isValidPassword) {
    throw new Error("Invalid username or password")
  }
  
  return user
}

// Create a session
export async function createSession(
  userId: number,
  req: NextRequest
): Promise<NextResponse> {
  // Create session ID
  const sessionId = randomBytes(32).toString("hex")
  
  // Set expiry
  const expires = new Date(Date.now() + SESSION_EXPIRY)
  
  // Store session
  sessions.set(sessionId, {
    id: sessionId,
    userId,
    expires,
  })
  
  // Set cookie
  const cookieStore = cookies()
  await cookieStore.set({
    name: SESSION_COOKIE,
    value: sessionId,
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  })
  
  return NextResponse.json({ success: true })
}

// Delete a session (logout)
export async function deleteSession(req: NextRequest): Promise<NextResponse> {
  const cookieStore = cookies()
  const sessionId = await cookieStore.get(SESSION_COOKIE)?.value
  
  if (sessionId) {
    // Remove from storage
    sessions.delete(sessionId)
    
    // Clear cookie
    await cookieStore.delete(SESSION_COOKIE)
  }
  
  return NextResponse.json({ success: true })
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies()
  const sessionId = await cookieStore.get(SESSION_COOKIE)?.value
  
  if (!sessionId) {
    return null
  }
  
  const session = sessions.get(sessionId)
  
  if (!session || session.expires < new Date()) {
    // Session expired
    if (session) {
      sessions.delete(sessionId)
    }
    return null
  }
  
  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  })
  
  return user || null
}