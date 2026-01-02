import { paymentsDB, clientsDB } from "@/lib/firebase/database"
import { getFirebaseAuth } from "@/lib/firebase/client"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const year = searchParams.get("year")
    const month = searchParams.get("month")
    const beforeYear = searchParams.get("before_year")
    const beforeMonth = searchParams.get("before_month")

    let data = await paymentsDB.getAll(clientId ? { client_id: clientId } : undefined)

    if (year && month) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`
      const nextMonth = Number.parseInt(month) + 1
      const nextYear = nextMonth > 12 ? Number.parseInt(year) + 1 : Number.parseInt(year)
      const endDate = `${nextYear}-${(nextMonth > 12 ? 1 : nextMonth).toString().padStart(2, "0")}-01`
      data = data.filter((payment) => payment.payment_date >= startDate && payment.payment_date < endDate)
    }
    // Filter by date if provided (for previous payments before a month)
    else if (beforeYear && beforeMonth) {
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

    const client = await clientsDB.getById(body.client_id)
    if (client) {
      const newBalance = client.current_balance + body.amount
      await clientsDB.update(body.client_id, { current_balance: newBalance })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
