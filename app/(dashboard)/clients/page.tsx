"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useClients, useAddClient, useDeleteClient, useUpdateClient } from "@/hooks/useClients"
import { useOrdersByClient } from "@/hooks/useOrders"
import { useAuth } from "@/contexts/AuthContext"
import type { Client } from "@/lib/firebase/types"
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  IndianRupee,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2,
  ArrowLeft,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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

export default function ClientsPage() {
  const { isAdmin } = useAuth()
  const { data: clients = [], isLoading } = useClients()
  const addClient = useAddClient()
  const deleteClient = useDeleteClient()
  const updateClient = useUpdateClient()

  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [viewClient, setViewClient] = useState<Client | null>(null)

  const [newClient, setNewClient] = useState({
    name: "",
    city: "",
    phone: "",
    address: "",
    opening_balance: "",
  })

  const [editForm, setEditForm] = useState({
    name: "",
    city: "",
    phone: "",
    address: "",
    opening_balance: "",
  })

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery),
  )

  const handleAddClient = async () => {
    await addClient.mutateAsync({
      name: newClient.name,
      city: newClient.city,
      phone: newClient.phone,
      address: newClient.address || undefined,
      opening_balance: Number.parseFloat(newClient.opening_balance) || 0,
    })
    setIsAddDialogOpen(false)
    setNewClient({ name: "", city: "", phone: "", address: "", opening_balance: "" })
  }

  const handleDeleteClient = async () => {
    if (deleteClientId) {
      await deleteClient.mutateAsync(deleteClientId)
      setDeleteClientId(null)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditClient(client)
    setEditForm({
      name: client.name,
      city: client.city,
      phone: client.phone,
      address: client.address || "",
      opening_balance: client.opening_balance?.toString() || "0",
    })
  }

  const handleUpdateClient = async () => {
    if (editClient) {
      await updateClient.mutateAsync({
        id: editClient.id,
        name: editForm.name,
        city: editForm.city,
        phone: editForm.phone,
        address: editForm.address || undefined,
        opening_balance: Number.parseFloat(editForm.opening_balance) || 0,
      })
      setEditClient(null)
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

  // Client Detail View
  if (viewClient) {
    return <ClientDetailView client={viewClient} onBack={() => setViewClient(null)} />
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Clients</h1>
              <p className="text-sm text-muted-foreground">{clients.length} total clients</p>
            </div>
          </div>
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="hero">
                  <Plus className="h-5 w-5" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input
                      placeholder="e.g., VIPULBHAI PATEL"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input
                        placeholder="Ahmedabad"
                        value={newClient.city}
                        onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="9876543210"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address (Optional)</Label>
                    <Input
                      placeholder="Full address"
                      value={newClient.address}
                      onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opening Balance</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={newClient.opening_balance}
                      onChange={(e) => setNewClient({ ...newClient, opening_balance: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddClient} className="w-full" disabled={addClient.isPending}>
                    {addClient.isPending ? "Adding..." : "Add Client"}
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
            placeholder="Search by name, city, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Client Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <div
              key={client.id}
              className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {client.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{client.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {client.city}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setViewClient(client)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClient(client)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteClientId(client.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>

                  <div className="pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className="font-semibold text-lg flex items-center text-warning">
                        <IndianRupee className="h-4 w-4" />
                        {Number(client.current_balance).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-muted/30 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-primary hover:text-primary"
                  onClick={() => setViewClient(client)}
                >
                  View Orders
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No clients found</h3>
            <p className="text-muted-foreground">
              {clients.length === 0 ? "Add your first client to get started!" : "Try adjusting your search query"}
            </p>
          </div>
        )}

        {/* Edit Client Dialog */}
        <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Client Name</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address (Optional)</Label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Opening Balance</Label>
                <Input
                  type="number"
                  value={editForm.opening_balance}
                  onChange={(e) => setEditForm({ ...editForm, opening_balance: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdateClient} className="w-full" disabled={updateClient.isPending}>
                {updateClient.isPending ? "Updating..." : "Update Client"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteClientId} onOpenChange={() => setDeleteClientId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this client and all their orders and payments. This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteClient}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  )
}

// Client Detail View Component
function ClientDetailView({ client, onBack }: { client: Client; onBack: () => void }) {
  const { data: orders = [], isLoading } = useOrdersByClient(client.id)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Button>

        {/* Client Header */}
        <div className="bg-card rounded-xl shadow-md border border-border/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl">
              {client.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold">{client.name}</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {client.city}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {client.phone}
                </span>
              </div>
              {client.address && <p className="text-sm text-muted-foreground mt-2">{client.address}</p>}
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right">
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-xl sm:text-2xl font-bold text-warning flex items-center sm:justify-end">
                <IndianRupee className="h-5 w-5" />
                {Number(client.current_balance).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl shadow-md border border-border/50 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Order History</h2>
            <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No orders found for this client</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Material</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Weight</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium">{format(new Date(order.order_date), "dd MMM yyyy")}</p>
                        <p className="text-sm text-muted-foreground">{order.order_time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {order.material}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium">{Number(order.weight).toFixed(3)} MT</td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-semibold text-success">₹{Number(order.total).toLocaleString("en-IN")}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
