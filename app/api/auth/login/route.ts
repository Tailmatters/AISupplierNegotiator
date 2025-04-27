import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { comparePasswords, createToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Schema for login validation
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    const { username, password } = validation.data
    
    // Find the user by username
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    
    // If no user found or password doesn't match
    if (!user || !(await comparePasswords(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Remove password from user object
    const { password: _, ...safeUser } = user
    
    // Create a token and set it in a cookie
    await createToken(safeUser)
    
    // Return the user without the password
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}