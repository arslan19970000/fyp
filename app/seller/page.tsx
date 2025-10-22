"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function SellerDashboard() {
  const router = useRouter()
  const { user, isSeller, isAdmin, token, hydrated } = useAuth()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const data = await res.json()

    if (!res.ok || data.error) {
      throw new Error(data.error || "Failed to fetch")
    }

    return data
  }

  // Only fetch data after hydration
  const shouldFetch = hydrated && token

  // Fetch seller dashboard data
  const { data: dashboardData, error: dashboardError } = useSWR(
    shouldFetch ? `${API_URL}/seller/dashboard` : null,
    fetcher
  )

  // Fetch seller products
  const { data: products, error: productsError, mutate } = useSWR(
    shouldFetch ? `${API_URL}/seller/products` : null,
    fetcher
  )

  // Redirect if not seller or admin
  useEffect(() => {
    if (hydrated && user && !isSeller() && !isAdmin()) {
      router.push("/")
    }
  }, [hydrated, user, isSeller, isAdmin, router])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setDeleteId(id)
      const res = await fetch(`${API_URL}/seller/products/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      if (!res.ok) {
        throw new Error("Failed to delete product")
      }

      mutate()
    } catch (error) {
      console.error("Delete error:", error)
      alert("Failed to delete product")
    } finally {
      setDeleteId(null)
    }
  }

  // Show loading while hydrating
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  // Show error only after hydration is complete
  if (dashboardError || productsError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {dashboardError?.message === "No token provided" ||
          dashboardError?.message === "Invalid or expired token" ||
          productsError?.message === "No token provided" ||
          productsError?.message === "Invalid or expired token"
            ? "Please sign in as a seller to view this page."
            : "Error loading dashboard. Please try again."}
        </p>
      </main>
    )
  }

  if (!dashboardData || !products) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Link href="/seller/products/new">
          <Button>Add New Product</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.productCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.avgRating}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>Manage your product listings</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet. Add your first product!</p>
          ) : (
            <div className="space-y-3">
              {products.map((product: any) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${product.price.toFixed(2)} • Stock: {product.countInStock} • Category:{" "}
                      {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/seller/products/${product._id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(product._id)}
                      disabled={deleteId === product._id}
                    >
                      {deleteId === product._id ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
