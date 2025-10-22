import { Router, Request, Response } from "express"
import { connectDB } from "../../lib/db"
import { Product } from "../../models/product"
import { authMiddleware, adminMiddleware } from "../middleware/auth"

const router = Router()

// GET /api/products - Get all products with filters
router.get("/", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const { category, q, min, max, featured } = req.query

    const query: Record<string, any> = {
      price: {
        $gte: Number(min) || 0,
        $lte: Number(max) || Number.MAX_SAFE_INTEGER,
      },
    }

    if (category) query.category = category
    if (featured === "true") query.featured = true
    if (q) query.$text = { $search: q }

    // Ensure text index exists
    await Product.collection.createIndex?.({ title: "text", description: "text" })

    const products = await Product.find(query).sort({ createdAt: -1 }).lean()

    return res.status(200).json(products)
  } catch (error) {
    console.error("Get products error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/products/:id - Get single product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const product = await Product.findById(req.params.id).lean()

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json(product)
  } catch (error) {
    console.error("Get product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /api/products - Create new product (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const product = await Product.create(req.body)

    return res.status(201).json(product)
  } catch (error) {
    console.error("Create product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/products/:id - Update product (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json(product)
  } catch (error) {
    console.error("Update product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/products/:id - Delete product (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    return res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
