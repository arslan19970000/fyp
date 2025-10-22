import { Router, Request, Response } from "express"
import { connectDB } from "../../lib/db"
import { Product } from "../../models/product"
import { User } from "../../models/user"
import { authMiddleware, sellerMiddleware } from "../middleware/auth"

const router = Router()

// GET /api/seller/products - Get seller's own products
router.get("/products", authMiddleware, sellerMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const sellerId = req.user?.sub

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 }).lean()

    return res.status(200).json(products)
  } catch (error) {
    console.error("Get seller products error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /api/seller/products - Create new product as seller
router.post("/products", authMiddleware, sellerMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const sellerId = req.user?.sub

    // Get seller info
    const seller = await User.findById(sellerId)
    if (!seller) {
      return res.status(404).json({ error: "Seller not found" })
    }

    // Create product with seller info
    const product = await Product.create({
      ...req.body,
      sellerId,
      sellerName: seller.shopName || seller.name,
    })

    return res.status(201).json(product)
  } catch (error) {
    console.error("Create product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/seller/products/:id - Update seller's own product
router.put("/products/:id", authMiddleware, sellerMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const sellerId = req.user?.sub

    // Find product and check ownership
    const existingProduct = await Product.findById(req.params.id)

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Check if seller owns this product (admins can edit any product)
    if (existingProduct.sellerId !== sellerId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "You can only edit your own products" })
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, sellerId: existingProduct.sellerId }, // Preserve original seller
      { new: true, runValidators: true }
    )

    return res.status(200).json(product)
  } catch (error) {
    console.error("Update product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/seller/products/:id - Delete seller's own product
router.delete("/products/:id", authMiddleware, sellerMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const sellerId = req.user?.sub

    // Find product and check ownership
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Check if seller owns this product (admins can delete any product)
    if (product.sellerId !== sellerId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "You can only delete your own products" })
    }

    await Product.findByIdAndDelete(req.params.id)

    return res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/seller/dashboard - Get seller dashboard stats
router.get("/dashboard", authMiddleware, sellerMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const sellerId = req.user?.sub

    // Get product count
    const productCount = await Product.countDocuments({ sellerId })

    // Get total products in stock
    const products = await Product.find({ sellerId }).lean()
    const totalStock = products.reduce((sum, p) => sum + (p.countInStock || 0), 0)

    // Calculate average rating
    const avgRating = products.length > 0
      ? products.reduce((sum, p) => sum + (p.rating || 0), 0) / products.length
      : 0

    return res.status(200).json({
      productCount,
      totalStock,
      avgRating: avgRating.toFixed(1),
      recentProducts: products.slice(0, 5),
    })
  } catch (error) {
    console.error("Get seller dashboard error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
