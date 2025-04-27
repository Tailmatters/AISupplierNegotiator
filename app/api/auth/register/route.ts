import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, insertUserSchema } from '@/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, createToken, setTokenCookie } from '@/lib/auth'
import { z } from 'zod'

// Registration validation schema with password confirmation
const registerSchema = insertUserSchema
  .extend({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    
    // Validate input data
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    
    // Extract validated data
    const { passwordConfirm, ...userData } = result.data
    
    // Check if username already exists
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, userData.username))
    
    if (existingUser) {
      return NextResponse.json(
        { error: { username: ['Username is already taken'] } },
        { status: 400 }
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
          { error: { email: ['Email is already registered'] } },
          { status: 400 }
        )
      }
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // Insert user into database
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        role: userData.role || 'buyer', // Default role if not specified
      })
      .returning()
    
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    )
  }
}