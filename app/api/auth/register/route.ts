import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, insertUserSchema } from '@/schema'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationSchema = insertUserSchema.extend({
      password: z.string().min(6, 'Password must be at least 6 characters'),
      username: z.string().min(3, 'Username must be at least 3 characters'),
    })

    const validatedData = validationSchema.parse(body)
    
    // Check if username is already taken
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, validatedData.username))
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        ...validatedData,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
      })
    
    // Create token
    const token = await createToken({ userId: user.id })
    
    // Create response
    const response = NextResponse.json(user)
    
    // Set cookie
    setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }))
      
      return NextResponse.json(
        { error: 'Validation error', details: errorMessages },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}