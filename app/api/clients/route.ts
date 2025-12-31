import { clientsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await clientsDB.getAll()

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const data = await clientsDB.create({
      ...body,
      current_balance: body.opening_balance || 0,
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
