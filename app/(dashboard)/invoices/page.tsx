"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useInvoices, useDeleteInvoice } from "@/hooks/useInvoices"
import { Receipt, Plus, Eye, Pencil, Trash2, Loader2, FileText } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
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
import { useToast } from "@/hooks/use-toast"

export default function Invoices() {
  const { data: invoices = [], isLoading } = useInvoices()
  const deleteInvoice = useDeleteInvoice()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteInvoice.mutateAsync(deleteId)
      toast({
        title: "Invoice deleted",
        description: "The invoice has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>
              <p className="text-sm text-muted-foreground">Manage and generate client invoices</p>
            </div>
          </div>
          <Link href="/invoices/create">
            <Button size="lg" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>

        {invoices.length === 0 ? (
          <Card className="text-center p-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <FileText className="h-10 w-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">No Invoices Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Get started by creating your first invoice</p>
                <Link href="/invoices/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Invoice #</th>
                    <th className="text-left p-4 font-semibold">Client</th>
                    <th className="text-left p-4 font-semibold hidden sm:table-cell">Period</th>
                    <th className="text-right p-4 font-semibold">Amount</th>
                    <th className="text-center p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-semibold text-primary">{invoice.invoice_number}</span>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {format(new Date(invoice.bill_month), "MMM yyyy")}
                        </p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{invoice.clients?.name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.clients?.city}</p>
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">{format(new Date(invoice.bill_month), "MMMM yyyy")}</td>
                      <td className="p-4 text-right font-semibold">
                        ₹{invoice.total_payable.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/invoices/${invoice.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(invoice.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  )
}
