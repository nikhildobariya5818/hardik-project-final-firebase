import { ref, get, set, remove } from "firebase/database"
import { database } from "./config"
import type {
  Client,
  Order,
  Payment,
  MaterialRate,
  CompanySettings,
  Vehicle,
  Invoice,
  InvoiceItem,
  Profile,
  UserRoleRecord,
} from "./types"

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Clients operations
export const clientsDB = {
  async getAll(): Promise<Client[]> {
    const snapshot = await get(ref(database, "clients"))
    const data = snapshot.val()
    if (!data) return []
    return Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }))
  },

  async getById(id: string): Promise<Client | null> {
    const snapshot = await get(ref(database, `clients/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    const id = generateId()
    const now = new Date().toISOString()
    const clientData = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    }
    await set(ref(database, `clients/${id}`), clientData)
    return clientData as Client
  },

  async update(id: string, data: Partial<Client>): Promise<Client | null> {
    const existing = await this.getById(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await set(ref(database, `clients/${id}`), updated)
    return updated as Client
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `clients/${id}`))
  },
}

// Orders operations
export const ordersDB = {
  async getAll(filters?: { client_id?: string }): Promise<Order[]> {
    const snapshot = await get(ref(database, "orders"))
    const data = snapshot.val()
    if (!data) return []
    let result = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    })) as Order[]

    if (filters?.client_id) {
      result = result.filter((order) => order.client_id === filters.client_id)
    }

    return result
  },

  async getById(id: string): Promise<Order | null> {
    const snapshot = await get(ref(database, `orders/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    const id = generateId()
    const now = new Date().toISOString()
    const orderData = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    }
    await set(ref(database, `orders/${id}`), orderData)
    return orderData as Order
  },

  async update(id: string, data: Partial<Order>): Promise<Order | null> {
    const existing = await this.getById(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await set(ref(database, `orders/${id}`), updated)
    return updated as Order
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `orders/${id}`))
  },
}

// Payments operations
export const paymentsDB = {
  async getAll(filters?: { client_id?: string }): Promise<Payment[]> {
    const snapshot = await get(ref(database, "payments"))
    const data = snapshot.val()
    if (!data) return []
    let result = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    })) as Payment[]

    if (filters?.client_id) {
      result = result.filter((payment) => payment.client_id === filters.client_id)
    }

    return result
  },

  async getById(id: string): Promise<Payment | null> {
    const snapshot = await get(ref(database, `payments/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<Payment, "id" | "created_at">): Promise<Payment> {
    const id = generateId()
    const now = new Date().toISOString()
    const paymentData = {
      ...data,
      id,
      created_at: now,
    }
    await set(ref(database, `payments/${id}`), paymentData)
    return paymentData as Payment
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `payments/${id}`))
  },
}

// Material Rates operations
export const materialRatesDB = {
  async getAll(): Promise<MaterialRate[]> {
    const snapshot = await get(ref(database, "material_rates"))
    const data = snapshot.val()
    if (!data) return []
    return Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }))
  },

  async getById(id: string): Promise<MaterialRate | null> {
    const snapshot = await get(ref(database, `material_rates/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<MaterialRate, "id" | "updated_at">): Promise<MaterialRate> {
    const id = generateId()
    const rateData = {
      ...data,
      id,
      updated_at: new Date().toISOString(),
    }
    await set(ref(database, `material_rates/${id}`), rateData)
    return rateData as MaterialRate
  },

  async update(id: string, data: Partial<MaterialRate>): Promise<MaterialRate | null> {
    const existing = await this.getById(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await set(ref(database, `material_rates/${id}`), updated)
    return updated as MaterialRate
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `material_rates/${id}`))
  },
}

// Company Settings operations
export const settingsDB = {
  async get(): Promise<CompanySettings | null> {
    const snapshot = await get(ref(database, "company_settings/default"))
    const data = snapshot.val()
    if (!data) return null
    return { id: "default", ...data }
  },

  async set(data: CompanySettings): Promise<CompanySettings> {
    await set(ref(database, "company_settings/default"), {
      ...data,
      updated_at: new Date().toISOString(),
    })
    return data
  },
}

