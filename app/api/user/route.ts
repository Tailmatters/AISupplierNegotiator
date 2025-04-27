import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
    
  } catch (error) {
    console.error("Error getting current user:", error)
    
    return NextResponse.json(
      { error: "Failed to get user data" },
      { status: 500 }
    )
  }
}