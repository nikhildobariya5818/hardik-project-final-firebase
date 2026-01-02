import { invoicesDB, invoiceItemsDB, clientsDB, settingsDB } from "@/lib/firebase/database"
import { type NextRequest, NextResponse } from "next/server"

function validateInvoiceInput(body: any) {
  const errors: string[] = []

  if (!body.invoice?.client_id) {
    errors.push("Client ID is required")
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    errors.push("Invoice must have at least one item")
  }

  return errors
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")

    const data = await invoicesDB.getAll(clientId ? { client_id: clientId } : undefined)

    const enriched = await Promise.all(
      data.map(async (invoice) => {
        try {
          const client = await clientsDB.getById(invoice.client_id)
          return {
            ...invoice,
            clients: client ? { name: client.name, city: client.city } : undefined,
          }
        } catch (error) {
          console.error("[API] Error enriching invoice:", error)
          return { ...invoice, clients: undefined }
        }
      }),
    )

    enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({ data: enriched })
  } catch (error: any) {
    console.error("[API] GET /invoices error:", error)
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoice, items } = body

    const validationErrors = validateInvoiceInput(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 })
    }

    const client = await clientsDB.getById(invoice.client_id)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const createdInvoice = await invoicesDB.create(invoice)

    const itemsWithInvoiceId = items.map((item: any) => ({
      ...item,
      invoice_id: createdInvoice.id,
    }))

    await invoiceItemsDB.createBatch(itemsWithInvoiceId)

    try {
      const settings = await settingsDB.get()
      if (settings) {
        await settingsDB.set({
          ...settings,
          next_invoice_number: (settings.next_invoice_number || 0) + 1,
        })
      }
    } catch (settingsError) {
      console.error("[API] Failed to update settings:", settingsError)
    }

    return NextResponse.json({ data: createdInvoice })
  } catch (error: any) {
    console.error("[API] POST /invoices error:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}
