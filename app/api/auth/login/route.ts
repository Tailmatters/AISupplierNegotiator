import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { comparePasswords, createToken, setTokenCookie } from '@/lib/auth'
import { z } from 'zod'

// Login input validation schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    
    // Validate input data
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    const { username, password } = result.data
    
    // Find user in database
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
    
    // User not found
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Verify password
    const passwordValid = await comparePasswords(password, user.password)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }
    
    // Create JWT token
    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })
    
    // Create response
    const response = NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      position: user.position,
      avatarUrl: user.avatarUrl,
    })
    
    // Set cookie with token
    await setTokenCookie(response, token)
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}