import { invoicesDB, invoiceItemsDB, clientsDB, settingsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")

    const data = await invoicesDB.getAll(clientId ? { client_id: clientId } : undefined)

    // Enrich with client data
    const enriched = await Promise.all(
      data.map(async (invoice) => {
        const client = await clientsDB.getById(invoice.client_id)
        return {
          ...invoice,
          clients: client ? { name: client.name, city: client.city } : undefined,
        }
      }),
    )

    // Sort by created_at descending
    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ data: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoice, items } = body

    // Create invoice
    const createdInvoice = await invoicesDB.create(invoice)

    // Create invoice items
    const itemsWithInvoiceId = items.map((item: any) => ({
      ...item,
      invoice_id: createdInvoice.id,
    }))

    await invoiceItemsDB.createBatch(itemsWithInvoiceId)

    // Update invoice number in settings
    const settings = await settingsDB.get()
    if (settings) {
      await settingsDB.set({
        ...settings,
        next_invoice_number: (settings.next_invoice_number || 0) + 1,
      })
    }

    return NextResponse.json({ data: createdInvoice })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
