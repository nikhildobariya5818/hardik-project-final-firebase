"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { CompanySettings, MaterialRate } from "@/lib/firebase/types"
import { useToast } from "@/hooks/use-toast"

async function fetchSettings(): Promise<CompanySettings> {
  const res = await fetch("/api/settings")
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

async function fetchMaterialRates(): Promise<MaterialRate[]> {
  const res = await fetch("/api/material-rates")
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  })
}

export function useMaterialRates() {
  return useQuery({
    queryKey: ["material-rates"],
    queryFn: fetchMaterialRates,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (settings: Partial<CompanySettings> & { id: string }) => {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
      toast({
        title: "Settings Updated",
        description: "Company settings have been saved.",
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

export function useAddMaterialRate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (rate: { material: string; rate: number }) => {
      const res = await fetch("/api/material-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material_name: rate.material,
          rate_per_mt: rate.rate,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-rates"] })
      toast({
        title: "Rate Added",
        description: "Material rate has been added successfully.",
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

export function useUpdateMaterialRate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (rate: { id: string; material?: string; rate: number }) => {
      const payload: any = {
        id: rate.id,
        rate_per_mt: rate.rate,
      }
      if (rate.material) {
        payload.material_name = rate.material
      }
      const res = await fetch("/api/material-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-rates"] })
      toast({
        title: "Rate Updated",
        description: "Material rate has been updated.",
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

export function useDeleteMaterialRate() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/material-rates?id=${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-rates"] })
      toast({
        title: "Rate Deleted",
        description: "Material rate has been removed.",
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

export function useUpdateMaterialRates() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (rates: MaterialRate[]) => {
      const res = await fetch("/api/material-rates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rates),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-rates"] })
      toast({
        title: "Rates Updated",
        description: "Material rates have been updated.",
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

export function useCompanySettings() {
  return useSettings()
}

async function fetchVehicles() {
  const res = await fetch("/api/vehicles")
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

export function useVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  })
}

export function useAddVehicle() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (vehicleNumber: string) => {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_number: vehicleNumber,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      toast({
        title: "Vehicle Added",
        description: "Vehicle has been added successfully.",
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

export function useDeleteVehicle() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/vehicles?id=${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] })
      toast({
        title: "Vehicle Deleted",
        description: "Vehicle has been removed.",
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

export function useUpdateCompanySettings() {
  return useUpdateSettings()
}
