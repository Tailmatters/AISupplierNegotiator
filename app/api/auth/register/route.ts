import { NextRequest, NextResponse } from "next/server"
import { createUser, createSession } from "@/lib/auth"
import { insertUserSchema } from "@/schema"
import { z } from "zod"

// Extend the insert schema with additional validation
const registerSchema = insertUserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate request body
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid request data", errors: validation.error.errors },
        { status: 400 }
      )
    }
    
    // Remove confirmPassword as it's not part of our user model
    const { confirmPassword, ...userData } = validation.data
    
    try {
      // Create new user
      const user = await createUser(userData)
      
      // Create session
      await createSession(user)
      
      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user
      return NextResponse.json(userWithoutPassword, { status: 201 })
    } catch (error: any) {
      if (error.message === "Username already exists") {
        return NextResponse.json(
          { message: error.message },
          { status: 409 } // Conflict
        )
      }
      throw error // Re-throw for the outer catch
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: error.message || "Registration failed" },
      { status: 500 }
    )
  }
}