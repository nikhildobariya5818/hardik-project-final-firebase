import { invoicesDB, invoiceItemsDB, clientsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const invoice = await invoicesDB.getById(id)
    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const items = await invoiceItemsDB.getAll({ invoice_id: id })

    const client = await clientsDB.getById(invoice.client_id)
    const enrichedInvoice = {
      ...invoice,
      clients: client
        ? {
            name: client.name,
            city: client.city,
            address: client.address,
            state: client.state,
            pincode: client.pincode,
            phone: client.phone,
            gst_number: client.gst_number,
          }
        : undefined,
    }

    return NextResponse.json({ data: enrichedInvoice, items })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { invoice, items } = body

    // Update invoice
    const updated = await invoicesDB.update(id, invoice)
    if (!updated) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Update items if provided
    if (items && items.length > 0) {
      // Delete old items
      await invoiceItemsDB.deleteByInvoiceId(id)
      // Create new items
      const itemsWithInvoiceId = items.map((item: any) => ({
        ...item,
        invoice_id: id,
      }))
      await invoiceItemsDB.createBatch(itemsWithInvoiceId)
    }

    return NextResponse.json({ data: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Delete invoice items first
    await invoiceItemsDB.deleteByInvoiceId(id)

    // Delete invoice
    await invoicesDB.delete(id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
