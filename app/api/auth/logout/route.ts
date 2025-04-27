import { NextResponse } from 'next/server'
import { logout } from '@/lib/auth'

export async function POST() {
  try {
    // Clear the auth cookie
    await logout()
    
    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}