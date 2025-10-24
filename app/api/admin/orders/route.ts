import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Order } from "@/models/order"
import { verifyToken } from "@/lib/auth"

// GET all orders (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    const payload = token ? verifyToken(token) : null

    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only admins can view all orders
    if (payload.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view all orders" },
        { status: 403 }
      )
    }

    // Get all orders, sorted by newest first
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Get all orders error:", error)
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}
