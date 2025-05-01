import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { getUserByEmail } from "@/lib/db"
import { AUTH_ERRORS, authenticateUser, createToken } from "@/lib/auth"
import { loginSchema } from "@/schema"

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    
    // Validate input with zod
    const validatedData = loginSchema.safeParse(body)
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { email, password } = validatedData.data
    
    try {
      // Authenticate user
      const user = await authenticateUser(email, password)
      
      // Generate JWT token
      const token = await createToken(user)
      
      // Create response with user data (excluding password)
      const { password: _, ...userWithoutPassword } = user
      
      // Set cookie with the JWT token
      const response = NextResponse.json(userWithoutPassword)
      
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
      return NextResponse.json(
        { error: error.message || AUTH_ERRORS.INVALID_CREDENTIALS },
        { status: 401 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "Server error: " + error.message },
      { status: 500 }
    )
  }
}