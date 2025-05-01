import { NextResponse, type NextRequest } from "next/server"
import { verifyToken, AUTH_COOKIE } from "@/lib/auth"

// Define protected paths that require authentication
const PROTECTED_PATHS = [
  "/dashboard",
  "/custom-dashboard",
  "/negotiations",
  "/suppliers",
  "/contracts",
  "/spend-analysis", 
  "/market-analysis",
  "/settings",
  "/account",
]

// Define paths that should only be accessible to non-authenticated users
const AUTH_PATHS = ["/auth"]

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value
  const path = request.nextUrl.pathname
  
  // Verify JWT if token exists
  const isAuthenticated = token ? !!(await verifyToken(token)) : false
  
  // If user is authenticated and trying to access auth page, redirect to dashboard
  if (isAuthenticated && AUTH_PATHS.includes(path)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }
  
  // If user is not authenticated and trying to access protected route, redirect to auth page
  if (!isAuthenticated && PROTECTED_PATHS.some(route => path.startsWith(route))) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }
  
  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  // Match all request paths except for API routes, static files, and other paths that should bypass middleware
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}