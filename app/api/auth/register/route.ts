import { NextRequest, NextResponse } from 'next/server';
import { createSession, createUser, getUserByUsername } from '@/lib/auth';
import { insertUserSchema } from '@/schema';
import { z } from 'zod';

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: result.error.errors },
        { status: 400 }
      );
    }
    
    const userData = result.data;
    
    // Check if username already exists
    const existingUser = await getUserByUsername(userData.username);
    if (existingUser) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const user = await createUser(userData);
    if (!user) {
      return NextResponse.json(
        { message: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    // Create session
    await createSession(user.id);
    
    // Omit password from response
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}