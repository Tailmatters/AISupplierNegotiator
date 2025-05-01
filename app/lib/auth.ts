import { NextRequest } from "next/server"
import { jwtVerify, SignJWT } from "jose"
import { nanoid } from "nanoid"
import { getUserByEmail, getUserById } from "@/lib/db"
import { User } from "@/schema"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"

// Authentication constants
const TOKEN_COOKIE_NAME = "token"
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const SALT_ROUNDS = 10
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// Authentication error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  UNAUTHORIZED: "You must be logged in to access this resource",
  INVALID_TOKEN: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to access this resource",
}

// JWT payload interface
export interface JWTPayload {
  id: number
  email: string
  name: string
  role: string
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password from database
 * @returns Boolean indicating if passwords match
 */
export async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Create a JWT token for a user
 * @param user User object
 * @returns JWT token string
 */
export async function createToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setJti(nanoid())
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

/**
 * Verify a JWT token
 * @param token JWT token string
 * @returns Decoded JWT payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
      {
        algorithms: ["HS256"],
      }
    )

    return payload as JWTPayload
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

/**
 * Get the current user from a request
 * @param req Next.js request object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(req: NextRequest): Promise<User | null> {
  // Get token from cookie
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value

  if (!token) {
    return null
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    return null
  }

  // Get user from database
  const user = await getUserById(payload.id)

  return user || null
}

/**
 * Get token from server-side cookies
 * @returns JWT token string or null if not found
 */
export function getToken(): string | null {
  const cookieStore = cookies()
  const token = cookieStore.get(TOKEN_COOKIE_NAME)?.value

  return token || null
}

/**
 * Get the current user from server components
 * @returns User object or null if not authenticated
 */
export async function getServerUser(): Promise<User | null> {
  const token = getToken()

  if (!token) {
    return null
  }

  // Verify token
  const payload = await verifyToken(token)

  if (!payload) {
    return null
  }

  // Get user from database
  const user = await getUserById(payload.id)

  return user || null
}

/**
 * Authenticate a user with email and password
 * @param email User email
 * @param password User password
 * @returns Authenticated user or throws an error
 */
export async function authenticateUser(email: string, password: string): Promise<User> {
  const user = await getUserByEmail(email)

  if (!user) {
    throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS)
  }

  const isPasswordValid = await comparePasswords(password, user.password)

  if (!isPasswordValid) {
    throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS)
  }

  return user
}