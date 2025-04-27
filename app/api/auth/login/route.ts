import { NextRequest, NextResponse } from "next/server"
import { loginUser, createSession } from "@/lib/auth"
import { z } from "zod"

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    
    // Validate with zod schema
    const { username, password } = loginSchema.parse(body)
    
    // Authenticate the user
    const user = await loginUser(username, password)
    
    // Create a session
    await createSession(user.id, req)
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
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