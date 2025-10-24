"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { useAuth } from "@/stores/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Truck, CheckCircle, Package } from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface Order {
  _id: string
  items: Array<{
    title: string
    price: number
    quantity: number
    image?: string
  }>
  total: number
  status: "Pending" | "Shipped" | "Delivered"
  createdAt: string
  shipping: {
    fullName: string
    address: string
    city: string
    country: string
  }
}

export default function AccountPage() {
  const { token } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

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

  const { data: ordersRes, error } = useSWR<Order[]>(
    isHydrated && token ? `${API_URL}/orders` : null,
    fetcher
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-yellow-600" />
            Pending
          </Badge>
        )
      case "Shipped":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-600">
            <Truck className="h-3 w-3" />
            Shipped
          </Badge>
        )
      case "Delivered":
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (error) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {error.message === "No token provided" || error.message === "Invalid or expired token"
                ? "Please sign in to view your orders."
                : "Error loading orders. Please try again."}
            </p>
          </CardContent>
        </Card>
      </main>
    )
  }

  if (!isHydrated || !ordersRes) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <p className="text-muted-foreground">Loading your orders...</p>
      </main>
    )
  }

  if (!token) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Please sign in to view your orders.</p>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-muted-foreground">
          Track and manage your order history
        </p>
      </div>

      {ordersRes.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-10">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <a href="/products" className="text-primary hover:underline">
              Start shopping →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersRes.map((order) => (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm">Order Items:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b pb-2 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-xs text-muted-foreground">
                                Quantity: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <p className="font-semibold text-sm">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Shipping To:</h4>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping.fullName}<br />
                      {order.shipping.address}<br />
                      {order.shipping.city}, {order.shipping.country}
                    </p>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="font-semibold">Order Total:</span>
                    <span className="text-lg font-bold text-primary">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
