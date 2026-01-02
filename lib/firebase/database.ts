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

// Comprehensive error handling wrapper for all database operations
function handleDatabaseError(error: any, operation: string): Error {
  console.error(`[Database Error] ${operation}:`, error)
  if (error instanceof Error) {
    return new Error(`${operation} failed: ${error.message}`)
  }
  return new Error(`${operation} failed: Unknown error`)
}

// Clients operations
export const clientsDB = {
  async getAll(): Promise<Client[]> {
    try {
      const snapshot = await get(ref(database, "clients"))
      const data = snapshot.val()
      if (!data) return []
      return Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value,
      }))
    } catch (error) {
      throw handleDatabaseError(error, "getAll clients")
    }
  },

  async getById(id: string): Promise<Client | null> {
    try {
      const snapshot = await get(ref(database, `clients/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById client")
    }
  },

  async create(data: Omit<Client, "id" | "created_at" | "updated_at">): Promise<Client> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "create client")
    }
  },

  async update(id: string, data: Partial<Client>): Promise<Client | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
      await set(ref(database, `clients/${id}`), updated)
      return updated as Client
    } catch (error) {
      throw handleDatabaseError(error, "update client")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `clients/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete client")
    }
  },
}

// Orders operations
export const ordersDB = {
  async getAll(filters?: { client_id?: string }): Promise<Order[]> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "getAll orders")
    }
  },

  async getById(id: string): Promise<Order | null> {
    try {
      const snapshot = await get(ref(database, `orders/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById order")
    }
  },

  async create(data: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "create order")
    }
  },

  async update(id: string, data: Partial<Order>): Promise<Order | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
      await set(ref(database, `orders/${id}`), updated)
      return updated as Order
    } catch (error) {
      throw handleDatabaseError(error, "update order")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `orders/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete order")
    }
  },
}

// Payments operations
export const paymentsDB = {
  async getAll(filters?: { client_id?: string }): Promise<Payment[]> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "getAll payments")
    }
  },

  async getById(id: string): Promise<Payment | null> {
    try {
      const snapshot = await get(ref(database, `payments/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById payment")
    }
  },

  async create(data: Omit<Payment, "id" | "created_at">): Promise<Payment> {
    try {
      const id = generateId()
      const now = new Date().toISOString()
      const paymentData = {
        ...data,
        id,
        created_at: now,
      }
      await set(ref(database, `payments/${id}`), paymentData)
      return paymentData as Payment
    } catch (error) {
      throw handleDatabaseError(error, "create payment")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `payments/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete payment")
    }
  },
}

// Material Rates operations
export const materialRatesDB = {
  async getAll(): Promise<MaterialRate[]> {
    try {
      const snapshot = await get(ref(database, "material_rates"))
      const data = snapshot.val()
      if (!data) return []
      return Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value,
      }))
    } catch (error) {
      throw handleDatabaseError(error, "getAll material rates")
    }
  },

  async getById(id: string): Promise<MaterialRate | null> {
    try {
      const snapshot = await get(ref(database, `material_rates/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById material rate")
    }
  },

  async create(data: Omit<MaterialRate, "id" | "updated_at">): Promise<MaterialRate> {
    try {
      const id = generateId()
      const rateData = {
        ...data,
        id,
        updated_at: new Date().toISOString(),
      }
      await set(ref(database, `material_rates/${id}`), rateData)
      return rateData as MaterialRate
    } catch (error) {
      throw handleDatabaseError(error, "create material rate")
    }
  },

  async update(id: string, data: Partial<MaterialRate>): Promise<MaterialRate | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
      await set(ref(database, `material_rates/${id}`), updated)
      return updated as MaterialRate
    } catch (error) {
      throw handleDatabaseError(error, "update material rate")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `material_rates/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete material rate")
    }
  },
}

// Company Settings operations
export const settingsDB = {
  async get(): Promise<CompanySettings | null> {
    try {
      const snapshot = await get(ref(database, "company_settings/default"))
      const data = snapshot.val()
      if (!data) return null
      return { id: "default", ...data }
    } catch (error) {
      throw handleDatabaseError(error, "get settings")
    }
  },

  async set(data: CompanySettings): Promise<CompanySettings> {
    try {
      await set(ref(database, "company_settings/default"), {
        ...data,
        updated_at: new Date().toISOString(),
      })
      return data
    } catch (error) {
      throw handleDatabaseError(error, "set settings")
    }
  },
}

// Vehicles operations
export const vehiclesDB = {
  async getAll(): Promise<Vehicle[]> {
    try {
      const snapshot = await get(ref(database, "vehicles"))
      const data = snapshot.val()
      if (!data) return []
      return Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value,
      }))
    } catch (error) {
      throw handleDatabaseError(error, "getAll vehicles")
    }
  },

  async getById(id: string): Promise<Vehicle | null> {
    try {
      const snapshot = await get(ref(database, `vehicles/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById vehicle")
    }
  },

  async create(data: Omit<Vehicle, "id" | "created_at">): Promise<Vehicle> {
    try {
      const id = generateId()
      const vehicleData = {
        ...data,
        id,
        created_at: new Date().toISOString(),
      }
      await set(ref(database, `vehicles/${id}`), vehicleData)
      return vehicleData as Vehicle
    } catch (error) {
      throw handleDatabaseError(error, "create vehicle")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `vehicles/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete vehicle")
    }
  },
}

// Invoices operations
export const invoicesDB = {
  async getAll(filters?: { client_id?: string }): Promise<Invoice[]> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "getAll invoices")
    }
  },

  async getById(id: string): Promise<Invoice | null> {
    try {
      const snapshot = await get(ref(database, `invoices/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById invoice")
    }
  },

  async create(data: Omit<Invoice, "id" | "created_at">): Promise<Invoice> {
    try {
      const id = generateId()
      const invoiceData = {
        ...data,
        id,
        created_at: new Date().toISOString(),
      }
      await set(ref(database, `invoices/${id}`), invoiceData)
      return invoiceData as Invoice
    } catch (error) {
      throw handleDatabaseError(error, "create invoice")
    }
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const updated = { ...existing, ...data }
      await set(ref(database, `invoices/${id}`), updated)
      return updated as Invoice
    } catch (error) {
      throw handleDatabaseError(error, "update invoice")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `invoices/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete invoice")
    }
  },
}

// Invoice Items operations
export const invoiceItemsDB = {
  async getAll(filters?: { invoice_id?: string }): Promise<InvoiceItem[]> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "getAll invoice items")
    }
  },

  async getById(id: string): Promise<InvoiceItem | null> {
    try {
      const snapshot = await get(ref(database, `invoice_items/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById invoice item")
    }
  },

  async create(data: Omit<InvoiceItem, "id" | "created_at">): Promise<InvoiceItem> {
    try {
      const id = generateId()
      const itemData = {
        ...data,
        id,
        created_at: new Date().toISOString(),
      }
      await set(ref(database, `invoice_items/${id}`), itemData)
      return itemData as InvoiceItem
    } catch (error) {
      throw handleDatabaseError(error, "create invoice item")
    }
  },

  async createBatch(items: Array<Omit<InvoiceItem, "id" | "created_at">>): Promise<InvoiceItem[]> {
    try {
      const now = new Date().toISOString()
      const created: InvoiceItem[] = []
      for (const item of items) {
        const id = generateId()
        const itemData = { ...item, id, created_at: now }
        await set(ref(database, `invoice_items/${id}`), itemData)
        created.push(itemData as InvoiceItem)
      }
      return created
    } catch (error) {
      throw handleDatabaseError(error, "batch create invoice items")
    }
  },

  async deleteByInvoiceId(invoiceId: string): Promise<void> {
    try {
      const items = await this.getAll({ invoice_id: invoiceId })
      for (const item of items) {
        await remove(ref(database, `invoice_items/${item.id}`))
      }
    } catch (error) {
      throw handleDatabaseError(error, "deleteByInvoiceId invoice items")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `invoice_items/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete invoice item")
    }
  },
}

// Profiles operations
export const profilesDB = {
  async getById(id: string): Promise<Profile | null> {
    try {
      const snapshot = await get(ref(database, `profiles/${id}`))
      const data = snapshot.val()
      if (!data) return null
      return { id, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getById profile")
    }
  },

  async create(data: Omit<Profile, "id" | "created_at" | "updated_at">): Promise<Profile> {
    try {
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
    } catch (error) {
      throw handleDatabaseError(error, "create profile")
    }
  },

  async update(id: string, data: Partial<Profile>): Promise<Profile | null> {
    try {
      const existing = await this.getById(id)
      if (!existing) return null
      const updated = { ...existing, ...data, updated_at: new Date().toISOString() }
      await set(ref(database, `profiles/${id}`), updated)
      return updated as Profile
    } catch (error) {
      throw handleDatabaseError(error, "update profile")
    }
  },
}

// User Roles operations
export const userRolesDB = {
  async getByUserId(userId: string): Promise<UserRoleRecord | null> {
    try {
      const snapshot = await get(ref(database, `user_roles/${userId}`))
      const data = snapshot.val()
      if (!data) return null
      return { id: userId, ...data }
    } catch (error) {
      throw handleDatabaseError(error, "getByUserId user role")
    }
  },

  async set(userId: string, role: string): Promise<UserRoleRecord> {
    try {
      const roleData: UserRoleRecord = {
        id: userId,
        user_id: userId,
        role: role as any,
        created_at: new Date().toISOString(),
      }
      await set(ref(database, `user_roles/${userId}`), roleData)
      return roleData
    } catch (error) {
      throw handleDatabaseError(error, "set user role")
    }
  },
}

// Staff operations (if needed)
export const staffDB = {
  async getAll(): Promise<any[]> {
    try {
      const snapshot = await get(ref(database, "staff"))
      const data = snapshot.val()
      if (!data) return []
      return Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        ...value,
      }))
    } catch (error) {
      throw handleDatabaseError(error, "getAll staff")
    }
  },

  async create(data: any): Promise<any> {
    try {
      const id = generateId()
      const staffData = { ...data, id, created_at: new Date().toISOString() }
      await set(ref(database, `staff/${id}`), staffData)
      return staffData
    } catch (error) {
      throw handleDatabaseError(error, "create staff")
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await remove(ref(database, `staff/${id}`))
    } catch (error) {
      throw handleDatabaseError(error, "delete staff")
    }
  },
}
