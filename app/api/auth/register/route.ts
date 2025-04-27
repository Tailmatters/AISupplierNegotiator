import { NextRequest, NextResponse } from "next/server"
import { registerUser, createSession } from "@/lib/auth"
import { insertUserSchema } from "@/schema"
import { ZodError } from "zod"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    
    // Validate with zod schema
    const validatedData = insertUserSchema.parse(body)
    
    // Register the user
    const user = await registerUser(validatedData)
    
    // Create a session
    await createSession(user.id, req)
    
    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword, { status: 201 })
    
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
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