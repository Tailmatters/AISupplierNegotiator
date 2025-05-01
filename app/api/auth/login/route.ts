import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { db } from '@/lib/db'
import { createToken, comparePasswords, setAuthCookie } from '@/lib/auth'
import { users } from '@/schema'

// Login validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request body
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', issues: result.error.issues },
        { status: 400 }
      )
    }
    
    const { username, password } = result.data
    
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    
    // Check if user exists and password is correct
    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Create JWT token with user data
    const token = await createToken({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    
    // Prepare user data (exclude password)
    const { password: _, ...userData } = user
    
    // Create response
    const response = NextResponse.json(userData, { status: 200 })
    
    // Set auth cookie
    setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', message: error.message },
      { status: 500 }
    )
  }
}