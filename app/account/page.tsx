"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function AccountPage() {
  const { token } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  // Wait for zustand to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    // If there's an error in the response, throw it
    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to fetch")
    }

    return data
  }

  // Only fetch orders after hydration and if token exists
  const { data: ordersRes, error } = useSWR(
    isHydrated && token ? `${API_URL}/orders` : null,
    fetcher
  )

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">My Orders</h1>
        <p className="text-sm text-muted-foreground">
          {error.message === "No token provided" || error.message === "Invalid or expired token"
            ? "Please sign in to view your orders."
            : "Error loading orders. Please try again."}
        </p>
      </main>
    )
  }

  // Show loading while hydrating or fetching
  if (!isHydrated || !ordersRes) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">My Orders</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  // If not logged in after hydration
  if (!token) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">My Orders</h1>
        <p className="text-sm text-muted-foreground">Please sign in to view your orders.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">My Orders</h1>
      {Array.isArray(ordersRes) && ordersRes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No orders yet.</p>
      ) : Array.isArray(ordersRes) ? (
        <ul className="space-y-3">
          {ordersRes.map((o: any) => (
            <li key={o._id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">Order #{o._id.slice(-6)}</div>
                <div className="text-sm">{o.status}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {o.items.length} items • ${o.total.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  )
}
