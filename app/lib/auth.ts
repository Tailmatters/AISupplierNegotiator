import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwt } from "next-auth/jwt"
import * as db from "@/lib/db"
import * as schema from "@/schema"
import bcrypt from "bcryptjs"

// Constants
const JWT_SECRET = process.env.SESSION_SECRET || "super-secret-key-change-in-production"
const TOKEN_NAME = "auth_token"
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

// JWT token type
type JwtToken = {
  id: number
  name: string
  email: string
  role: string
  iat: number
  exp: number
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  const isValid = await bcrypt.compare(password, hashedPassword)
  return isValid
}

/**
 * Create a JWT token for a user
 */
export async function createToken(user: schema.User): Promise<string> {
  const { id, name, email, role } = user
  
  // Create the JWT token
  const token = await jwt.encode({
    secret: JWT_SECRET,
    token: {
      id,
      name,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_MAX_AGE,
    },
  })
  
  return token
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JwtToken | null> {
  try {
    // Verify and decode the JWT token
    const decoded = await jwt.decode({
      token,
      secret: JWT_SECRET,
    })
    
    return decoded as JwtToken
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

/**
 * Set the auth token cookie
 */
export async function setAuthCookie(
  response: NextResponse,
  token: string
): Promise<void> {
  // Set the auth cookie with the token
  cookies().set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
    sameSite: "lax",
  })
}

/**
 * Get the auth token from cookies
 */
export async function getAuthCookie(): Promise<string | undefined> {
  // Get the auth cookie
  const cookie = cookies().get(TOKEN_NAME)
  return cookie?.value
}

/**
 * Clear the auth token cookie
 */
export async function clearAuthCookie(): Promise<void> {
  // Clear the auth cookie
  cookies().delete(TOKEN_NAME)
}

/**
 * Get the current user from the request
 */
export async function getServerUser(): Promise<schema.User | null> {
  try {
    // Get the token from cookie
    const token = await getAuthCookie()
    
    if (!token) {
      return null
    }
    
    // Verify and decode the token
    const decoded = await verifyToken(token)
    
    if (!decoded || !decoded.id) {
      return null
    }
    
    // Get the user from the database
    const user = await db.getUserById(decoded.id)
    return user
  } catch (error) {
    console.error("Error getting user from token:", error)
    return null
  }
}

/**
 * Require authentication middleware
 */
export async function requireAuth(
  request: NextRequest
): Promise<{ authenticated: boolean; user: schema.User | null }> {
  try {
    // Get the token from cookie
    const token = await getAuthCookie()
    
    if (!token) {
      return { authenticated: false, user: null }
    }
    
    // Verify and decode the token
    const decoded = await verifyToken(token)
    
    if (!decoded || !decoded.id) {
      return { authenticated: false, user: null }
    }
    
    // Get the user from the database
    const user = await db.getUserById(decoded.id)
    
    if (!user) {
      return { authenticated: false, user: null }
    }
    
    return { authenticated: true, user }
  } catch (error) {
    console.error("Error in requireAuth:", error)
    return { authenticated: false, user: null }
  }
}