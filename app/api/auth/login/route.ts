import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authenticateUser, createToken } from "@/lib/auth"
import { loginSchema } from "@/schema"
import { z } from "zod"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const validatedData = loginSchema.parse(body)
    
    // Authenticate user
    const user = await authenticateUser(validatedData.email, validatedData.password)
    
    // Create token
    const token = await createToken(user)
    
    // Set token as cookie
    const cookieStore = cookies()
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid login data", details: error.format() },
        { status: 400 }
      )
    }
    
    console.error("Login error:", error)
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Authentication failed" },
      { status: 401 }
    )
  }
}