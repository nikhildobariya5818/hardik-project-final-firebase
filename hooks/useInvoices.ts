"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Invoice, InvoiceItem } from "@/lib/firebase/types"

// Fetch all invoices
export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices")
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data as Invoice[]
    },
  })
}

// Fetch single invoice with items
export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (!id) return null

      const res = await fetch(`/api/invoices/${id}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return { invoice: json.data, items: json.items || [] }
    },
    enabled: !!id,
  })
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      invoice,
      items,
    }: {
      invoice: Omit<Invoice, "id" | "created_at">
      items: Omit<InvoiceItem, "id" | "invoice_id" | "created_at">[]
    }) => {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice, items }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["company-settings"] })
    },
  })
}

// Update invoice
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      invoice,
      items,
    }: {
      id: string
      invoice: Partial<Omit<Invoice, "id" | "created_at">>
      items?: Omit<InvoiceItem, "id" | "invoice_id" | "created_at">[]
    }) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice, items }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] })
    },
  })
}

// Delete invoice
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
  })
}
