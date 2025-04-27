import { NextRequest } from 'next/server'
import { handleLogin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  return handleLogin(req)
}