import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      company: user.company,
      title: user.title,
      phone: user.phone,
      preferences: user.preferences,
    })
  } catch (error) {
    console.error("Error getting user:", error)
    return NextResponse.json(
      { error: "An error occurred while getting user data" },
      { status: 500 }
    )
  }
}