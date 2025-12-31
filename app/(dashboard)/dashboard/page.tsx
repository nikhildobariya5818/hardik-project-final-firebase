"use client"

import { MainLayout } from "@/components/layout/MainLayout"
import { StatCard } from "@/components/ui/stat-card"
import { useAuth } from "@/contexts/AuthContext"
import { useClients } from "@/hooks/useClients"
import { useOrders } from "@/hooks/useOrders"
import { Users, Truck, Package, Clock, Loader2 } from "lucide-react"
import { format } from "date-fns"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: orders = [], isLoading: ordersLoading } = useOrders()

  const isLoading = clientsLoading || ordersLoading

  const totalClients = clients.length
  const totalOrders = orders.length
  const todayOrders = orders.filter((o) => o.order_date === format(new Date(), "yyyy-MM-dd")).length

  const recentOrders = orders.slice(0, 5)

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
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"},{" "}
            {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Here's what's happening with your business today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <StatCard
            title="Total Clients"
            value={totalClients}
            icon={Users}
            variant="primary"
            description="Active clients"
          />
          <StatCard
            title="Today's Orders"
            value={todayOrders}
            icon={Truck}
            variant="success"
            description={`${totalOrders} total orders`}
          />
          <StatCard
            title="Total Deliveries"
            value={totalOrders}
            icon={Package}
            variant="accent"
            description="All time deliveries"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl shadow-md border border-border/50 animate-slide-up">
          <div className="p-4 sm:p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold">Recent Orders</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Latest delivery entries</p>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Client
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Material
                  </th>
                  <th className="text-left px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Weight
                  </th>
                  <th className="text-right px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">
                          {format(new Date(order.order_date), "dd MMM yyyy")}
                        </p>
                        <p className="text-xs text-muted-foreground">{order.order_time}</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="font-medium text-xs sm:text-sm">{order.clients?.name || "Unknown"}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {order.material}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <p className="font-medium text-xs sm:text-sm">{Number(order.weight).toFixed(2)} MT</p>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                      <p className="font-semibold text-success text-xs sm:text-sm">
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </p>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground text-sm">
                      No orders yet. Add your first order to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Material Summary */}
        <div
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-slide-up"
          style={{ animationDelay: "100ms" }}
        >
          {["RETI", "KAPCHI", "GSB", "RABAR"].map((material, index) => {
            const materialOrders = orders.filter((o) => o.material === material)
            const totalWeight = materialOrders.reduce((sum, o) => sum + Number(o.weight), 0)
            return (
              <div
                key={material}
                className="bg-card rounded-xl p-4 sm:p-6 shadow-md border border-border/50"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-accent/10">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base">{material}</h3>
                </div>
                <p className="text-xl sm:text-2xl font-bold">{totalWeight.toFixed(2)} MT</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{materialOrders.length} deliveries</p>
              </div>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}
