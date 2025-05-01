import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

/**
 * GET /api/user
 * Returns the current user's data
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Return user data without the password
    const { password, ...userData } = user;
    return NextResponse.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}