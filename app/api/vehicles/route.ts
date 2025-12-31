import { vehiclesDB } from "@/lib/firebase/database"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await vehiclesDB.getAll()

    // Sort by vehicle number
    data.sort((a, b) => a.vehicle_number.localeCompare(b.vehicle_number))

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Vehicles GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    console.log("[v0] Vehicles POST received:", body)

    const vehicleNumber = typeof body === "string" ? body : body.vehicle_number

    if (!vehicleNumber || !vehicleNumber.trim()) {
      return NextResponse.json({ error: "Vehicle number is required" }, { status: 400 })
    }

    const vehicleData = {
      vehicle_number: vehicleNumber.trim(),
    }

    console.log("[v0] Vehicle data to insert:", vehicleData)

    const data = await vehiclesDB.create(vehicleData)

    console.log("[v0] Vehicle inserted successfully:", data)

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Vehicles POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Vehicle ID is required" }, { status: 400 })
    }

    await vehiclesDB.delete(id)

    return NextResponse.json({ data: { success: true } })
  } catch (error: any) {
    console.error("[v0] Vehicles DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
