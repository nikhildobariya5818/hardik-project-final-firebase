"use client"

import { useMemo } from "react"
import type { Client, Order, Payment } from "@/lib/firebase/types"
import { AlertCircle } from "lucide-react"

interface PendingPaymentReportProps {
  clients: Client[]
  orders: Order[]
  payments: Payment[]
  selectedClient?: string
  selectedMonth?: string
}

export function PendingPaymentReport({
  clients,
  orders,
  payments,
  selectedClient,
  selectedMonth,
}: PendingPaymentReportProps) {
  const pendingData = useMemo(() => {
    const displayClients = selectedClient ? clients.filter((c) => c.id === selectedClient) : clients

    return displayClients
      .map((client) => {
        const clientOrders = selectedMonth
          ? orders.filter((o) => {
              if (o.client_id !== client.id) return false
              const [year, month] = selectedMonth.split("-")
              const orderDate = new Date(o.order_date)
              return (
                orderDate.getFullYear() === Number.parseInt(year) && orderDate.getMonth() === Number.parseInt(month) - 1
              )
            })
          : orders.filter((o) => o.client_id === client.id)

        const clientPayments = selectedMonth
          ? payments.filter((p) => {
              if (p.client_id !== client.id) return false
              const [year, month] = selectedMonth.split("-")
              const paymentDate = new Date(p.payment_date)
              return (
                paymentDate.getFullYear() === Number.parseInt(year) &&
                paymentDate.getMonth() === Number.parseInt(month) - 1
              )
            })
          : payments.filter((p) => p.client_id === client.id)

        const totalOrders = clientOrders.reduce((sum, o) => sum + Number(o.total), 0)
        const totalPayments = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const pendingBalance = client.opening_balance + totalOrders - totalPayments

        return {
          client,
          month: selectedMonth || "All",
          orders: clientOrders,
          payments: clientPayments,
          totalOrders,
          totalPayments,
          pendingBalance,
        }
      })
      .filter((d) => d.pendingBalance > 0)
      .sort((a, b) => b.pendingBalance - a.pendingBalance)
  }, [clients, orders, payments, selectedClient, selectedMonth])

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl shadow-md border border-border/50">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <AlertCircle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Pending Payments Report</h2>
              <p className="text-sm text-muted-foreground mt-1">Clients with outstanding balances</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/50">
          {pendingData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-muted-foreground">No pending payments</p>
            </div>
          ) : (
            pendingData.map((row) => (
              <div key={row.client.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{row.client.name}</h3>
                    <p className="text-sm text-muted-foreground">{row.client.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">₹{row.pendingBalance.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground mt-1">Pending Balance</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Orders Count</p>
                    <p className="font-semibold">{row.orders.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Orders</p>
                    <p className="font-semibold text-primary">₹{row.totalOrders.toLocaleString("en-IN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payments Received</p>
                    <p className="font-semibold text-green-600">₹{row.totalPayments.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Monthly Pending Breakdown */}
      {!selectedMonth && (
        <div className="bg-card rounded-xl shadow-md border border-border/50">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Pending by Month</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Month</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Orders</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Payments</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Pending</th>
                </tr>
              </thead>
              <tbody>
                {pendingData.map((row) => (
                  <tr key={row.client.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium">{row.client.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.month === "All" ? "All Time" : row.month}</td>
                    <td className="px-6 py-4 text-right">₹{row.totalOrders.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-right text-green-600">
                      ₹{row.totalPayments.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-orange-600">
                      ₹{row.pendingBalance.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
