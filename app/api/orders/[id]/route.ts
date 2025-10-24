import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Order } from "@/models/order"
import { verifyToken } from "@/lib/auth"

// GET single order
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await Order.findById(params.id).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Users can only see their own orders (unless admin)
    if (order.userId !== payload.sub && payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Get order error:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

// PUT update order status (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can update order status
    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can update order status" },
        { status: 403 }
      )
    }

    const { status } = await request.json()

    // Validate status
    const validStatuses = ["Pending", "Shipped", "Delivered"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be: Pending, Shipped, or Delivered" },
        { status: 400 }
      )
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).lean()

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Update order error:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE order (Admin only or own pending orders)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await Order.findById(params.id)

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Admins can delete any order, users can only delete their own pending orders
    const isAdmin = payload.role === "admin"
    const isOwnOrder = order.userId === payload.sub
    const isPending = order.status === "Pending"

    if (!isAdmin && !(isOwnOrder && isPending)) {
      return NextResponse.json(
        { error: "Can only cancel pending orders" },
        { status: 403 }
      )
    }

    await Order.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Delete order error:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}
