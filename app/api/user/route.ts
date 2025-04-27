import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error: any) {
    console.error("User fetch error:", error)
    return NextResponse.json(
      { message: error.message || "Failed to get user data" },
      { status: 500 }
    )
  }
}