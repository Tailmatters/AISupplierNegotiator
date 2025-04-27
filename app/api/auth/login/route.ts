import { NextRequest } from 'next/server'
import { handleLogin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  return handleLogin(request)
}