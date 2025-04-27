import { NextRequest, NextResponse } from 'next/server'
import { clearToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Clear the JWT token from cookies
    await clearToken()
    
    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Logout failed' },
      { status: 500 }
    )
  }
}