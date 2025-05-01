import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/suppliers',
  '/negotiations',
  '/contracts',
  '/spend-analysis',
  '/market-analysis',
  '/settings',
  '/account',
]

// Routes that shouldn't be accessible when authenticated
const publicOnlyRoutes = [
  '/auth',
]

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Check if the user is authenticated
  const user = await getAuthUser(request)
  const isAuthenticated = !!user
  
  // If user is accessing a protected route and is not logged in, redirect to login
  if (protectedRoutes.some(route => path.startsWith(route)) && !isAuthenticated) {
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is accessing a public-only route and is logged in, redirect to dashboard
  if (publicOnlyRoutes.some(route => path === route) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Allow the request to continue
  return NextResponse.next()
}

// Define which paths the middleware should be invoked on
// Matching both protected and public routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (robots.txt, sitemap.xml, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|robots.txt).*)',
  ],
}