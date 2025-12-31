"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { useInvoice, useUpdateInvoice } from "@/hooks/useInvoices"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface InvoiceItem {
  id?: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export default function EditInvoice() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const invoiceId = params.id as string

  const { data, isLoading } = useInvoice(invoiceId)
  const updateInvoice = useUpdateInvoice()

  const [items, setItems] = useState<InvoiceItem[]>([])
  const [previousBalance, setPreviousBalance] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (data) {
      setItems(
        data.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          amount: Number(item.amount),
        })),
      )
      setPreviousBalance(Number(data.invoice.previous_balance))
      setPaidAmount(Number(data.invoice.paid_amount))
    }
  }, [data])

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Recalculate amount if quantity or rate changes
    if (field === "quantity" || field === "rate") {
      const quantity = field === "quantity" ? Number(value) : newItems[index].quantity
      const rate = field === "rate" ? Number(value) : newItems[index].rate
      newItems[index].amount = quantity * rate
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: "", quantity: 0, rate: 0, amount: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const ordersTotal = items.reduce((sum, item) => sum + item.amount, 0)
  const totalPayable = ordersTotal + previousBalance - paidAmount

  const handleSave = async () => {
    if (!data?.invoice) return

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Invoice must have at least one item",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      await updateInvoice.mutateAsync({
        id: invoiceId,
        invoice: {
          orders_total: ordersTotal,
          previous_balance: previousBalance,
          paid_amount: paidAmount,
          total_payable: totalPayable,
          remaining_balance: totalPayable,
        },
        items: items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.amount,
        })),
      })

      toast({
        title: "Invoice updated",
        description: "The invoice has been successfully updated.",
      })

      router.push(`/invoices/${invoiceId}`)
    } catch (error) {
      console.error("[v0] Error updating invoice:", error)
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
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

  const { invoice } = data

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/invoices/${invoiceId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Edit Invoice</h2>
              <p className="text-muted-foreground">Invoice: {invoice.invoice_number}</p>
              <p className="text-sm text-muted-foreground">Client: {invoice.clients?.name}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Invoice Items</h3>

              {items.map((item, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4">
                      <Label>Description</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                        placeholder="Item description"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Quantity (MT)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Rate (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Amount (₹)</Label>
                      <Input value={item.amount.toFixed(2)} disabled className="bg-muted" />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button variant="destructive" size="sm" onClick={() => removeItem(index)} className="w-full">
                        Remove
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              <Button variant="outline" onClick={addItem} className="w-full bg-transparent">
                Add Item
              </Button>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Additional Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Previous Balance (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={previousBalance}
                    onChange={(e) => setPreviousBalance(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Paid Amount (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-3">
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
              {paidAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payments Received</span>
                  <span className="font-semibold text-green-600">
                    -₹{paidAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
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
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
