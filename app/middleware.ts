import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

/**
 * Middleware for Next.js app
 * - Handles authentication for protected routes
 * - Redirects unauthenticated users to login page
 */
export async function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define paths that don't require authentication
  const isPublicPath = 
    path === "/auth" || 
    path.startsWith("/api/auth/") ||
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.includes(".") || // Static files
    path === "/";

  // For API routes other than auth, we need to check authentication
  // without redirecting (return 401 instead)
  const isApiPath = path.startsWith("/api/") && !path.startsWith("/api/auth/");
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated
  const user = await authenticateRequest(request);
  
  // If API path and no user, return 401 Unauthorized
  if (isApiPath && !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // For non-API paths, redirect to login page if not authenticated
  if (!user) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, proceed to the requested page
  return NextResponse.next();
}

/**
 * Configure which paths should trigger this middleware
 */
export const config = {
  matcher: [
    // Match all paths except static files and public routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};