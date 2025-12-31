"use client"

import { useRef } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useInvoice } from "@/hooks/useInvoices"
import { useCompanySettings } from "@/hooks/useSettings"
import { Loader2, ArrowLeft, Pencil, Download } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { InvoicePDF } from "@/components/invoice/InvoicePDF"

const PDFDownloadLink = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink), {
  ssr: false,
  loading: () => (
    <Button disabled>
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      Loading PDF...
    </Button>
  ),
})

export default function ViewInvoice() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const invoiceRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useInvoice(invoiceId)
  const { data: companySettings } = useCompanySettings()

  console.log("[v0] Invoice data:", {
    invoice: data?.invoice,
    items: data?.items,
    client: data?.invoice?.clients,
    companySettings,
  })

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center h-96 items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  if (!data?.invoice) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Invoice not found</p>
          <Link href="/invoices">
            <Button className="mt-4">Back to Invoices</Button>
          </Link>
        </div>
      </MainLayout>
    )
  }

  const { invoice, items } = data
  const client = invoice.clients

  const canGeneratePDF = invoice && client && companySettings && items && items.length > 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between print:hidden">
          <Link href="/invoices">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/invoices/${invoiceId}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            {canGeneratePDF ? (
              <PDFDownloadLink
                document={
                  <InvoicePDF invoice={invoice} items={items} client={client} companySettings={companySettings} />
                }
                fileName={`Invoice-${invoice.invoice_number}.pdf`}
              >
                {({ loading, error }) => {
                  console.log("[v0] PDF Link state:", { loading, error })
                  if (error) {
                    console.error("[v0] PDF generation error:", error)
                    return (
                      <Button variant="destructive" disabled>
                        Error generating PDF
                      </Button>
                    )
                  }
                  return (
                    <Button disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Preparing PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </>
                      )}
                    </Button>
                  )
                }}
              </PDFDownloadLink>
            ) : (
              <Button disabled>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden shadow-lg" ref={invoiceRef}>
          <div className="invoice-pdf">
            <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 sm:p-8 text-primary-foreground">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-bold">{companySettings?.company_name}</h2>
                  <p className="text-sm sm:text-base opacity-90">{companySettings?.address}</p>
                  <p className="text-xs sm:text-sm opacity-80">Phone: {companySettings?.phone}</p>
                  {companySettings?.gst_number && (
                    <p className="text-xs sm:text-sm opacity-80">GSTIN: {companySettings.gst_number}</p>
                  )}
                </div>
                <div className="text-left sm:text-right">
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                    <p className="text-xs opacity-80 uppercase tracking-wide">Tax Invoice</p>
                    <p className="text-lg sm:text-xl font-bold mt-1">{invoice.invoice_number}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-primary uppercase tracking-wide border-b-2 border-primary pb-2">
                    Bill To
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                    <p className="text-lg font-bold">{client?.name}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {client?.address && <p>{client.address}</p>}
                      <p>
                        {client?.city && `${client.city}, `}
                        {client?.state && `${client.state} `}
                        {client?.pincode && `- ${client.pincode}`}
                      </p>
                      {client?.phone && <p className="font-medium text-foreground">Phone: {client.phone}</p>}
                      {client?.gst_number && <p className="font-medium">GSTIN: {client.gst_number}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 sm:text-right">
                  <p className="text-sm font-bold text-primary uppercase tracking-wide border-b-2 border-primary pb-2">
                    Invoice Date
                  </p>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-lg font-bold">{format(new Date(invoice.created_at), "dd-MM-yyyy")}</p>
                    <p className="text-sm font-semibold text-muted-foreground mt-3">Billing Period</p>
                    <p className="text-base font-medium">{format(new Date(invoice.bill_month), "MMMM yyyy")}</p>
                  </div>
                </div>
              </div>

              {items.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">Description</th>
                          <th className="text-right p-3 text-sm font-semibold">Quantity (MT)</th>
                          <th className="text-right p-3 text-sm font-semibold">Rate</th>
                          <th className="text-right p-3 text-sm font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {items.map((item, idx) => (
                          <tr key={item.id} className={idx % 2 === 1 ? "bg-muted/30" : ""}>
                            <td className="p-3 font-medium">{item.description}</td>
                            <td className="p-3 text-right">{Number(item.quantity).toFixed(2)}</td>
                            <td className="p-3 text-right">₹{Number(item.rate).toFixed(2)}</td>
                            <td className="p-3 text-right font-semibold">
                              ₹{Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-4 sm:p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Orders Total</span>
                  <span className="font-semibold">
                    ₹{Number(invoice.orders_total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {invoice.previous_balance !== 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Previous Balance</span>
                    <span className="font-semibold">
                      ₹{Number(invoice.previous_balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {invoice.paid_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payments Received</span>
                    <span className="font-semibold text-green-600">
                      -₹{Number(invoice.paid_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Total Amount Due</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{Number(invoice.total_payable).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {companySettings?.bank_name && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Bank Name</p>
                      <p className="font-semibold">{companySettings.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Number</p>
                      <p className="font-semibold">{companySettings.bank_account}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">IFSC Code</p>
                      <p className="font-semibold">{companySettings.bank_ifsc}</p>
                    </div>
                    {companySettings.upi_id && (
                      <div>
                        <p className="text-muted-foreground">UPI ID</p>
                        <p className="font-semibold">{companySettings.upi_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
