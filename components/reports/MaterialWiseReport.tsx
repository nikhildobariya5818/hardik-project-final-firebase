"use client"

import { useMemo } from "react"
import type { Order } from "@/lib/firebase/types"
import { Package } from "lucide-react"

interface MaterialWiseReportProps {
  orders: Order[]
  detailed?: boolean
}

export function MaterialWiseReport({ orders, detailed = false }: MaterialWiseReportProps) {
  const materialStats = useMemo(() => {
    const stats = ["RETI", "KAPCHI", "GSB", "RABAR"].map((material) => {
      const materialOrders = orders.filter((o) => o.material === material)
      return {
        material,
        orderCount: materialOrders.length,
        totalWeight: materialOrders.reduce((sum, o) => sum + Number(o.weight), 0),
        totalAmount: materialOrders.reduce((sum, o) => sum + Number(o.total), 0),
        avgRate:
          materialOrders.length > 0
            ? materialOrders.reduce((sum, o) => sum + Number(o.rate), 0) / materialOrders.length
            : 0,
      }
    })
    return stats.filter((s) => s.orderCount > 0)
  }, [orders])

  return (
    <div className="bg-card rounded-xl shadow-md border border-border/50">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Material-wise Summary</h2>
            {detailed && <p className="text-sm text-muted-foreground mt-1">Detailed breakdown by material type</p>}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Material</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Deliveries</th>
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total Weight</th>
              {detailed && <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Avg Rate</th>}
              <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {materialStats.map((stat) => (
              <tr key={stat.material} className="border-b border-border/50 hover:bg-muted/50">
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {stat.material}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-medium">{stat.orderCount}</td>
                <td className="px-6 py-4 text-right font-medium">{stat.totalWeight.toFixed(2)} MT</td>
                {detailed && <td className="px-6 py-4 text-right font-medium">₹{stat.avgRate.toFixed(2)}</td>}
                <td className="px-6 py-4 text-right font-semibold text-success">
                  ₹{stat.totalAmount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
            <tr className="bg-muted/50 font-semibold">
              <td className="px-6 py-4">TOTAL</td>
              <td className="px-6 py-4 text-right">{materialStats.reduce((sum, s) => sum + s.orderCount, 0)}</td>
              <td className="px-6 py-4 text-right">
                {materialStats.reduce((sum, s) => sum + s.totalWeight, 0).toFixed(2)} MT
              </td>
              {detailed && <td className="px-6 py-4 text-right">-</td>}
              <td className="px-6 py-4 text-right">
                ₹{materialStats.reduce((sum, s) => sum + s.totalAmount, 0).toLocaleString("en-IN")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
