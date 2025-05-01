import { NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getServerUser()
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword, { status: 200 })
  } catch (error) {
    console.error("Error getting user:", error)
    
    return NextResponse.json(
      { error: "Failed to get user data" },
      { status: 500 }
    )
  }
}