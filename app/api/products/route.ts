import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { Product } from "@/models/product"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  await connectDB()
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const q = searchParams.get("q")
  const min = Number(searchParams.get("min") || 0)
  const max = Number(searchParams.get("max") || Number.MAX_SAFE_INTEGER)
  const query: Record<string, any> = {
    price: { $gte: min, $lte: max },
  }
  if (category) query.category = category
  if (q) query.$text = { $search: q }

  // Ensure text index exists (safe to call multiple times)
  await Product.collection.createIndex?.({ title: "text", description: "text" })

  const products = await Product.find(query).sort({ createdAt: -1 }).lean()
  return NextResponse.json(products)
}

export async function POST(request: Request) {
  await connectDB()
  const auth = request.headers.get("authorization")
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null
  const payload = token ? verifyToken(token) : null
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const product = await Product.create(body)
  return NextResponse.json(product, { status: 201 })
}
