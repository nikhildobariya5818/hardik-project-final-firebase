"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Order } from "@/lib/firebase/types"
import { useToast } from "@/hooks/use-toast"

async function fetchOrders(clientId?: string): Promise<Order[]> {
  const url = clientId ? `/api/orders?client_id=${clientId}` : "/api/orders"
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

async function fetchOrdersByMonth(clientId: string, yearMonth: string): Promise<Order[]> {
  const [year, month] = yearMonth.split("-")
  const url = `/api/orders?client_id=${clientId}&year=${year}&month=${month}`
  const res = await fetch(url)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

async function fetchOrdersBeforeMonth(clientId: string, yearMonth: string): Promise<Order[]> {
  const [year, month] = yearMonth.split("-")
  const res = await fetch(`/api/orders?client_id=${clientId}&before_year=${year}&before_month=${month}`)
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}

export function useOrdersByClient(clientId: string, yearMonth?: string) {
  return useQuery({
    queryKey: ["orders", "client", clientId, yearMonth],
    queryFn: () => {
      if (yearMonth) {
        return fetchOrdersByMonth(clientId, yearMonth)
      }
      return fetchOrders(clientId)
    },
    enabled: !!clientId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}

export function useOrdersBeforeMonth(clientId: string, yearMonth: string) {
  return useQuery({
    queryKey: ["orders", "before", clientId, yearMonth],
    queryFn: () => fetchOrdersBeforeMonth(clientId, yearMonth),
    enabled: !!clientId && !!yearMonth,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
  })
}

export function useAddOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (order: Omit<Order, "id" | "created_at" | "updated_at" | "created_by">) => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "client"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "before"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast({
        title: "Order Added",
        description: "New order has been added successfully.",
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

export function useUpdateOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...order }: Partial<Order> & { id: string }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "client"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "before"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast({
        title: "Order Updated",
        description: "Order has been updated.",
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

export function useDeleteOrder() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "client"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "before"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      toast({
        title: "Order Deleted",
        description: "Order has been removed.",
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
