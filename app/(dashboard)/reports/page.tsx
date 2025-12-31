"use client"

import { MainLayout } from "@/components/layout/MainLayout"
import { StatCard } from "@/components/ui/stat-card"
import { useOrders } from "@/hooks/useOrders"
import { useClients } from "@/hooks/useClients"
import { usePayments } from "@/hooks/usePayments"
import { BarChart3, TrendingUp, Package, IndianRupee, Users, Truck, Loader2 } from "lucide-react"

export default function Reports() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: payments = [], isLoading: paymentsLoading } = usePayments()

  const isLoading = ordersLoading || clientsLoading || paymentsLoading

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const pendingAmount = clients.reduce((sum, c) => sum + Number(c.current_balance), 0)

  const materialStats = ["RETI", "KAPCHI", "GSB", "RABAR"].map((material) => {
    const materialOrders = orders.filter((o) => o.material === material)
    return {
      material,
      totalWeight: materialOrders.reduce((sum, o) => sum + Number(o.weight), 0),
      totalAmount: materialOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orderCount: materialOrders.length,
    }
  })

  const topClients = [...clients].sort((a, b) => Number(b.current_balance) - Number(a.current_balance)).slice(0, 5)

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
      <div className="space-y-8">
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-sm text-muted-foreground">Business performance overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={`₹${totalRevenue.toLocaleString("en-IN")}`}
            icon={TrendingUp}
            variant="success"
          />
          <StatCard
            title="Total Collected"
            value={`₹${totalPayments.toLocaleString("en-IN")}`}
            icon={IndianRupee}
            variant="primary"
          />
          <StatCard
            title="Pending Amount"
            value={`₹${pendingAmount.toLocaleString("en-IN")}`}
            icon={Users}
            variant="warning"
          />
          <StatCard title="Total Deliveries" value={orders.length} icon={Truck} variant="accent" />
        </div>

        <div className="bg-card rounded-xl shadow-md border border-border/50">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-semibold">Material-wise Summary</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Material</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Deliveries</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total Weight</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {materialStats.map((stat) => (
                  <tr key={stat.material} className="border-b border-border/50">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                        {stat.material}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{stat.orderCount}</td>
                    <td className="px-6 py-4 text-right font-medium">{stat.totalWeight.toFixed(2)} MT</td>
                    <td className="px-6 py-4 text-right font-semibold text-success">
                      ₹{stat.totalAmount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-md border border-border/50">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Outstanding Balances</h2>
          </div>
          <div className="divide-y divide-border/50">
            {topClients.map((client, index) => (
              <div key={client.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.city}</p>
                  </div>
                </div>
                <p className="font-semibold text-warning flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {Number(client.current_balance).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
