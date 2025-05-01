import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/",
  "/dashboard",
  "/suppliers",
  "/contracts",
  "/negotiations",
  "/spend-analysis",
  "/market-analysis",
  "/settings",
  "/account",
]

// Routes that should redirect to dashboard if user is already authenticated
const PUBLIC_ONLY_ROUTES = ["/auth"]

export async function middleware(request: NextRequest) {
  // Get path from request URL
  const path = request.nextUrl.pathname
  
  // Check if the current user is authenticated
  const user = await getCurrentUser(request)
  const isAuthenticated = !!user
  
  // Handle protected routes
  if (PROTECTED_ROUTES.some((route) => path.startsWith(route)) && !isAuthenticated) {
    // Redirect to login if not authenticated
    const url = new URL("/auth", request.url)
    url.searchParams.set("callbackUrl", path)
    return NextResponse.redirect(url)
  }
  
  // Handle public-only routes (like login) when user is already authenticated
  if (PUBLIC_ONLY_ROUTES.includes(path) && isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL("/", request.url))
  }
  
  // Continue as normal for unmatched routes
  return NextResponse.next()
}

export const config = {
  // Apply middleware only to specified routes
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (static images)
     * - api/ (API routes - they handle their own auth)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
  ],
}