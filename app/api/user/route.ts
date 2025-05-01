import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/auth";

/**
 * GET /api/user
 * Returns the currently authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Get user from JWT token
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}