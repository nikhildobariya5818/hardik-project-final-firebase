import { ordersDB, clientsDB } from "@/lib/firebase/database"
import { getFirebaseAuth } from "@/lib/firebase/client"
import { type NextRequest, NextResponse } from "next/server"

function validateOrderInput(body: any) {
  const errors: string[] = []

  if (!body.client_id || typeof body.client_id !== "string") {
    errors.push("Client ID is required")
  }

  if (!body.material || typeof body.material !== "string" || body.material.trim().length === 0) {
    errors.push("Material is required")
  }

  if (!body.weight || typeof body.weight !== "number" || body.weight <= 0) {
    errors.push("Weight must be a positive number")
  }

  if (!body.total || typeof body.total !== "number" || body.total <= 0) {
    errors.push("Total must be a positive number")
  }

  if (!body.order_date || typeof body.order_date !== "string") {
    errors.push("Order date is required")
  }

  return errors
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const year = searchParams.get("year")
    const month = searchParams.get("month")
    const beforeYear = searchParams.get("before_year")
    const beforeMonth = searchParams.get("before_month")

    let data = await ordersDB.getAll(clientId ? { client_id: clientId } : undefined)

    if (year && month) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`
      const nextMonth = Number.parseInt(month) + 1
      const nextYear = nextMonth > 12 ? Number.parseInt(year) + 1 : Number.parseInt(year)
      const endDate = `${nextYear}-${(nextMonth > 12 ? 1 : nextMonth).toString().padStart(2, "0")}-01`
      data = data.filter((order) => order.order_date >= startDate && order.order_date < endDate)
    } else if (beforeYear && beforeMonth) {
      const beforeDate = `${beforeYear}-${beforeMonth.padStart(2, "0")}-01`
      data = data.filter((order) => order.order_date < beforeDate)
    }

    data.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())

    const enriched = await Promise.all(
      data.map(async (order) => {
        try {
          const client = await clientsDB.getById(order.client_id)
          return {
            ...order,
            clients: client ? { name: client.name, city: client.city } : undefined,
          }
        } catch (error) {
          console.error("[API] Error enriching order:", error)
          return { ...order, clients: undefined }
        }
      }),
    )

    return NextResponse.json({ data: enriched })
  } catch (error: any) {
    console.error("[API] GET /orders error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validationErrors = validateOrderInput(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    const auth = getFirebaseAuth()

    const client = await clientsDB.getById(body.client_id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const data = await ordersDB.create({
      ...body,
      created_by: auth.currentUser?.uid || null,
    })

    try {
      const newBalance = client.current_balance - body.total
      await clientsDB.update(body.client_id, { current_balance: newBalance })
    } catch (balanceError) {
      console.error("[API] Failed to update client balance:", balanceError)
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[API] POST /orders error:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
