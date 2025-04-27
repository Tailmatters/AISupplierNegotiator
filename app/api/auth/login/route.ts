import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { comparePasswords, createToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Get credentials from request body
    const { username, password } = await request.json()
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    // Find user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1)
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Create JWT token and set cookie
    await createToken(user)
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    )
  }
}