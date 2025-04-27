import { NextRequest, NextResponse } from "next/server"
import { authenticateUser, createSession } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    const { username, password } = validation.data
    
    // Authenticate user
    const user = await authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      )
    }
    
    // Create session
    await createSession(user)
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { message: error.message || "Authentication failed" },
      { status: 500 }
    )
  }
}