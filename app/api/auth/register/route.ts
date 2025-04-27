import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, insertUserSchema } from '@/schema'
import { hashPassword, createToken } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

// Extended schema for registration with password validation
const registerSchema = insertUserSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate the request body
    const body = await request.json()
    const validation = registerSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      )
    }
    
    // Extract data from validation
    const { username, email, password, name, role } = validation.data
    
    // Check if username or email already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(
        eq(users.username, username)
      )
      .limit(1)
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }
    
    const existingEmail = await db
      .select({ id: users.id })
      .from(users)
      .where(
        eq(users.email, email)
      )
      .limit(1)
    
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(password)
    
    // Insert the new user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        name,
        email,
        password: hashedPassword,
        role: role || 'buyer', // Default role is buyer
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()
    
    // Remove password from user object
    const { password: _, ...safeUser } = newUser
    
    // Create a token and set it in a cookie
    await createToken(safeUser)
    
    // Return the user without the password
    return NextResponse.json(safeUser)
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    )
  }
}