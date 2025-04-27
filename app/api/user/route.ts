import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, verifyToken } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/schema'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    // Get the auth token from cookies
    const token = await getAuthToken(req.cookies)
    
    // No token found, user is not authenticated
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Verify the token
    const payload = await verifyToken(token)
    
    // Token is invalid
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }
    
    // Get user from database
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
        company: users.company,
        position: users.position,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
    
    // User not found
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Return user data
    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    )
  }
}