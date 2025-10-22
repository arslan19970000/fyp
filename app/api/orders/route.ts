import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Order } from "@/models/order"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  await connectDB()
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  const payload = token ? verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const orders = await Order.find({ userId: payload.sub }).sort({ createdAt: -1 }).lean()
  return NextResponse.json(orders)
}

export async function POST(request: Request) {
  await connectDB()
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  const payload = token ? verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await request.json()
  const order = await Order.create({ ...data, userId: payload.sub, status: "Pending" })
  return NextResponse.json(order, { status: 201 })
}
