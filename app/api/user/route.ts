import { NextRequest } from 'next/server'
import { getCurrentUserData } from '@/lib/auth'

export async function GET(request: NextRequest) {
  return getCurrentUserData(request)
}