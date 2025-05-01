import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { db, withErrorHandling } from '@/lib/db'
import { comparePasswords, setAuthCookie, signToken } from '@/lib/auth'
import { users } from '@/schema'

// Login request schema validation
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const result = loginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: result.error.format() },
        { status: 400 }
      )
    }
    
    const { username, password } = result.data
    
    // Find user by username
    const user = await withErrorHandling(
      async () => {
        const [user] = await db
          .select({
            id: users.id,
            username: users.username,
            password: users.password,
            name: users.name,
            email: users.email,
            role: users.role,
          })
          .from(users)
          .where(eq(users.username, username))
          
        return user
      },
      'Failed to fetch user during login'
    )
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Generate JWT token
    const token = await signToken({
      id: user.id,
      username: user.username,
    })
    
    // Create user data without password
    const { password: _, ...userData } = user
    
    // Create response with user data
    const response = NextResponse.json(userData, { status: 200 })
    
    // Set auth cookie with token
    await setAuthCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Authentication failed', message: error.message },
      { status: 500 }
    )
  }
}