import { handleLogout } from '@/lib/auth'

export async function POST() {
  return handleLogout()
}