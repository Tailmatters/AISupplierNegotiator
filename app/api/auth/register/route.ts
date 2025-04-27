import { NextRequest } from 'next/server'
import { handleRegister } from '@/lib/auth'

export async function POST(request: NextRequest) {
  return handleRegister(request)
}