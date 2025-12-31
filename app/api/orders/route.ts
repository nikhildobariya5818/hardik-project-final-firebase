import { ordersDB, clientsDB } from "@/lib/firebase/database"
import { getFirebaseAuth } from "@/lib/firebase/client"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const beforeYear = searchParams.get("before_year")
    const beforeMonth = searchParams.get("before_month")

    let data = await ordersDB.getAll(clientId ? { client_id: clientId } : undefined)

    // Filter by date if provided
    if (beforeYear && beforeMonth) {
      const beforeDate = `${beforeYear}-${beforeMonth.padStart(2, "0")}-01`
      data = data.filter((order) => order.order_date < beforeDate)
    }

    // Sort by date descending
    data.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())

    // Enrich with client data
    const enriched = await Promise.all(
      data.map(async (order) => {
        const client = await clientsDB.getById(order.client_id)
        return {
          ...order,
          clients: client ? { name: client.name, city: client.city } : undefined,
        }
      }),
    )

    return NextResponse.json({ data: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const auth = getFirebaseAuth()

    const data = await ordersDB.create({
      ...body,
      created_by: auth.currentUser?.uid || null,
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
