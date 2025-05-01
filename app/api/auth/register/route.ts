import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth"
import { users, insertUserSchema, type User } from "@/schema"
import { eq } from "drizzle-orm"

// Validation schema for registration
const registerSchema = insertUserSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { confirmPassword, ...userData } = result.data
    
    // Check if username already exists
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username))
    
    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      )
    }
    
    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
    
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // Create user
    const [newUser] = await db
      .insert(users)
      .values({ ...userData, password: hashedPassword })
      .returning()
    
    // Create JWT token
    const token = await createToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })
    
    // Create response
    const response = NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    })
    
    // Set auth cookie
    setAuthCookie(token, response)
    
    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    )
  }
}