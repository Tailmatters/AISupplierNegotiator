import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Return user data without password
    const { password: _, ...userData } = user
    
    return NextResponse.json(userData, { status: 200 })
  } catch (error) {
    console.error('User retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to get user data', message: error.message },
      { status: 500 }
    )
  }
}