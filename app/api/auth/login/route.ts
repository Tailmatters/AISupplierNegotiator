import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { compare } from "bcryptjs"
import { db } from "@/lib/db"
import { createToken, setAuthCookie } from "@/lib/auth"
import { users, type User } from "@/schema"
import { eq } from "drizzle-orm"

// Validation schema for login request
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { username, password } = result.data
    
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await compare(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      )
    }
    
    // Update last login time
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id))
    
    // Create JWT token
    const token = await createToken({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    
    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
    
    // Set auth cookie
    setAuthCookie(token, response)
    
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    )
  }
}