import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, createToken } from '@/lib/auth'
import { z } from 'zod'

// Validation schema for registration
const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'buyer', 'supplier']).default('buyer'),
  company: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    
    // Validate request data
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.format() },
        { status: 400 }
      )
    }
    
    // Extract validated data
    const { confirmPassword, ...userData } = validationResult.data
    
    // Check if username already exists
    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username))
      .limit(1)
    
    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }
    
    // Check if email already exists
    const existingEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1)
    
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Hash password
    const hashedPassword = await hashPassword(userData.password)
    
    // Create user in database
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date(),
      })
      .returning()
    
    // Create token and set cookie
    await createToken(newUser)
    
    // Remove password from response
    const { password, ...userWithoutPassword } = newUser
    
    // Return success response
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    )
  }
}