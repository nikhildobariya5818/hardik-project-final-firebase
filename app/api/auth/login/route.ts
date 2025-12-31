import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Note: Client-side Firebase auth is needed for this
    // For now, we'll return an error and have client handle it
    return NextResponse.json(
      { error: "Use client-side authentication. This endpoint is for reference only." },
      { status: 400 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
