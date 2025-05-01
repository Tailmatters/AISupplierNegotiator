import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // Delete token cookie
    const cookieStore = cookies()
    cookieStore.delete("token")
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Logout error:", error)
    
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    )
  }
}