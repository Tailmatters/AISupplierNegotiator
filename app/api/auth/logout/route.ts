import { NextRequest, NextResponse } from 'next/server'
import { removeTokenCookie } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    // Create response with 200 status
    const response = NextResponse.json({ success: true })
    
    // Remove auth token cookie
    await removeTokenCookie(response)
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}