import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { db, withErrorHandling } from '@/lib/db'
import { hashPassword, setAuthCookie, signToken } from '@/lib/auth'
import { insertUserSchema, users } from '@/schema'

// Registration request schema with additional validation
const registerSchema = insertUserSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      )
    }
    
    const userData = result.data
    
    // Check if username already exists
    const existingUser = await withErrorHandling(
      async () => {
        const [user] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, userData.username))
        
        return user
      },
      'Failed to check for existing user'
    )
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(userData.password)
    
    // Create the user
    const newUser = await withErrorHandling(
      async () => {
        const [user] = await db
          .insert(users)
          .values({
            ...userData,
            password: hashedPassword,
          })
          .returning({
            id: users.id,
            username: users.username,
            name: users.name,
            email: users.email,
            role: users.role,
            company: users.company,
            title: users.title,
            profileImage: users.profileImage,
            createdAt: users.createdAt,
          })
        
        return user
      },
      'Failed to create user'
    )
    
    // Generate JWT token
    const token = await signToken({
      id: newUser.id,
      username: newUser.username,
    })
    
    // Create response with user data
    const response = NextResponse.json(newUser, { status: 201 })
    
    // Set auth cookie with token
    await setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed', message: error.message },
      { status: 500 }
    )
  }
}