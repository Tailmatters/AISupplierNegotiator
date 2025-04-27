import { NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/lib/auth"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    return await deleteSession(req)
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    )
  }
}