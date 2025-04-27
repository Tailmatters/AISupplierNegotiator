import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { insertUserSchema, users } from '@/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, createToken } from '@/lib/auth'
import { z } from 'zod'

// Extend the insert schema with password validation
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    // Get user data from request body
    const userData = await request.json()
    
    // Validate input
    const result = registerSchema.safeParse(userData)
    
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.error.format() },
        { status: 400 }
      )
    }
    
    // Check if user already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1)
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 400 }
      )
    }
    
    // Check if email already exists
    const [existingEmail] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1)
    
    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning()
    
    // Create JWT token and set cookie
    await createToken(user)
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    )
  }
}