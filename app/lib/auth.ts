import { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { db, getUserByEmail, getUserById } from "@/lib/db"
import { type User } from "@/schema"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Constants for JWT configuration
const JWT_SECRET = process.env.SESSION_SECRET || "fallback_secret_for_development_only"
const JWT_EXPIRES_IN = "7d"

// Authentication error messages
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  UNAUTHORIZED: "Unauthorized access",
  MISSING_TOKEN: "Authentication token missing",
  INVALID_TOKEN: "Invalid or expired token",
}

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

// JWT payload interface
export interface JWTPayload {
  id: number
  username: string
  email: string
  name: string | null
  role: string
}

/**
 * Create a JWT token for the authenticated user
 * @param user User object to encode in the token
 * @returns JWT token string
 */
export async function createToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  const secretKey = new TextEncoder().encode(JWT_SECRET)
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey)
  
  return token
}

/**
 * Verify a JWT token and extract the payload
 * @param token JWT token string
 * @returns JWT payload if token is valid
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jwtVerify(token, secretKey)
    
    return payload as JWTPayload
  } catch (error) {
    throw new Error(AUTH_ERRORS.INVALID_TOKEN)
  }
}

/**
 * Get the current user from the request cookies
 * @param request Next.js request object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const token = request.cookies.get("token")?.value
  
  if (!token) {
    return null
  }
  
  try {
    const payload = await verifyToken(token)
    const user = await getUserById(payload.id)
    
    if (!user) {
      return null
    }
    
    return user
  } catch (error) {
    return null
  }
}

/**
 * Get the current user from the server component context
 * @returns User object or null if not authenticated
 */
export async function getServerUser(): Promise<User | null> {
  const token = cookies().get("token")?.value
  
  if (!token) {
    return null
  }
  
  try {
    const payload = await verifyToken(token)
    const user = await getUserById(payload.id)
    
    if (!user) {
      return null
    }
    
    return user
  } catch (error) {
    return null
  }
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password
 * @param hashedPassword Hashed password
 * @returns True if passwords match
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Authenticate a user with email and password
 * @param email User email
 * @param password User password
 * @returns User object if authentication successful
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<User> {
  const user = await getUserByEmail(email)
  
  if (!user) {
    throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS)
  }
  
  const passwordValid = await comparePasswords(password, user.password)
  
  if (!passwordValid) {
    throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS)
  }
  
  return user
}