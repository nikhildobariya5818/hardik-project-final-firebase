import { settingsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

function validateSettingsInput(body: any) {
  const errors: string[] = []

  if (body.company_name !== undefined && typeof body.company_name !== "string") {
    errors.push("Company name must be a string")
  }

  if (body.gst_number !== undefined && typeof body.gst_number !== "string") {
    errors.push("GST number must be a string")
  }

  if (body.email !== undefined && typeof body.email !== "string") {
    errors.push("Email must be a string")
  }

  if (body.phone !== undefined && typeof body.phone !== "string") {
    errors.push("Phone must be a string")
  }

  return errors
}

export async function GET() {
  try {
    const data = await settingsDB.get()
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[API] GET /settings error:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const validationErrors = validateSettingsInput(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    const existing = await settingsDB.get()

    let data

    if (!existing) {
      data = await settingsDB.set({
        id: "default",
        ...body,
        updated_at: new Date().toISOString(),
      } as any)
    } else {
      data = await settingsDB.set({
        ...existing,
        ...body,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[API] PATCH /settings error:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
