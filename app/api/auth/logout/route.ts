import { NextRequest, NextResponse } from "next/server";
import { clearTokenCookie } from "@/lib/auth";

/**
 * POST /api/auth/logout - Log out a user by clearing the auth token
 */
export async function POST(request: NextRequest) {
  try {
    // Clear the auth token cookie
    await clearTokenCookie();
    
    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}