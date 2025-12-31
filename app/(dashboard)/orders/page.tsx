"use client"

import { useState, useRef } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOrders, useAddOrder, useDeleteOrder, useUpdateOrder } from "@/hooks/useOrders"
import { useClients } from "@/hooks/useClients"
import { useMaterialRates, useCompanySettings } from "@/hooks/useSettings"
import { useAuth } from "@/contexts/AuthContext"
import type { MaterialType, Order } from "@/types"
import { Truck, Plus, Search, Filter, Calendar, Edit, Trash2, Printer, Loader2 } from "lucide-react"
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

export default function Orders() {
  const { isAdmin } = useAuth()
  const { data: orders = [], isLoading: ordersLoading } = useOrders()
  const { data: clients = [], isLoading: clientsLoading } = useClients()
  const { data: materialRates = [] } = useMaterialRates()
  const { data: companySettings } = useCompanySettings()
  const addOrder = useAddOrder()
  const deleteOrder = useDeleteOrder()
  const updateOrder = useUpdateOrder()

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [materialFilter, setMaterialFilter] = useState<string>("all")
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const [clientSearch, setClientSearch] = useState("")

  const [newOrder, setNewOrder] = useState({
    client_id: "",
    order_date: format(new Date(), "yyyy-MM-dd"),
    order_time: format(new Date(), "HH:mm"),
    weight: "",
    material: "" as MaterialType | "",
    rate: "",
    location: "",
    truck_number: "",
    delivery_boy_name: "",
    delivery_boy_mobile: "",
    notes: "",
  })

  const [editForm, setEditForm] = useState({
    client_id: "",
    order_date: "",
    order_time: "",
    weight: "",
    material: "" as MaterialType | "",
    rate: "",
    location: "",
    truck_number: "",
    delivery_boy_name: "",
    delivery_boy_mobile: "",
    notes: "",
  })

  const isLoading = ordersLoading || clientsLoading

  const filteredClientsForDropdown = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()),
  )

  const filteredOrders = orders.filter((order) => {
    const clientName = order.clients?.name || ""
    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.truck_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMaterial = materialFilter === "all" || order.material === materialFilter

    return matchesSearch && matchesMaterial
  })

  const handleMaterialChange = (material: MaterialType) => {
    const rate = materialRates.find((r) => r.material === material)?.rate || 0
    setNewOrder({ ...newOrder, material, rate: rate.toString() })
  }

  const handleEditMaterialChange = (material: MaterialType) => {
    const rate = materialRates.find((r) => r.material === material)?.rate || 0
    setEditForm({ ...editForm, material, rate: rate.toString() })
  }

  const calculateTotal = () => {
    const weight = Number.parseFloat(newOrder.weight) || 0
    const rate = Number.parseFloat(newOrder.rate) || 0
    return weight * rate
  }

  const calculateEditTotal = () => {
    const weight = Number.parseFloat(editForm.weight) || 0
    const rate = Number.parseFloat(editForm.rate) || 0
    return weight * rate
  }

  const handleAddOrder = async () => {
    if (!newOrder.client_id || !newOrder.material || !newOrder.weight || !newOrder.rate) {
      return
    }

    await addOrder.mutateAsync({
      client_id: newOrder.client_id,
      order_date: newOrder.order_date,
      order_time: newOrder.order_time,
      weight: Number.parseFloat(newOrder.weight),
      material: newOrder.material as MaterialType,
      rate: Number.parseFloat(newOrder.rate),
      total: calculateTotal(),
      location: newOrder.location || undefined,
      truck_number: newOrder.truck_number || undefined,
      delivery_boy_name: newOrder.delivery_boy_name || undefined,
      delivery_boy_mobile: newOrder.delivery_boy_mobile || undefined,
      notes: newOrder.notes || undefined,
    })

    setIsAddDialogOpen(false)
    setNewOrder({
      client_id: "",
      order_date: format(new Date(), "yyyy-MM-dd"),
      order_time: format(new Date(), "HH:mm"),
      weight: "",
      material: "",
      rate: "",
      location: "",
      truck_number: "",
      delivery_boy_name: "",
      delivery_boy_mobile: "",
      notes: "",
    })
    setClientSearch("")
  }

  const handleDeleteOrder = async () => {
    if (deleteOrderId) {
      await deleteOrder.mutateAsync(deleteOrderId)
      setDeleteOrderId(null)
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditOrder(order)
    setEditForm({
      client_id: order.client_id,
      order_date: order.order_date,
      order_time: order.order_time,
      weight: order.weight.toString(),
      material: order.material,
      rate: order.rate.toString(),
      location: order.location || "",
      truck_number: order.truck_number || "",
      delivery_boy_name: order.delivery_boy_name || "",
      delivery_boy_mobile: order.delivery_boy_mobile || "",
      notes: order.notes || "",
    })
  }

  const handleUpdateOrder = async () => {
    if (editOrder) {
      await updateOrder.mutateAsync({
        id: editOrder.id,
        client_id: editForm.client_id,
        order_date: editForm.order_date,
        order_time: editForm.order_time,
        weight: Number.parseFloat(editForm.weight),
        material: editForm.material as MaterialType,
        rate: Number.parseFloat(editForm.rate),
        total: calculateEditTotal(),
        location: editForm.location || undefined,
        truck_number: editForm.truck_number || undefined,
        delivery_boy_name: editForm.delivery_boy_name || undefined,
        delivery_boy_mobile: editForm.delivery_boy_mobile || undefined,
        notes: editForm.notes || undefined,
      })
      setEditOrder(null)
    }
  }

  const handlePrintOrder = (order: Order) => {
    setPrintOrder(order)
    setTimeout(() => {
      const printContent = printRef.current
      if (printContent) {
        const printWindow = window.open("", "_blank")
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Order Receipt</title>
                <style>
                  body { font-family: Arial, sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
                  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
                  .logo { max-width: 120px; margin: 0 auto 10px; }
                  .company { font-size: 18px; font-weight: bold; }
                  .info-row { display: flex; justify-content: space-between; padding: 5px 0; }
                  .label { color: #666; }
                  .value { font-weight: 600; }
                  .total { font-size: 20px; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
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
      setPrintOrder(null)
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
              <Truck className="h-6 w-6 text-success" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Orders</h1>
              <p className="text-sm text-muted-foreground">{orders.length} total deliveries</p>
            </div>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero">
                <Plus className="h-5 w-5" />
                New Order
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input
                    placeholder="Search client by name..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="mb-2"
                  />
                  <Select
                    value={newOrder.client_id}
                    onValueChange={(value) => setNewOrder({ ...newOrder, client_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredClientsForDropdown.map((client) => (
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
                      value={newOrder.order_date}
                      onChange={(e) => setNewOrder({ ...newOrder, order_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newOrder.order_time}
                      onChange={(e) => setNewOrder({ ...newOrder, order_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Material</Label>
                    <Select
                      value={newOrder.material}
                      onValueChange={(value) => handleMaterialChange(value as MaterialType)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialRates.map((item) => (
                          <SelectItem key={item.material} value={item.material}>
                            {item.material}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (MT)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="52.660"
                      value={newOrder.weight}
                      onChange={(e) => setNewOrder({ ...newOrder, weight: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Rate (₹/MT)</Label>
                    <Input
                      type="number"
                      value={newOrder.rate}
                      onChange={(e) => setNewOrder({ ...newOrder, rate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Amount</Label>
                    <Input
                      readOnly
                      value={`₹ ${calculateTotal().toLocaleString("en-IN")}`}
                      className="bg-muted font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Location</Label>
                  <Input
                    placeholder="Site A, Naroda"
                    value={newOrder.location}
                    onChange={(e) => setNewOrder({ ...newOrder, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Truck Number (Optional)</Label>
                  <Input
                    placeholder="GJ-01-AB-1234"
                    value={newOrder.truck_number}
                    onChange={(e) => setNewOrder({ ...newOrder, truck_number: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Delivery Boy Name</Label>
                    <Input
                      placeholder="Driver name"
                      value={newOrder.delivery_boy_name}
                      onChange={(e) => setNewOrder({ ...newOrder, delivery_boy_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number</Label>
                    <Input
                      placeholder="9876543210"
                      value={newOrder.delivery_boy_mobile}
                      onChange={(e) => setNewOrder({ ...newOrder, delivery_boy_mobile: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="Any additional notes"
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  />
                </div>

                <Button onClick={handleAddOrder} className="w-full" disabled={addOrder.isPending}>
                  {addOrder.isPending ? "Adding..." : "Add Order"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: "50ms" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by client, truck, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={materialFilter} onValueChange={setMaterialFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Material" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Materials</SelectItem>
              {materialRates.map((item) => (
                <SelectItem key={item.material} value={item.material}>
                  {item.material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table - Desktop */}
        <div className="hidden md:block bg-card rounded-xl shadow-md border border-border/50 overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date & Time</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Material</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Weight</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Rate</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Location</th>
                  <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-center px-6 py-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{format(new Date(order.order_date), "dd MMM")}</p>
                          <p className="text-sm text-muted-foreground">{order.order_time}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.clients?.name || "Unknown"}</p>
                      {order.truck_number && <p className="text-sm text-muted-foreground">{order.truck_number}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {order.material}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{Number(order.weight).toFixed(3)} MT</td>
                    <td className="px-6 py-4 text-muted-foreground">₹{Number(order.rate)}/MT</td>
                    <td className="px-6 py-4 text-sm">{order.location || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-success">₹{Number(order.total).toLocaleString("en-IN")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePrintOrder(order)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditOrder(order)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteOrderId(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Cards - Mobile */}
        <div className="md:hidden space-y-4 animate-slide-up">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-card rounded-xl shadow-md border border-border/50 p-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-lg">{order.clients?.name || "Unknown"}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(order.order_date), "dd MMM")} • {order.order_time}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {order.material}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Weight:</span>
                  <span className="font-medium">{Number(order.weight).toFixed(3)} MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">₹{Number(order.rate)}/MT</span>
                </div>
                {order.location && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{order.location}</span>
                  </div>
                )}
                {order.truck_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Truck:</span>
                    <span className="font-medium">{order.truck_number}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-medium">Total:</span>
                  <span className="font-semibold text-success text-lg">
                    ₹{Number(order.total).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handlePrintOrder(order)}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Print
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleEditOrder(order)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive bg-transparent"
                      onClick={() => setDeleteOrderId(order.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No orders found</h3>
            <p className="text-muted-foreground">
              {orders.length === 0 ? "Add your first order to get started!" : "Try adjusting your filters"}
            </p>
          </div>
        )}

        {/* Edit Order Dialog */}
        <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Client</Label>
                <Select
                  value={editForm.client_id}
                  onValueChange={(value) => setEditForm({ ...editForm, client_id: value })}
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
                    value={editForm.order_date}
                    onChange={(e) => setEditForm({ ...editForm, order_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={editForm.order_time}
                    onChange={(e) => setEditForm({ ...editForm, order_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Select
                    value={editForm.material}
                    onValueChange={(value) => handleEditMaterialChange(value as MaterialType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialRates.map((item) => (
                        <SelectItem key={item.material} value={item.material}>
                          {item.material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Weight (MT)</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rate (₹/MT)</Label>
                  <Input
                    type="number"
                    value={editForm.rate}
                    onChange={(e) => setEditForm({ ...editForm, rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input
                    readOnly
                    value={`₹ ${calculateEditTotal().toLocaleString("en-IN")}`}
                    className="bg-muted font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Delivery Location</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Truck Number (Optional)</Label>
                <Input
                  value={editForm.truck_number}
                  onChange={(e) => setEditForm({ ...editForm, truck_number: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Boy Name</Label>
                  <Input
                    placeholder="Driver name"
                    value={editForm.delivery_boy_name}
                    onChange={(e) => setEditForm({ ...editForm, delivery_boy_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    placeholder="9876543210"
                    value={editForm.delivery_boy_mobile}
                    onChange={(e) => setEditForm({ ...editForm, delivery_boy_mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              </div>

              <Button onClick={handleUpdateOrder} className="w-full" disabled={updateOrder.isPending}>
                {updateOrder.isPending ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this order and update the client's balance. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteOrder}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Hidden Print Content */}
        {printOrder && (
          <div className="hidden">
            <div ref={printRef}>
              <div className="header">
                {companySettings?.logo_url && (
                  <img src={companySettings.logo_url || "/placeholder.svg"} alt="Company Logo" className="logo" />
                )}
                <div className="company">{companySettings?.company_name || "DeliveryPro"}</div>
                <div>{companySettings?.phone || ""}</div>
              </div>
              <div className="info-row">
                <span className="label">Client:</span>
                <span className="value">{printOrder.clients?.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Date:</span>
                <span className="value">
                  {format(new Date(printOrder.order_date), "dd/MM/yyyy")} {printOrder.order_time}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Material:</span>
                <span className="value">{printOrder.material}</span>
              </div>
              <div className="info-row">
                <span className="label">Weight:</span>
                <span className="value">{Number(printOrder.weight).toFixed(3)} MT</span>
              </div>
              <div className="info-row">
                <span className="label">Rate:</span>
                <span className="value">₹{Number(printOrder.rate)}/MT</span>
              </div>
              {printOrder.location && (
                <div className="info-row">
                  <span className="label">Location:</span>
                  <span className="value">{printOrder.location}</span>
                </div>
              )}
              {printOrder.truck_number && (
                <div className="info-row">
                  <span className="label">Truck:</span>
                  <span className="value">{printOrder.truck_number}</span>
                </div>
              )}
              {printOrder.delivery_boy_name && (
                <div className="info-row">
                  <span className="label">Delivery Boy:</span>
                  <span className="value">{printOrder.delivery_boy_name}</span>
                </div>
              )}
              {printOrder.delivery_boy_mobile && (
                <div className="info-row">
                  <span className="label">Mobile:</span>
                  <span className="value">{printOrder.delivery_boy_mobile}</span>
                </div>
              )}
              <div className="info-row total">
                <span className="label">Total:</span>
                <span className="value">₹{Number(printOrder.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
