import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Define paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/negotiations',
  '/suppliers',
  '/contracts',
  '/spend-analysis',
  '/settings',
]

// Define paths that are only accessible to unauthenticated users
const UNAUTHENTICATED_ONLY_PATHS = [
  '/auth',
]

export async function middleware(request: NextRequest) {
  // Get the path from request
  const path = request.nextUrl.pathname
  
  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value
  
  // Check if the path is protected
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => 
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  )
  
  // Check if the path is for unauthenticated users only
  const isUnauthenticatedOnlyPath = UNAUTHENTICATED_ONLY_PATHS.some(unauthPath => 
    path === unauthPath || path.startsWith(`${unauthPath}/`)
  )
  
  // Verify the token if it exists
  let isAuthenticated = false
  if (token) {
    const payload = await verifyToken(token)
    isAuthenticated = !!payload?.id
  }
  
  // Redirect authenticated users away from unauthenticated-only paths
  if (isUnauthenticatedOnlyPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Redirect unauthenticated users away from protected paths
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Continue with the request for all other cases
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|api|favicon.ico).*)',
  ],
}