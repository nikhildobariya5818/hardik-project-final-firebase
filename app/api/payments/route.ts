import { paymentsDB, clientsDB } from "@/lib/firebase/database"
import { getFirebaseAuth } from "@/lib/firebase/client"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const beforeYear = searchParams.get("before_year")
    const beforeMonth = searchParams.get("before_month")

    let data = await paymentsDB.getAll(clientId ? { client_id: clientId } : undefined)

    // Filter by date if provided
    if (beforeYear && beforeMonth) {
      const beforeDate = `${beforeYear}-${beforeMonth.padStart(2, "0")}-01`
      data = data.filter((payment) => payment.payment_date < beforeDate)
    }

    // Sort by date descending
    data.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())

    // Enrich with client data
    const enriched = await Promise.all(
      data.map(async (payment) => {
        const client = await clientsDB.getById(payment.client_id)
        return {
          ...payment,
          clients: client ? { name: client.name } : undefined,
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

    const data = await paymentsDB.create({
      ...body,
      created_by: auth.currentUser?.uid || null,
    })

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
