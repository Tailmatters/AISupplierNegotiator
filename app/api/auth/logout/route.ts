import { NextRequest, NextResponse } from "next/server"
import { logoutUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    await logoutUser()
    
    return NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { message: error.message || "Logout failed" },
      { status: 500 }
    )
  }
}