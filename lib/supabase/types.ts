export type UserRole = "admin" | "staff"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface Client {
  id: string
  name: string
  city: string
  phone: string
  address?: string
  state?: string
  pincode?: string
  gst_number?: string
  opening_balance: number
  current_balance: number
  created_at: string
  updated_at: string
}

export type MaterialType = "RETI" | "KAPCHI" | "GSB" | "RABAR"

export interface Order {
  id: string
  client_id: string
  order_date: string
  order_time: string
  weight: number
  order_number?: string
  material: MaterialType
  quantity?: number
  rate: number
  total: number
  location: string | null
  truck_number: string | null
  delivery_boy_name: string | null
  delivery_boy_mobile: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  clients?: {
    name: string
    city: string
  }
}

export type PaymentMode = "Cash" | "UPI" | "Bank"

export interface Payment {
  id: string
  client_id: string
  payment_date: string
  amount: number
  mode: PaymentMode
  notes: string | null
  created_by: string | null
  created_at: string
  clients?: {
    name: string
  }
}

export interface MaterialRate {
  id: string
  material: MaterialType
  rate: number
  updated_at: string
}

export interface CompanySettings {
  id: string
  company_name: string
  address: string | null
  phone: string | null
  gst_number: string | null
  bank_name: string | null
  bank_account?: string | null
  bank_ifsc?: string | null
  account_number: string | null
  ifsc_code: string | null
  upi_id: string | null
  logo_url: string | null
  invoice_prefix: string
  next_invoice_number: number
  updated_at: string
}

export interface Vehicle {
  id: string
  vehicle_number: string
  created_at: string
}

export interface Invoice {
  id: string
  client_id: string
  invoice_number: string
  bill_month: string
  orders_total: number
  previous_balance: number
  total_payable: number
  paid_amount: number
  remaining_balance: number
  created_at: string
  clients?: {
    name: string
    city: string
  }
}

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface UserRoleRecord {
  id: string
  user_id: string
  role: UserRole
  created_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  order_id: string | null
  description: string
  quantity: number
  rate: number
  amount: number
  created_at: string
}

// Supabase Database Types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client
        Insert: Omit<Client, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Client, "id" | "created_at" | "updated_at">>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Order, "id" | "created_at" | "updated_at">>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, "id" | "created_at">
        Update: Partial<Omit<Payment, "id" | "created_at">>
      }
      material_rates: {
        Row: MaterialRate
        Insert: Omit<MaterialRate, "id" | "updated_at">
        Update: Partial<Omit<MaterialRate, "id" | "updated_at">>
      }
      company_settings: {
        Row: CompanySettings
        Insert: Omit<CompanySettings, "id" | "updated_at">
        Update: Partial<Omit<CompanySettings, "id" | "updated_at">>
      }
      vehicles: {
        Row: Vehicle
        Insert: Omit<Vehicle, "id" | "created_at">
        Update: Partial<Omit<Vehicle, "id" | "created_at">>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, "id" | "created_at">
        Update: Partial<Omit<Invoice, "id" | "created_at">>
      }
      invoice_items: {
        Row: InvoiceItem
        Insert: Omit<InvoiceItem, "id" | "created_at">
        Update: Partial<Omit<InvoiceItem, "id" | "created_at">>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>
      }
      user_roles: {
        Row: UserRoleRecord
        Insert: Omit<UserRoleRecord, "id" | "created_at">
        Update: Partial<Omit<UserRoleRecord, "id" | "created_at">>
      }
    }
  }
}
