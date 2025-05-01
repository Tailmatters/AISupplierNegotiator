import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createUser, getUserByEmail } from "@/lib/db"
import { hashPassword, createToken } from "@/lib/auth"
import { insertUserSchema } from "@/schema"

// Extended schema for registration with validation
const registerSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate input with zod
    const validatedData = registerSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const userData = validatedData.data
    
    // Check if email is already in use
    const existingUser = await getUserByEmail(userData.email)
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already in use" },
        { status: 409 }
      )
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(userData.password)
    
    // Create new user with hashed password
    const newUser = await createUser({
      ...userData,
      password: hashedPassword,
    })
    
    // Generate JWT token
    const token = await createToken(newUser)
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser
    
    // Set cookie with the JWT token
    const response = NextResponse.json(userWithoutPassword, { status: 201 })
    
    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    return response
  } catch (error: any) {
    console.error("Registration error:", error)
    
    return NextResponse.json(
      { error: "Failed to create user: " + error.message },
      { status: 500 }
    )
  }
}