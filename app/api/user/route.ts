import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }
    
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to get user data" },
      { status: 500 }
    );
  }
}