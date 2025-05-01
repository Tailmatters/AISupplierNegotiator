import { NextRequest, NextResponse } from "next/server"
import { verifyToken, AUTH_ERRORS } from "@/lib/auth"

// Define the public paths that don't require authentication
const publicPaths = ["/auth", "/api/auth/login", "/api/auth/register"]

// Check if a path is in the public paths list
const isPublicPath = (path: string) => {
  return publicPaths.some((publicPath) => path.startsWith(publicPath))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Skip authentication middleware for public paths
  if (isPublicPath(path)) {
    return NextResponse.next()
  }
  
  // For API routes, we validate the token and return an appropriate response
  if (path.startsWith("/api")) {
    const token = request.cookies.get("token")?.value
    
    if (!token) {
      return NextResponse.json(
        { error: AUTH_ERRORS.UNAUTHORIZED },
        { status: 401 }
      )
    }
    
    const payload = await verifyToken(token)
    
    if (!payload) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_TOKEN },
        { status: 401 }
      )
    }
    
    return NextResponse.next()
  }
  
  // For non-API protected routes, we redirect to login
  const token = request.cookies.get("token")?.value
  
  if (!token) {
    const url = new URL("/auth", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }
  
  // Verify the token, if invalid redirect to login
  const payload = await verifyToken(token)
  
  if (!payload) {
    const url = new URL("/auth", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Match all paths except static files, images, etc.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}