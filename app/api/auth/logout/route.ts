import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Client-side logout is handled in AuthContext
    // This is a placeholder for any server-side cleanup if needed
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
