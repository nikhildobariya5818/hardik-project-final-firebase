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

async function fetchPaymentsBeforeMonth(year: number, month: number): Promise<Payment[]> {
  const res = await fetch(`/api/payments?before_year=${year}&before_month=${month}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: () => fetchPayments(),
  })
}

export function usePaymentsByClient(clientId: string) {
  return useQuery({
    queryKey: ["payments", "client", clientId],
    queryFn: () => fetchPayments(clientId),
    enabled: !!clientId,
  })
}

export function usePaymentsBeforeMonth(year: number, month: number) {
  return useQuery({
    queryKey: ["payments", "before", year, month],
    queryFn: () => fetchPaymentsBeforeMonth(year, month),
    enabled: !!year && !!month,
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
      queryClient.invalidateQueries({ queryKey: ["clients"] })
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
      queryClient.invalidateQueries({ queryKey: ["clients"] })
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
