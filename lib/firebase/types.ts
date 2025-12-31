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
  material: string // Changed from MaterialType to string to allow custom materials
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
