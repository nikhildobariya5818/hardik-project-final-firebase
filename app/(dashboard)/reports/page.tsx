"use client"

import { useState, useMemo } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { StatCard } from "@/components/ui/stat-card"
import { useOrders } from "@/hooks/useOrders"
import { useClients } from "@/hooks/useClients"
import { usePayments } from "@/hooks/usePayments"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, TrendingUp, IndianRupee, Users, Truck, Loader2 } from "lucide-react"
import { ClientWiseReport } from "@/components/reports/ClientWiseReport"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { generateReportPDF } from "@/lib/reports/pdf-generator"
import { MaterialWiseReport } from "@/components/reports/MaterialWiseReport"
import { PendingPaymentReport } from "@/components/reports/PendingPaymentReport"

type ReportType = "overview" | "client-wise" | "material-wise" | "pending-payments"

export default function Reports() {
  const { data: orders = [], isLoading: ordersLoading } = useOrders()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: payments = [], isLoading: paymentsLoading } = usePayments()
  const [reportType, setReportType] = useState<ReportType>("overview")
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [selectedClient, setSelectedClient] = useState<string>("all")
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all")
  const [isExporting, setIsExporting] = useState(false)

  const isLoading = ordersLoading || clientsLoading || paymentsLoading

  const filteredOrders = useMemo(() => {
    let filtered = [...orders]

    if (selectedMonth !== "all") {
      const [year, month] = selectedMonth.split("-")
      filtered = filtered.filter((o) => {
        const orderDate = new Date(o.order_date)
        return orderDate.getFullYear() === Number.parseInt(year) && orderDate.getMonth() === Number.parseInt(month) - 1
      })
    }

    if (selectedClient !== "all") {
      filtered = filtered.filter((o) => o.client_id === selectedClient)
    }

    if (selectedMaterial !== "all") {
      filtered = filtered.filter((o) => o.material === selectedMaterial)
    }

    return filtered
  }, [orders, selectedMonth, selectedClient, selectedMaterial])

  const filteredPayments = useMemo(() => {
    let filtered = [...payments]

    if (selectedMonth !== "all") {
      const [year, month] = selectedMonth.split("-")
      filtered = filtered.filter((p) => {
        const paymentDate = new Date(p.payment_date)
        return (
          paymentDate.getFullYear() === Number.parseInt(year) && paymentDate.getMonth() === Number.parseInt(month) - 1
        )
      })
    }

    if (selectedClient !== "all") {
      filtered = filtered.filter((p) => p.client_id === selectedClient)
    }

    return filtered
  }, [payments, selectedMonth, selectedClient])

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total), 0)
  const totalPayments = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const pendingAmount = filteredOrders.reduce((sum, o) => sum + Number(o.total), 0) - totalPayments

  // Generate unique months from orders
  const months = useMemo(() => {
    const uniqueMonths = new Set<string>()
    orders.forEach((o) => {
      const date = new Date(o.order_date)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      uniqueMonths.add(`${year}-${month}`)
    })
    return Array.from(uniqueMonths).sort().reverse()
  }, [orders])

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const filters = {
        reportType,
        month: selectedMonth,
        client: selectedClient,
        material: selectedMaterial,
      }

      const clientName = selectedClient !== "all" ? clients.find((c) => c.id === selectedClient)?.name : undefined
      const materialName = selectedMaterial !== "all" ? selectedMaterial : undefined

      await generateReportPDF(
        {
          orders: filteredOrders,
          payments: filteredPayments,
          clients: clients.filter((c) => selectedClient === "all" || c.id === selectedClient),
        },
        reportType,
        {
          month: selectedMonth,
          clientName,
          material: materialName,
        },
      )
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Reports & Analytics</h1>
              <p className="text-sm text-muted-foreground">Dynamic business performance overview</p>
            </div>
          </div>
          <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2 bg-transparent" variant="outline">
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export PDF"}
          </Button>
        </div>

        <div className="bg-card rounded-xl shadow-md border border-border/50 p-6">
          <div className="flex flex-col gap-6">
            <div>
              <label className="text-sm font-medium mb-3 block">Report Type</label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {[
                  { value: "overview", label: "Overview" },
                  { value: "client-wise", label: "Client-Wise" },
                  { value: "material-wise", label: "Material-Wise" },
                  { value: "pending-payments", label: "Pending Payments" },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setReportType(type.value as ReportType)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      reportType === type.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {months.map((month) => {
                      const [year, monthNum] = month.split("-")
                      const monthName = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1).toLocaleString(
                        "en-IN",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )
                      return (
                        <SelectItem key={month} value={month}>
                          {monthName}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Client</label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Clients" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Material</label>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Materials" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Materials</SelectItem>
                    {["RETI", "KAPCHI", "GSB", "RABAR"].map((mat) => (
                      <SelectItem key={mat} value={mat}>
                        {mat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {reportType === "overview" && (
          <div className="space-y-8">
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
                variant={pendingAmount > 0 ? "warning" : "success"}
              />
              <StatCard title="Total Deliveries" value={filteredOrders.length} icon={Truck} variant="accent" />
            </div>

            {/* Material-wise Summary Table */}
            <MaterialWiseReport orders={filteredOrders} />

            {/* Outstanding Balances */}
            <div className="bg-card rounded-xl shadow-md border border-border/50">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold">Outstanding Balances</h2>
              </div>
              <div className="divide-y divide-border/50">
                {clients
                  .filter((c) => selectedClient === "all" || c.id === selectedClient)
                  .sort((a, b) => Number(b.current_balance) - Number(a.current_balance))
                  .slice(0, 10)
                  .map((client, index) => (
                    <div key={client.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.city}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-semibold flex items-center gap-1 ${
                            Number(client.current_balance) > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          <IndianRupee className="h-4 w-4" />
                          {Math.abs(Number(client.current_balance)).toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Number(client.current_balance) > 0 ? "Pending" : "Prepaid"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {reportType === "client-wise" && (
          <ClientWiseReport
            clients={clients}
            orders={filteredOrders}
            payments={filteredPayments}
            selectedClient={selectedClient}
          />
        )}

        {reportType === "material-wise" && <MaterialWiseReport orders={filteredOrders} detailed />}

        {reportType === "pending-payments" && (
          <PendingPaymentReport
            clients={clients}
            orders={orders}
            payments={payments}
            selectedClient={selectedClient}
            selectedMonth={selectedMonth}
          />
        )}
      </div>
    </MainLayout>
  )
}