// Vehicles operations
export const vehiclesDB = {
  async getAll(): Promise<Vehicle[]> {
    const snapshot = await get(ref(database, "vehicles"))
    const data = snapshot.val()
    if (!data) return []
    return Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }))
  },

  async getById(id: string): Promise<Vehicle | null> {
    const snapshot = await get(ref(database, `vehicles/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<Vehicle, "id" | "created_at">): Promise<Vehicle> {
    const id = generateId()
    const vehicleData = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    }
    await set(ref(database, `vehicles/${id}`), vehicleData)
    return vehicleData as Vehicle
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `vehicles/${id}`))
  },
}

// Invoices operations
export const invoicesDB = {
  async getAll(filters?: { client_id?: string }): Promise<Invoice[]> {
    const snapshot = await get(ref(database, "invoices"))
    const data = snapshot.val()
    if (!data) return []
    let result = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    })) as Invoice[]

    if (filters?.client_id) {
      result = result.filter((invoice) => invoice.client_id === filters.client_id)
    }

    return result
  },

  async getById(id: string): Promise<Invoice | null> {
    const snapshot = await get(ref(database, `invoices/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<Invoice, "id" | "created_at">): Promise<Invoice> {
    const id = generateId()
    const invoiceData = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    }
    await set(ref(database, `invoices/${id}`), invoiceData)
    return invoiceData as Invoice
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    const existing = await this.getById(id)
    if (!existing) return null
    const updated = { ...existing, ...data }
    await set(ref(database, `invoices/${id}`), updated)
    return updated as Invoice
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `invoices/${id}`))
  },
}

// Invoice Items operations
export const invoiceItemsDB = {
  async getAll(filters?: { invoice_id?: string }): Promise<InvoiceItem[]> {
    const snapshot = await get(ref(database, "invoice_items"))
    const data = snapshot.val()
    if (!data) return []
    let result = Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    })) as InvoiceItem[]

    if (filters?.invoice_id) {
      result = result.filter((item) => item.invoice_id === filters.invoice_id)
    }

    return result
  },

  async getById(id: string): Promise<InvoiceItem | null> {
    const snapshot = await get(ref(database, `invoice_items/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<InvoiceItem, "id" | "created_at">): Promise<InvoiceItem> {
    const id = generateId()
    const itemData = {
      ...data,
      id,
      created_at: new Date().toISOString(),
    }
    await set(ref(database, `invoice_items/${id}`), itemData)
    return itemData as InvoiceItem
  },

  async createBatch(items: Array<Omit<InvoiceItem, "id" | "created_at">>): Promise<InvoiceItem[]> {
    const now = new Date().toISOString()
    const created: InvoiceItem[] = []
    for (const item of items) {
      const id = generateId()
      const itemData = { ...item, id, created_at: now }
      await set(ref(database, `invoice_items/${id}`), itemData)
      created.push(itemData as InvoiceItem)
    }
    return created
  },

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    const items = await this.getAll({ invoice_id: invoiceId })
    for (const item of items) {
      await remove(ref(database, `invoice_items/${item.id}`))
    }
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `invoice_items/${id}`))
  },
}

// Profiles operations
export const profilesDB = {
  async getById(id: string): Promise<Profile | null> {
    const snapshot = await get(ref(database, `profiles/${id}`))
    const data = snapshot.val()
    if (!data) return null
    return { id, ...data }
  },

  async create(data: Omit<Profile, "id" | "created_at" | "updated_at">): Promise<Profile> {
    const id = data.user_id
    const now = new Date().toISOString()
    const profileData = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
    }
    await set(ref(database, `profiles/${id}`), profileData)
    return profileData as Profile
  },

  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    const existing = await this.getById(id)
    if (!existing) return null
    const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
    await set(ref(database, `profiles/${id}`), updated)
    return updated as Profile
  },
}

// User Roles operations
export const userRolesDB = {
  async getByUserId(userId: string): Promise<UserRoleRecord | null> {
    const snapshot = await get(ref(database, `user_roles/${userId}`))
    const data = snapshot.val()
    if (!data) return null
    return { id: userId, ...data }
  },

  async set(userId: string, role: string): Promise<UserRoleRecord> {
    const roleData: UserRoleRecord = {
      id: userId,
      user_id: userId,
      role: role as any,
      created_at: new Date().toISOString(),
    }
    await set(ref(database, `user_roles/${userId}`), roleData)
    return roleData
  },
}

// Staff operations (if needed)
export const staffDB = {
  async getAll(): Promise<any[]> {
    const snapshot = await get(ref(database, "staff"))
    const data = snapshot.val()
    if (!data) return []
    return Object.entries(data).map(([id, value]: [string, any]) => ({
      id,
      ...value,
    }))
  },

  async create(data: any): Promise<any> {
    const id = generateId()
    const staffData = { ...data, id, created_at: new Date().toISOString() }
    await set(ref(database, `staff/${id}`), staffData)
    return staffData
  },

  async delete(id: string): Promise<void> {
    await remove(ref(database, `staff/${id}`))
  },
}
