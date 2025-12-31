"use client"

import { useState, useRef } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePayments, useAddPayment, useDeletePayment } from "@/hooks/usePayments"
import { useClients } from "@/hooks/useClients"
import { useCompanySettings } from "@/hooks/useSettings"
import { useAuth } from "@/contexts/AuthContext"
import type { PaymentMode, Payment } from "@/types"
import {
  CreditCard,
  Plus,
  Search,
  IndianRupee,
  Calendar,
  Banknote,
  Smartphone,
  Building2,
  Loader2,
  Trash2,
  Printer,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { format } from "date-fns"

const paymentModeIcons: Record<PaymentMode, typeof Banknote> = {
  Cash: Banknote,
  UPI: Smartphone,
  Bank: Building2,
}

export default function Payments() {
  const { isAdmin } = useAuth()
  const { data: payments = [], isLoading: paymentsLoading } = usePayments()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: companySettings } = useCompanySettings()
  const addPayment = useAddPayment()
  const deletePayment = useDeletePayment()

  const printRef = useRef<HTMLDivElement>(null)
  const [printPayment, setPrintPayment] = useState<Payment | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deletePaymentId, setDeletePaymentId] = useState<string | null>(null)

  const [newPayment, setNewPayment] = useState({
    client_id: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    amount: "",
    mode: "" as PaymentMode | "",
    notes: "",
  })

  const isLoading = paymentsLoading || clientsLoading

  const filteredPayments = payments.filter((payment) =>
    payment.clients?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  const handleAddPayment = async () => {
    if (!newPayment.client_id || !newPayment.amount || !newPayment.mode) {
      return
    }

    await addPayment.mutateAsync({
      client_id: newPayment.client_id,
      payment_date: newPayment.payment_date,
      amount: Number.parseFloat(newPayment.amount),
      mode: newPayment.mode as PaymentMode,
      notes: newPayment.notes || undefined,
    })

    setIsAddDialogOpen(false)
    setNewPayment({
      client_id: "",
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount: "",
      mode: "",
      notes: "",
    })
  }

  const handleDeletePayment = async () => {
    if (deletePaymentId) {
      await deletePayment.mutateAsync(deletePaymentId)
      setDeletePaymentId(null)
    }
  }

  const handlePrintPaymentSlip = (payment: Payment) => {
    setPrintPayment(payment)
    setTimeout(() => {
      const printContent = printRef.current
      if (printContent) {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Payment Receipt</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; }
                  .header { text-align: center; border-bottom: 3px solid #0d9488; padding-bottom: 20px; margin-bottom: 20px; }
                  .logo { max-width: 100px; margin: 0 auto 15px; }
                  .company-name { font-size: 24px; font-weight: bold; color: #0d9488; margin-bottom: 5px; }
                  .receipt-title { font-size: 18px; font-weight: bold; margin: 20px 0; text-align: center; background: #f0f0f0; padding: 10px; }
                  .info-section { margin: 20px 0; }
                  .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                  .label { color: #666; font-weight: 500; }
                  .value { font-weight: 600; }
                  .amount-box { background: #f0fdf4; border: 2px solid #0d9488; padding: 20px; margin: 20px 0; text-align: center; }
                  .amount-label { font-size: 14px; color: #666; margin-bottom: 10px; }
                  .amount-value { font-size: 32px; font-weight: bold; color: #0d9488; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666; font-size: 12px; }
                  @media print { body { padding: 0; } }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
          printWindow.close()
        }
      }
      setPrintPayment(null)
    }, 100)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
              <CreditCard className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Payments</h1>
              <p className="text-sm text-muted-foreground">Total received: ₹{totalPayments.toLocaleString("en-IN")}</p>
            </div>
          </div>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="h-5 w-5" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select
                      value={newPayment.client_id}
                      onValueChange={(value) => setNewPayment({ ...newPayment, client_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={newPayment.payment_date}
                        onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="25000"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Payment Mode</Label>
                    <Select
                      value={newPayment.mode}
                      onValueChange={(value) => setNewPayment({ ...newPayment, mode: value as PaymentMode })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Input
                      placeholder="Payment details"
                      value={newPayment.notes}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    />
                  </div>

                  <Button onClick={handleAddPayment} className="w-full" disabled={addPayment.isPending}>
                    {addPayment.isPending ? "Recording..." : "Record Payment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md animate-fade-in" style={{ animationDelay: "50ms" }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Payments List */}
        <div className="grid gap-4 animate-slide-up">
          {filteredPayments.map((payment, index) => {
            const ModeIcon = paymentModeIcons[payment.mode]
            return (
              <div
                key={payment.id}
                className="bg-card rounded-xl shadow-md border border-border/50 p-4 sm:p-6 hover:shadow-lg transition-all duration-200"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 flex-shrink-0">
                      <ModeIcon className="h-6 w-6 text-success" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{payment.clients?.name || "Unknown"}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(payment.payment_date), "dd MMM yyyy")}
                        <span className="px-2 py-0.5 rounded-full bg-muted text-xs font-medium">{payment.mode}</span>
                      </div>
                      {payment.notes && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{payment.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xl sm:text-2xl font-bold text-success flex items-center">
                        <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" />
                        {Number(payment.amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => handlePrintPaymentSlip(payment)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive flex-shrink-0"
                        onClick={() => setDeletePaymentId(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No payments found</h3>
            <p className="text-muted-foreground">
              {payments.length === 0 ? "Record your first payment!" : "Try adjusting your search"}
            </p>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletePaymentId} onOpenChange={() => setDeletePaymentId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Payment?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this payment and update the client's balance. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePayment}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {printPayment && (
          <div className="hidden">
            <div ref={printRef}>
              <div className="header">
                {companySettings?.logo_url && (
                  <img src={companySettings.logo_url || "/placeholder.svg"} alt="Logo" className="logo" />
                )}
                <div className="company-name">{companySettings?.company_name || "Your Company"}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>{companySettings?.address}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Phone: {companySettings?.phone}</div>
              </div>

              <div className="receipt-title">PAYMENT RECEIPT</div>

              <div className="info-section">
                <div className="info-row">
                  <span className="label">Receipt Date:</span>
                  <span className="value">{format(new Date(printPayment.payment_date), "dd MMM yyyy")}</span>
                </div>
                <div className="info-row">
                  <span className="label">Received From:</span>
                  <span className="value">{printPayment.clients?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Payment Mode:</span>
                  <span className="value">{printPayment.mode}</span>
                </div>
                {printPayment.notes && (
                  <div className="info-row">
                    <span className="label">Notes:</span>
                    <span className="value">{printPayment.notes}</span>
                  </div>
                )}
              </div>

              <div className="amount-box">
                <div className="amount-label">Amount Received</div>
                <div className="amount-value">₹ {Number(printPayment.amount).toLocaleString("en-IN")}</div>
              </div>

              <div className="footer">
                <p>Thank you for your payment!</p>
                <p style={{ marginTop: "10px" }}>
                  This is a computer-generated receipt and does not require a signature.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
