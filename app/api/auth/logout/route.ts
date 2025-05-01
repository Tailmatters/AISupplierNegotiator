import { NextRequest, NextResponse } from "next/server"
import { AUTH_ERRORS } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Create response
    const response = NextResponse.json({ success: true })
    
    // Clear the auth token cookie
    response.cookies.set({
      name: "token",
      value: "",
      expires: new Date(0),
      path: "/",
    })
    
    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: "Logout failed: " + error.message },
      { status: 500 }
    )
  }
}