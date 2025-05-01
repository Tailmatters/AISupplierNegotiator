import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Middleware for Next.js app
 * - Handles authentication for protected routes
 * - Redirects unauthenticated users to login page
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes
  if (
    pathname === "/auth" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png")
  ) {
    return NextResponse.next();
  }

  // For API routes, return 401 error
  if (pathname.startsWith("/api/")) {
    try {
      const isValid = await verifyToken(request);
      
      if (!isValid) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      
      return NextResponse.next();
    } catch (error) {
      console.error("Authentication error in middleware:", error);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  // For web pages, redirect to auth page
  try {
    const isValid = await verifyToken(request);
    
    if (isValid) {
      return NextResponse.next();
    }
    
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Authentication error in middleware:", error);
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }
}

/**
 * Configure which paths should trigger this middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml (common files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml).*)",
  ],
};