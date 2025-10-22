import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Product } from "@/models/product"
import { verifyToken } from "@/lib/auth"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const product = await Product.findById(id).lean()
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(product)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await connectDB()
  const token = request.headers.get("authorization")?.replace("Bearer ", "")
  const payload = token ? verifyToken(token) : null
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { rating, comment } = await request.json()
  const prod = await Product.findById(id)
  if (!prod) return NextResponse.json({ error: "Not found" }, { status: 404 })
  prod.reviews.push({
    userId: payload.sub,
    name: payload.email,
    rating,
    comment,
  })
  prod.numReviews = prod.reviews.length
  prod.rating = prod.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / Math.max(1, prod.numReviews)
  await prod.save()
  return NextResponse.json({ ok: true })
}
