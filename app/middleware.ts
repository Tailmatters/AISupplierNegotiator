import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Middleware for Next.js app
 * - Handles authentication for protected routes
 * - Redirects unauthenticated users to login page
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for auth page
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }
  
  // Skip middleware for API routes that handle their own auth
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  
  // Skip middleware for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  const isAuthenticated = await verifyToken(request);
  
  // If not authenticated and trying to access a protected route, redirect to auth page
  if (!isAuthenticated) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

/**
 * Configure which paths should trigger this middleware
 */
export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.well-known).*)"],
};