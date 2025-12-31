import useSWR from "swr"

const fetcher = (url: string) =>
  fetch(url)
    .then((res) => res.json())
    .then((data) => data.data)

export function useMaterialRates() {
  return useSWR("/api/material-rates", fetcher)
}

export function useAddMaterialRate() {
  return async (materialRate: any) => {
    const response = await fetch("/api/material-rates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materialRate),
    })
    if (!response.ok) throw new Error("Failed to add material rate")
    return response.json()
  }
}

export function useUpdateMaterialRate() {
  return async (materialRate: any) => {
    const response = await fetch("/api/material-rates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(materialRate),
    })
    if (!response.ok) throw new Error("Failed to update material rate")
    return response.json()
  }
}

export function useDeleteMaterialRate() {
  return async (id: string) => {
    const response = await fetch(`/api/material-rates?id=${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Failed to delete material rate")
    return response.json()
  }
}
