import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth"
import { loginSchema } from "@/schema"
import * as db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      )
    }
    
    // Get user from database
    const user = await db.getUserByEmail(body.email)
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await verifyPassword(body.password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Create JWT token
    const token = await createToken(user)
    
    // Create response
    const response = NextResponse.json(
      { 
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        jobTitle: user.jobTitle,
      },
      { status: 200 }
    )
    
    // Set auth cookie
    await setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}