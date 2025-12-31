import { settingsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await settingsDB.get()

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const existing = await settingsDB.get()

    let data

    if (!existing) {
      // Create new settings
      data = await settingsDB.set({
        id: "default",
        ...body,
        updated_at: new Date().toISOString(),
      } as any)
    } else {
      // Update existing settings
      data = await settingsDB.set({
        ...existing,
        ...body,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
