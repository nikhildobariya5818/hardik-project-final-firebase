"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Payment } from "@/lib/firebase/types"
import { useToast } from "@/hooks/use-toast"

async function fetchPayments(clientId?: string): Promise<Payment[]> {
  const url = clientId ? `/api/payments?client_id=${clientId}` : "/api/payments"
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

async function fetchPaymentsByMonth(clientId: string, yearMonth: string): Promise<Payment[]> {
  const [year, month] = yearMonth.split("-")
  const url = `/api/payments?client_id=${clientId}&year=${year}&month=${month}`
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

async function fetchPaymentsBeforeMonth(clientId: string, yearMonth: string): Promise<Payment[]> {
  const [year, month] = yearMonth.split("-")
  const res = await fetch(`/api/payments?client_id=${clientId}&before_year=${year}&before_month=${month}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => fetchPayments(),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}

export function usePaymentsByClient(clientId: string, yearMonth?: string) {
  return useQuery({
    queryKey: ["payments", "client", clientId, yearMonth],
    queryFn: () => {
      if (yearMonth) {
        return fetchPaymentsByMonth(clientId, yearMonth)
      }
      return fetchPayments(clientId)
    },
    enabled: !!clientId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}

export function usePaymentsBeforeMonth(clientId: string, yearMonth: string) {
  return useQuery({
    queryKey: ["payments", "before", clientId, yearMonth],
    queryFn: () => fetchPaymentsBeforeMonth(clientId, yearMonth),
    enabled: !!clientId && !!yearMonth,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}

export function useAddPayment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (payment: Omit<Payment, "id" | "created_at" | "created_by">) => {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payment),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payments", "client"] })
      queryClient.invalidateQueries({ queryKey: ["payments", "before"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast({
        title: "Payment Added",
        description: "New payment has been recorded.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/payments/${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      queryClient.invalidateQueries({ queryKey: ["payments", "client"] })
      queryClient.invalidateQueries({ queryKey: ["payments", "before"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast({
        title: "Payment Deleted",
        description: "Payment has been removed.",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })
}
