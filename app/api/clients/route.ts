import { clientsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

function validateClientInput(body: any) {
  const errors: string[] = []

  if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
    errors.push("Client name is required")
  }

  if (!body.city || typeof body.city !== "string" || body.city.trim().length === 0) {
    errors.push("City is required")
  }

  if (!body.phone || typeof body.phone !== "string" || body.phone.trim().length === 0) {
    errors.push("Phone number is required")
  }

  if (body.opening_balance !== undefined && typeof body.opening_balance !== "number") {
    errors.push("Opening balance must be a number")
  }

  return errors
}

export async function GET() {
  try {
    const data = await clientsDB.getAll()
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[API] GET /clients error:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationErrors = validateClientInput(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    const data = await clientsDB.create({
      name: body.name.trim(),
      city: body.city.trim(),
      phone: body.phone.trim(),
      address: body.address?.trim() || undefined,
      opening_balance: body.opening_balance || 0,
      current_balance: body.opening_balance || 0,
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[API] POST /clients error:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
