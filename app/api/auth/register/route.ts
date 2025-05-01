import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createUser, getUserByEmail } from "@/lib/db"
import { hashPassword, createToken } from "@/lib/auth"
import { insertUserSchema } from "@/schema"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const validatedData = insertUserSchema.parse(body)
    
    // Check if user with the same email already exists
    const existingUser = await getUserByEmail(validatedData.email)
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user with hashed password
    const newUser = await createUser({
      ...validatedData,
      password: hashedPassword,
    })
    
    // Create token
    const token = await createToken(newUser)
    
    // Set token as cookie
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    // Return user data without password
    const { password, ...userWithoutPassword } = newUser
    
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid registration data", details: error.format() },
        { status: 400 }
      )
    }
    
    console.error("Registration error:", error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 400 }
    )
  }
}