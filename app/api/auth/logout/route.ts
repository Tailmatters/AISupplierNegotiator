import { NextRequest, NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Logs out the current user by clearing their session
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    clearTokenCookie();
    
    return NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}