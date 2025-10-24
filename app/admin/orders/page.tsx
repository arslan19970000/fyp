"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import useSWR, { mutate } from "swr"
import { useAuth } from "@/stores/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Clock, Truck, CheckCircle } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

interface Order {
  _id: string
  userId: string
  items: Array<{
    productId: string
    title: string
    price: number
    quantity: number
    image?: string
  }>
  total: number
  shipping: {
    fullName: string
    address: string
    city: string
    country: string
    postalCode: string
  }
  status: "Pending" | "Shipped" | "Delivered"
  createdAt: string
  updatedAt: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, token, isAdmin } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !isAdmin()) {
      router.push("/")
    }
  }, [isHydrated, isAdmin, router])

  const fetcher = async (url: string) => {
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error("Failed to fetch")
    return res.json()
  }

  const { data: allOrders, error } = useSWR<Order[]>(
    isHydrated && isAdmin() ? `${API_URL}/admin/orders` : null,
    fetcher
  )

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update order")
      }

      toast.success(`Order status updated to ${newStatus}`)
      mutate(`${API_URL}/admin/orders`)
    } catch (error: any) {
      console.error("Update order error:", error)
      toast.error(error.message || "Failed to update order status")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      Pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      Shipped: { variant: "default", icon: Truck, color: "text-blue-600" },
      Delivered: { variant: "default", icon: CheckCircle, color: "text-green-600" },
    }

    const config = variants[status] || variants.Pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    )
  }

  if (!isHydrated) {
    return <div className="container py-10">Loading...</div>
  }

  if (!isAdmin()) {
    return null
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          Manage all customer orders and update their status
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load orders. Please try again.</p>
          </CardContent>
        </Card>
      )}

      {!allOrders && !error && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      )}

      {allOrders && allOrders.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">No orders found</p>
          </CardContent>
        </Card>
      )}

      {allOrders && allOrders.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {allOrders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order #{order._id.slice(-8).toUpperCase()}
                      </CardTitle>
                      <CardDescription>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <Select
                        defaultValue={order.status}
                        onValueChange={(value) => updateOrderStatus(order._id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Shipping Info */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Shipping Address:</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.shipping.fullName}<br />
                        {order.shipping.address}<br />
                        {order.shipping.city}, {order.shipping.country} {order.shipping.postalCode}
                      </p>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Items ({order.items.length}):</h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
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
                                <p className="font-medium">{item.title}</p>
                                <p className="text-muted-foreground">
                                  Qty: {item.quantity} × ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className="font-semibold">Total:</span>
                      <span className="text-lg font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
