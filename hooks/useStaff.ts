"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/hooks/use-toast"

async function fetchStaffMembers() {
  const res = await fetch("/api/staff")
  const json = await res.json()
  if (!res.ok) throw new Error(json.error)
  return json.data
}

export function useStaffMembers() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaffMembers,
  })
}

export function useAddStaff() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (staff: {
      email?: string
      password?: string
      fullName?: string
      name?: string
      role: string
    }) => {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: staff.fullName || staff.name || "",
          role: staff.role,
          email: staff.email,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "Staff Added",
        description: "Staff member has been added successfully.",
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

export function useDeleteStaff() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/staff?id=${id}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      return json.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] })
      toast({
        title: "Staff Deleted",
        description: "Staff member has been removed.",
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

export function useStaff() {
  return useStaffMembers()
}
