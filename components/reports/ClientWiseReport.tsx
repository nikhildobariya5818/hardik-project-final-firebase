"use client"

import { useMemo } from "react"
import type { Client, Order, Payment } from "@/lib/firebase/types"

interface ClientWiseReportProps {
  clients: Client[]
  orders: Order[]
  payments: Payment[]
  selectedClient?: string
}

export function ClientWiseReport({ clients, orders, payments, selectedClient }: ClientWiseReportProps) {
  const reportData = useMemo(() => {
    const displayClients = selectedClient ? clients.filter((c) => c.id === selectedClient) : clients

    return displayClients.map((client) => {
      const clientOrders = orders.filter((o) => o.client_id === client.id)
      const clientPayments = payments.filter((p) => p.client_id === client.id)

      const totalOrders = clientOrders.reduce((sum, o) => sum + Number(o.total), 0)
      const totalPayments = clientPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      const pendingBalance = client.opening_balance + totalOrders - totalPayments

      return {
        client,
        orderCount: clientOrders.length,
        totalWeight: clientOrders.reduce((sum, o) => sum + Number(o.weight), 0),
        totalOrders,
        totalPayments,
        pendingBalance,
      }
    })
  }, [clients, orders, payments, selectedClient])

  return (
    <div className="bg-card rounded-xl shadow-md border border-border/50">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold">Client-Wise Report</h2>
        <p className="text-sm text-muted-foreground mt-1">Detailed breakdown by client</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Client</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Orders</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Weight (MT)</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total Orders</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Payments</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Pending Balance</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row) => (
              <tr key={row.client.id} className="border-b border-border/50 hover:bg-muted/50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{row.client.name}</p>
                    <p className="text-sm text-muted-foreground">{row.client.city}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-medium">{row.orderCount}</td>
                <td className="px-6 py-4 text-right font-medium">{row.totalWeight.toFixed(2)}</td>
                <td className="px-6 py-4 text-right font-semibold text-primary">
                  ₹{row.totalOrders.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-green-600">
                  ₹{row.totalPayments.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 text-right font-semibold">
                  <span className={row.pendingBalance > 0 ? "text-orange-600" : "text-green-600"}>
                    ₹{Math.abs(row.pendingBalance).toLocaleString("en-IN")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
