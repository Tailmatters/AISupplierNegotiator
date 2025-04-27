import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the current user from the token
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    )
  }
}