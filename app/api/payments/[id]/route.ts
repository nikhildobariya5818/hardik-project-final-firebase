import { paymentsDB, clientsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const payment = await paymentsDB.getById(id)
    if (payment) {
      const client = await clientsDB.getById(payment.client_id)
      if (client) {
        const newBalance = client.current_balance - payment.amount
        await clientsDB.update(payment.client_id, { current_balance: newBalance })
      }
    }

    await paymentsDB.delete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
