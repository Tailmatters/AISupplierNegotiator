import { NextResponse } from 'next/server'
import { getUserFromToken } from '@/lib/auth'

export async function GET() {
  try {
    // Get the current user from the auth token
    const user = await getUserFromToken()
    
    // If no user is found (not authenticated)
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Return the user data
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Error fetching current user:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    )
  }
}