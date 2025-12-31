"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/MainLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useCompanySettings,
  useUpdateCompanySettings,
  useMaterialRates,
  useUpdateMaterialRate,
  useAddMaterialRate,
  useVehicles,
  useAddVehicle,
  useDeleteVehicle,
} from "@/hooks/useSettings"
import { useStaffMembers, useAddStaff, useDeleteStaff } from "@/hooks/useStaff"
import { useAuth } from "@/contexts/AuthContext"
import {
  SettingsIcon,
  Building2,
  Package,
  Truck,
  Save,
  Plus,
  Trash2,
  Loader2,
  Users,
  UserPlus,
  Edit,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MaterialType, UserRole } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function Settings() {
  const { user } = useAuth()
  const { data: companySettings, isLoading: settingsLoading } = useCompanySettings()
  const { data: materialRates = [], isLoading: ratesLoading } = useMaterialRates()
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles()
  const { data: staffMembers = [], isLoading: staffLoading } = useStaffMembers()

  const updateSettings = useUpdateCompanySettings()
  const updateRate = useUpdateMaterialRate()
  const addRate = useAddMaterialRate()
  const addVehicle = useAddVehicle()
  const deleteVehicle = useDeleteVehicle()
  const addStaff = useAddStaff()
  const deleteStaff = useDeleteStaff()

  const [company, setCompany] = useState({
    company_name: "",
    address: "",
    phone: "",
    gst_number: "",
    invoice_prefix: "",
    pan_number: "",
    email: "",
    bank_account: "",
    bank_ifsc: "",
    bank_name: "",
    upi_id: "",
    logo_url: "",
  })
  const [rates, setRates] = useState<{ material: MaterialType; rate: number }[]>([])
  const [newVehicle, setNewVehicle] = useState("")
  const [editRateDialog, setEditRateDialog] = useState<{ material: MaterialType; rate: number } | null>(null)
  const [editRateValue, setEditRateValue] = useState("")
  const [editRateError, setEditRateError] = useState("")
  const [newRateDialog, setNewRateDialog] = useState(false)
  const [newMaterial, setNewMaterial] = useState("")
  const [newRate, setNewRate] = useState("")
  const [newRateError, setNewRateError] = useState("")

  // New staff form
  const [newStaff, setNewStaff] = useState({ email: "", password: "", fullName: "", role: "staff" as UserRole })

  useEffect(() => {
    if (companySettings) {
      setCompany({
        company_name: companySettings.company_name || "",
        address: companySettings.address || "",
        phone: companySettings.phone || "",
        gst_number: companySettings.gst_number || "",
        invoice_prefix: companySettings.invoice_prefix || "",
        pan_number: companySettings.pan_number || "",
        email: companySettings.email || "",
        bank_account: companySettings.bank_account || "",
        bank_ifsc: companySettings.bank_ifsc || "",
        bank_name: companySettings.bank_name || "",
        upi_id: companySettings.upi_id || "",
        logo_url: companySettings.logo_url || "",
      })
    }
  }, [companySettings])

  useEffect(() => {
    if (materialRates.length > 0) {
      setRates(materialRates.map((r) => ({ material: r.material, rate: Number(r.rate) })))
    }
  }, [materialRates])

  const isLoading = settingsLoading || ratesLoading || vehiclesLoading || staffLoading

  const handleSaveCompany = async () => {
    await updateSettings.mutateAsync(company)
  }

  const handleEditRate = (item: { material: MaterialType; rate: number }) => {
    setEditRateDialog(item)
    setEditRateValue(item.rate.toString())
    setEditRateError("")
  }

  const handleAddRate = async () => {
    const rateValue = Number.parseFloat(newRate)
    if (!newMaterial.trim()) {
      setNewRateError("Material name is required")
      return
    }
    if (isNaN(rateValue) || rateValue < 0) {
      setNewRateError("Please enter a valid rate")
      return
    }

    try {
      await addRate.mutateAsync({
        material: newMaterial.trim(),
        rate: rateValue,
      })
      setNewRateDialog(false)
      setNewMaterial("")
      setNewRate("")
      setNewRateError("")
    } catch (error) {
      setNewRateError("Failed to add material rate")
    }
  }

  const handleAddVehicle = async () => {
    if (newVehicle.trim()) {
      await addVehicle.mutateAsync(newVehicle.trim())
      setNewVehicle("")
    }
  }

  const handleAddStaff = async () => {
    if (newStaff.email && newStaff.password && newStaff.fullName) {
      await addStaff.mutateAsync({
        email: newStaff.email,
        password: newStaff.password,
        fullName: newStaff.fullName,
        role: newStaff.role,
      })
      setNewStaff({ email: "", password: "", fullName: "", role: "staff" })
    }
  }

  const handleSaveRate = async () => {
    const rateValue = Number.parseFloat(editRateValue)
    if (isNaN(rateValue) || rateValue < 0) {
      setEditRateError("Please enter a valid rate")
      return
    }

    try {
      await updateRate.mutateAsync({
        id: editRateDialog?.id || "",
        material: editRateDialog?.material || "",
        rate: rateValue,
      })
      setEditRateDialog(null)
      setEditRateValue("")
      setEditRateError("")
    } catch (error) {
      setEditRateError("Failed to update material rate")
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
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <SettingsIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your business preferences</p>
          </div>
        </div>

        <Tabs defaultValue="company">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="company">
              <Building2 className="h-4 w-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="rates">
              <Package className="h-4 w-4 mr-2" />
              Rates
            </TabsTrigger>
            <TabsTrigger value="vehicles">
              <Truck className="h-4 w-4 mr-2" />
              Vehicles
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users className="h-4 w-4 mr-2" />
              Staff
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="mt-6">
            <div className="bg-card rounded-xl shadow-md border border-border/50 p-6 max-w-2xl space-y-4">
              <h2 className="text-lg font-semibold mb-4">Company Details</h2>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={company.company_name}
                  onChange={(e) => setCompany({ ...company, company_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input
                    value={company.gst_number}
                    onChange={(e) => setCompany({ ...company, gst_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>PAN Number</Label>
                  <Input
                    value={company.pan_number}
                    onChange={(e) => setCompany({ ...company, pan_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Invoice Prefix</Label>
                <Input
                  value={company.invoice_prefix}
                  onChange={(e) => setCompany({ ...company, invoice_prefix: e.target.value })}
                  className="max-w-[200px]"
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-md font-semibold mb-3">Bank Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={company.bank_name}
                      onChange={(e) => setCompany({ ...company, bank_name: e.target.value })}
                      placeholder="e.g., KOTAK MAHINDRA BANK LIMITED"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={company.bank_account}
                        onChange={(e) => setCompany({ ...company, bank_account: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IFSC Code</Label>
                      <Input
                        value={company.bank_ifsc}
                        onChange={(e) => setCompany({ ...company, bank_ifsc: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>UPI ID (for QR Code)</Label>
                    <Input
                      value={company.upi_id}
                      onChange={(e) => setCompany({ ...company, upi_id: e.target.value })}
                      placeholder="yourname@bank"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-md font-semibold mb-3">Branding</h3>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={company.logo_url}
                    onChange={(e) => setCompany({ ...company, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                  {company.logo_url && (
                    <div className="mt-2">
                      <img
                        src={company.logo_url || "/placeholder.svg"}
                        alt="Company Logo"
                        className="h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={handleSaveCompany} disabled={updateSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {updateSettings.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="rates" className="mt-6">
            <div className="bg-card rounded-xl shadow-md border border-border/50 p-6 max-w-lg space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Material Rates (₹/MT)</h2>
                  <p className="text-sm text-muted-foreground">Click edit to change the rate for each material</p>
                </div>
                <Button onClick={() => setNewRateDialog(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Rate
                </Button>
              </div>
              <div className="divide-y divide-border">
                {rates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No material rates configured</div>
                ) : (
                  rates.map((item) => (
                    <div key={item.material} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.material}</p>
                          <p className="text-sm text-muted-foreground">Current rate</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">₹{item.rate}/MT</span>
                        <Button variant="outline" size="sm" onClick={() => handleEditRate(item)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vehicles" className="mt-6">
            <div className="bg-card rounded-xl shadow-md border border-border/50 p-6 max-w-lg space-y-4">
              <h2 className="text-lg font-semibold mb-4">Vehicle Numbers</h2>
              <div className="flex gap-2">
                <Input placeholder="GJ-01-XX-0000" value={newVehicle} onChange={(e) => setNewVehicle(e.target.value)} />
                <Button onClick={handleAddVehicle} disabled={addVehicle.isPending}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="divide-y divide-border">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono">{vehicle.vehicle_number}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteVehicle.mutate(vehicle.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <div className="space-y-6 max-w-2xl">
              {/* Add Staff Form */}
              <div className="bg-card rounded-xl shadow-md border border-border/50 p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Add New Staff</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      placeholder="Enter full name"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="Enter email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="Create password"
                      value={newStaff.password}
                      onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={newStaff.role}
                      onValueChange={(v) => setNewStaff({ ...newStaff, role: v as UserRole })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleAddStaff}
                  disabled={addStaff.isPending || !newStaff.email || !newStaff.password || !newStaff.fullName}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {addStaff.isPending ? "Adding..." : "Add Staff Member"}
                </Button>
              </div>

              {/* Staff List */}
              <div className="bg-card rounded-xl shadow-md border border-border/50 p-6">
                <h2 className="text-lg font-semibold mb-4">Staff Members</h2>
                <div className="divide-y divide-border">
                  {staffMembers.map((staff) => (
                    <div key={staff.id} className="py-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Users className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{staff.profile?.full_name || "Unknown"}</p>
                          <p className="text-sm text-muted-foreground">{staff.profile?.email || "No email"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={staff.role === "admin" ? "default" : "secondary"}>{staff.role}</Badge>
                        {staff.user_id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteStaff.mutate(staff.user_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {staffMembers.length === 0 && (
                    <p className="py-4 text-center text-muted-foreground">No staff members found</p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Rate Dialog */}
        <Dialog open={!!editRateDialog} onOpenChange={() => setEditRateDialog(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit {editRateDialog?.material} Rate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rate (₹/MT)</Label>
                <Input
                  type="number"
                  value={editRateValue}
                  onChange={(e) => {
                    setEditRateValue(e.target.value)
                    setEditRateError("")
                  }}
                  placeholder="Enter rate"
                  min="0"
                  step="0.01"
                />
                {editRateError && <p className="text-sm text-red-500">{editRateError}</p>}
              </div>
              <Button onClick={handleSaveRate} className="w-full" disabled={updateRate.isPending}>
                {updateRate.isPending ? "Saving..." : "Save Rate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* New Material Rate Dialog */}
        <Dialog open={newRateDialog} onOpenChange={setNewRateDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Material Rate</DialogTitle>
              <DialogDescription>Enter the material name and its current rate per metric ton</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Material Name</Label>
                <Input
                  value={newMaterial}
                  onChange={(e) => {
                    setNewMaterial(e.target.value)
                    setNewRateError("")
                  }}
                  placeholder="e.g., Iron Ore, Coal, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Rate (₹/MT)</Label>
                <Input
                  type="number"
                  value={newRate}
                  onChange={(e) => {
                    setNewRate(e.target.value)
                    setNewRateError("")
                  }}
                  placeholder="Enter rate"
                  min="0"
                  step="0.01"
                />
              </div>
              {newRateError && <p className="text-sm text-red-500">{newRateError}</p>}
              <Button onClick={handleAddRate} className="w-full" disabled={addRate.isPending}>
                {addRate.isPending ? "Adding..." : "Add Material Rate"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
