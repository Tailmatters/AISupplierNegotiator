import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import { db } from "@/lib/db"
import { users, type User } from "@/schema"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

// Token expiration
const TOKEN_EXPIRATION = "8h"

// Authentication token cookie name
export const AUTH_COOKIE = "auth_token"

// Secret key for JWT signing
const JWT_SECRET = process.env.SESSION_SECRET || "a-very-secret-key-that-should-be-in-env"

// User payload for JWT
export interface JWTPayload {
  id: number
  username: string
  email: string
  name: string
  role: string
}

/**
 * Generate a hashed password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compare plain text password with hashed password
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns Whether passwords match
 */
export async function comparePasswords(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Create a JWT token for a user
 * @param user User object
 * @returns JWT token
 */
export async function createToken(user: JWTPayload): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

/**
 * Verify a JWT token
 * @param token JWT token
 * @returns User payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    
    return payload as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Get the current user from the JWT token
 * @param req Next.js request object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(req?: NextRequest): Promise<User | null> {
  try {
    // Get token from cookies (server-side)
    let token: string | undefined
    
    if (req) {
      // For middleware use
      token = req.cookies.get(AUTH_COOKIE)?.value
    } else {
      // For route handlers and server components
      const cookieStore = cookies()
      token = cookieStore.get(AUTH_COOKIE)?.value
    }
    
    if (!token) {
      return null
    }
    
    const payload = await verifyToken(token)
    if (!payload) {
      return null
    }
    
    // Get user from database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.id))
    
    if (!user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Set an authentication cookie in the response
 * @param token JWT token
 * @param response NextResponse object
 */
export function setAuthCookie(token: string, response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours in seconds
  })
}

/**
 * Clear the authentication cookie
 * @param response NextResponse object
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  })
}

/**
 * Get the JWT token from request cookies
 * @param req NextRequest object
 * @returns JWT token or null if not found
 */
export function getTokenFromRequest(req: NextRequest): string | null {
  const token = req.cookies.get(AUTH_COOKIE)?.value
  return token || null
}

/**
 * Update a user's password
 * @param userId User ID
 * @param newPassword New password (plain text)
 * @returns Whether password was updated successfully
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<boolean> {
  try {
    const hashedPassword = await hashPassword(newPassword)
    
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, userId))
    
    return true
  } catch (error) {
    console.error("Error updating user password:", error)
    return false
  }
}

/**
 * Get user cookie from server component
 * @returns JWT token from cookies
 */
export async function getUserCookie(): Promise<string | undefined> {
  return cookies().get(AUTH_COOKIE)?.value
}