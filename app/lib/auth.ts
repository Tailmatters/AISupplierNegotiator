import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify, SignJWT } from "jose"
import { getUserByEmail, getUserById } from "@/lib/db"
import { User } from "@/schema"
import { encode, decode } from "next-auth/jwt"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

// Authentication constants
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_EXISTS: "User with this email already exists",
  UNAUTHORIZED: "Unauthorized",
  INVALID_TOKEN: "Invalid token",
  SERVER_ERROR: "Server error",
}

// Secret for JWT
const JWT_SECRET = process.env.SESSION_SECRET || randomBytes(32).toString("hex")

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare password with hashed password
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// JWT Payload interface
export interface JWTPayload {
  id: number
  email: string
  name: string
  role: string
}

// Create a JWT token
export async function createToken(user: User): Promise<string> {
  const payload: JWTPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  }

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Expires in 7 days
    .sign(new TextEncoder().encode(JWT_SECRET))

  return token
}

// Verify a JWT token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    )
    
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

// Get the current authenticated user's ID from the token
export async function getServerUserId(): Promise<number | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value
    
    if (!token) {
      return null
    }
    
    const payload = await verifyToken(token)
    
    if (!payload) {
      return null
    }
    
    return payload.id
  } catch (error) {
    console.error("Error getting user ID:", error)
    return null
  }
}

// Get the current authenticated user
export async function getServerUser(): Promise<User | null> {
  try {
    const userId = await getServerUserId()
    
    if (!userId) {
      return null
    }
    
    const user = await getUserById(userId)
    
    if (!user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

// Get token from cookies
export async function getToken(req?: NextRequest): Promise<string | null> {
  if (req) {
    return req.cookies.get("token")?.value || null
  }
  
  const cookieStore = cookies()
  return cookieStore.get("token")?.value || null
}