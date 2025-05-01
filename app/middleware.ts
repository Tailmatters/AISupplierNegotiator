import { NextResponse, NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  const publicPaths = [
    "/auth",
    "/api/auth/login", 
    "/api/auth/register",
    "/_next",
    "/favicon.ico"
  ];
  
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname === path || 
    request.nextUrl.pathname.startsWith(path + "/")
  );
  
  // Allow public paths without authentication
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Check if it's an API route
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  
  // For API routes, allow the request but let the individual API handlers
  // enforce authentication as needed
  if (isApiRoute) {
    return NextResponse.next();
  }
  
  // For non-API routes that require authentication, check if the user is authenticated
  const user = await authenticateRequest(request);
  
  // If not authenticated, redirect to the login page
  if (!user) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // User is authenticated, allow the request
  return NextResponse.next();
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - static files (/_next/, /images/, etc.)
     * - API routes that handle authentication themselves
     * - authentication-related routes
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};