import { ordersDB, clientsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingOrder = await ordersDB.getById(id)
    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const data = await ordersDB.update(id, body)

    if (!data) {
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    if (body.total && body.total !== existingOrder.total) {
      try {
        const client = await clientsDB.getById(existingOrder.client_id)
        if (client) {
          const difference = body.total - existingOrder.total
          const newBalance = client.current_balance - difference
          await clientsDB.update(existingOrder.client_id, { current_balance: newBalance })
        }
      } catch (balanceError) {
        console.error("[API] Failed to update client balance:", balanceError)
      }
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error("[API] PATCH /orders/[id] error:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const order = await ordersDB.getById(id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    try {
      const client = await clientsDB.getById(order.client_id)
      if (client) {
        const newBalance = client.current_balance + order.total
        await clientsDB.update(order.client_id, { current_balance: newBalance })
      }
    } catch (balanceError) {
      console.error("[API] Failed to update client balance:", balanceError)
    }

    await ordersDB.delete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[API] DELETE /orders/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 })
  }
}
