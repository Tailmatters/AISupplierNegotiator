import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { hashPassword, createToken, setAuthCookie } from '@/lib/auth'
import { users, insertUserSchema } from '@/schema'

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const result = insertUserSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', issues: result.error.issues },
        { status: 400 }
      )
    }
    
    const userData = result.data
    
    // Check if username already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, userData.username))
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }
    
    // Check if email already exists
    if (userData.email) {
      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, userData.email))
      
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // Insert user into database
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'buyer',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    
    // Create JWT token
    const token = await createToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })
    
    // Prepare user data (exclude password)
    const { password: _, ...safeUserData } = newUser
    
    // Create response
    const response = NextResponse.json(safeUserData, { status: 201 })
    
    // Set auth cookie
    setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed', message: error.message },
      { status: 500 }
    )
  }
}