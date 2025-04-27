import { NextRequest } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request)
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
  
  return new Response(
    JSON.stringify(user),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}