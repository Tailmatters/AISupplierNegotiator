import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser, AUTH_ERRORS } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: AUTH_ERRORS.UNAUTHORIZED },
        { status: 401 }
      )
    }
    
    // Return user data without the password
    const { password: _, ...userWithoutPassword } = user
    
    return NextResponse.json(userWithoutPassword)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Authentication error: " + error.message },
      { status: 500 }
    )
  }
}