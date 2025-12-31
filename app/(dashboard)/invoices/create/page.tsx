"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useClients } from "@/hooks/useClients"
import { useOrdersByClient, useOrdersBeforeMonth } from "@/hooks/useOrders"
import { usePaymentsByClient, usePaymentsBeforeMonth } from "@/hooks/usePayments"
import { useCompanySettings } from "@/hooks/useSettings"
import { useCreateInvoice } from "@/hooks/useInvoices"
import { FileText, Loader2, Receipt, Calendar, User, Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, subMonths } from "date-fns"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CreateInvoice() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: companySettings, isLoading: settingsLoading } = useCompanySettings()
  const createInvoice = useCreateInvoice()

  const [selectedClient, setSelectedClient] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [isSaving, setIsSaving] = useState(false)

  const { data: clientOrders = [], isLoading: ordersLoading } = useOrdersByClient(selectedClient, selectedMonth)
  const { data: clientPayments = [] } = usePaymentsByClient(selectedClient, selectedMonth)
  const { data: previousOrders = [] } = useOrdersBeforeMonth(selectedClient, selectedMonth)
  const { data: previousPayments = [] } = usePaymentsBeforeMonth(selectedClient, selectedMonth)

  const client = clients.find((c) => c.id === selectedClient)
  const isLoading = clientsLoading || settingsLoading

  // Calculate totals
  const ordersTotal = clientOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const paymentsTotal = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  const openingBalance = client ? Number(client.opening_balance || 0) : 0
  const previousOrdersTotal = previousOrders.reduce((s, o) => s + Number(o.total), 0)
  const previousPaymentsTotal = previousPayments.reduce((s, p) => s + Number(p.amount), 0)

  const previousBalance = openingBalance + previousOrdersTotal - previousPaymentsTotal
  const totalPayable = ordersTotal + previousBalance - paymentsTotal

  const months = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const date = subMonths(new Date(), i)
      return {
        value: format(date, "yyyy-MM"),
        label: format(date, "MMMM yyyy"),
      }
    })
  }, [])

  const generateInvoiceNumber = () => {
    const invoiceNum = companySettings?.next_invoice_number || 1
    const selectedDate = new Date(selectedMonth)
    const month = selectedDate.getMonth() + 1
    const year = selectedDate.getFullYear()
    const nextYear = year + 1
    const yearSuffix = `${year.toString().slice(-2)}/${nextYear.toString().slice(-2)}`

    return `${invoiceNum}-${month}-${yearSuffix}`
  }

  const handleSaveInvoice = async () => {
    if (!selectedClient || !client) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      })
      return
    }

    if (clientOrders.length === 0) {
      toast({
        title: "Error",
        description: "No orders found for the selected period",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const invoiceNumber = generateInvoiceNumber()
      const items = clientOrders.map((order) => ({
        order_id: order.id,
        description: order.material,
        quantity: Number(order.quantity || order.weight || 0),
        rate: Number(order.rate),
        amount: Number(order.total),
      }))

      await createInvoice.mutateAsync({
        invoice: {
          client_id: selectedClient,
          invoice_number: invoiceNumber,
          bill_month: selectedMonth + "-01",
          orders_total: ordersTotal,
          previous_balance: previousBalance,
          total_payable: totalPayable,
          paid_amount: paymentsTotal,
          remaining_balance: totalPayable,
        },
        items,
      })

      toast({
        title: "Invoice created",
        description: `Invoice ${invoiceNumber} has been successfully created.`,
      })

      router.push("/invoices")
    } catch (error) {
      console.error("[v0] Error creating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center h-96 items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Create Invoice</h1>
            <p className="text-sm text-muted-foreground">Generate a new invoice for a client</p>
          </div>
        </div>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Select Client
              </Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Select Month
              </Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {selectedClient && client && (
          <>
            {clientOrders.length > 0 ? (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Invoice Preview</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <p className="text-sm text-muted-foreground">Invoice Number</p>
                      <p className="text-lg font-bold font-mono text-primary">{generateInvoiceNumber()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="text-lg font-semibold">{client.name}</p>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">Description</th>
                          <th className="text-right p-3 text-sm font-semibold">Qty (MT)</th>
                          <th className="text-right p-3 text-sm font-semibold">Rate</th>
                          <th className="text-right p-3 text-sm font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {clientOrders.map((order) => {
                          const quantity = Number(order.quantity || order.weight || 0)
                          const rate = Number(order.rate)
                          const total = Number(order.total)

                          return (
                            <tr key={order.id}>
                              <td className="p-3">{order.material}</td>
                              <td className="p-3 text-right">{quantity.toFixed(2)}</td>
                              <td className="p-3 text-right">₹{rate.toFixed(2)}</td>
                              <td className="p-3 text-right font-semibold">
                                ₹{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orders Total</span>
                      <span className="font-semibold">
                        ₹{ordersTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {previousBalance !== 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Previous Balance</span>
                        <span className="font-semibold">
                          ₹{previousBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {paymentsTotal > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payments</span>
                        <span className="font-semibold text-green-600">
                          -₹{paymentsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total Amount Due</span>
                      <span className="text-2xl font-bold text-primary">
                        ₹{totalPayable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" onClick={() => router.push("/invoices")}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveInvoice} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Invoice
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="text-center p-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">No Orders Found</h3>
                    <p className="text-sm text-muted-foreground">
                      There are no orders for {client.name} in {format(new Date(selectedMonth), "MMMM yyyy")}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {!selectedClient && (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Select Client and Month</h3>
                <p className="text-sm text-muted-foreground">Choose a client and billing period to create an invoice</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}
