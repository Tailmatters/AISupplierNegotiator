import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { comparePasswords, createToken } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for login request
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    
    // Validate request data
    const validationResult = loginSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    const { username, password } = validationResult.data
    
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    
    // If user not found or password doesn't match
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isValidPassword = await comparePasswords(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Update last login time
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id))
    
    // Create JWT token and set as cookie
    await createToken(user)
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user
    
    // Return success response
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}