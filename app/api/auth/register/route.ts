import { NextRequest } from 'next/server'
import { handleRegister } from '@/lib/auth'

export async function POST(req: NextRequest) {
  return handleRegister(req)
}