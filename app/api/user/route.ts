import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    console.error('Error in GET /api/user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}