"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"
import { useRouter } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, token } = useAuth()
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

  // Fetch all products
  const { data: products, error: productsError, mutate } = useSWR(
    `${API_URL}/products`,
    fetcher
  )

  // Fetch all users
  const { data: users, error: usersError } = useSWR(
    `${API_URL}/users`,
    fetcher
  )

  // Redirect if not admin
  useEffect(() => {
    if (user && !isAdmin()) {
      router.push("/")
    }
  }, [user, isAdmin, router])

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setDeleteId(id)
      const res = await fetch(`${API_URL}/products/${id}`, {
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

  if (productsError || usersError) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {productsError?.message === "No token provided" ||
          productsError?.message === "Invalid or expired token" ||
          usersError?.message === "No token provided" ||
          usersError?.message === "Invalid or expired token"
            ? "Please sign in as an admin to view this page."
            : "Error loading dashboard. Please try again."}
        </p>
      </main>
    )
  }

  if (!products || !users) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  const totalUsers = users.length
  const sellerCount = users.filter((u: any) => u.role === "seller").length
  const buyerCount = users.filter((u: any) => u.role === "buyer").length
  const totalProducts = products.length

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Sellers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sellerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buyerCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage all products in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
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
                      {product.sellerName && ` • Seller: ${product.sellerName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteProduct(product._id)}
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

      {/* Users Management */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View all registered users</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {users.map((user: any) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email} • Role: {user.role}
                      {user.shopName && ` • Shop: ${user.shopName}`}
                    </p>
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
