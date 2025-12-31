// app/api/material-rates/route.ts
import { materialRatesDB } from "@/lib/firebase/database"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await materialRatesDB.getAll()
    data.sort((a, b) => a.material.localeCompare(b.material))
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Material rates GET error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Material rates POST received:", body)

    const material = body.material || body.material_name
    const rate = Number(body.rate || body.rate_per_mt || 0)

    if (!material) {
      return NextResponse.json(
        { error: "Material name is required" },
        { status: 400 }
      )
    }

    const data = await materialRatesDB.create({ material, rate })
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Material rates POST error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Material rates PATCH received:", body)

    const material = body.material || body.material_name
    const rate = Number(body.rate || body.rate_per_mt || 0)

    if (!material) {
      return NextResponse.json(
        { error: "Material name is required" },
        { status: 400 }
      )
    }

    let id = body.id

    // 🔥 Auto-resolve ID if missing
    if (!id) {
      const allRates = await materialRatesDB.getAll()
      const existing = allRates.find(
        (m: any) => m.material.toLowerCase() === material.toLowerCase()
      )

      if (!existing) {
        return NextResponse.json(
          { error: "Material not found" },
          { status: 404 }
        )
      }

      id = existing.id
    }

    const data = await materialRatesDB.update(id, {
      material,
      rate,
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[v0] Material rates PATCH error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Material rate ID is required" },
        { status: 400 }
      )
    }

    await materialRatesDB.delete(id)
    return NextResponse.json({ data: { success: true } })
  } catch (error: any) {
    console.error("[v0] Material rates DELETE error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
