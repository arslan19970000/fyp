import { Router, Request, Response } from "express"
import { connectDB } from "../../lib/db"
import { Product } from "../../models/product"
import { authMiddleware } from "../middleware/auth"

const router = Router()

// POST /api/products/:id/reviews - Add a review to a product
router.post("/:id/reviews", authMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = (req as any).user.sub
    const userName = (req as any).user.name || (req as any).user.email
    const userRole = (req as any).user.role
    const { rating, comment } = req.body

    // Only buyers can submit reviews
    if (userRole !== "buyer") {
      return res.status(403).json({ error: "Only buyers can submit reviews" })
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ error: "Product not found" })
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.find(
      (r: any) => r.userId && r.userId.toString() === userId
    )

    if (alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this product" })
    }

    const review = {
      userId,
      name: userName,
      rating: Number(rating),
      comment: comment || "",
    }

    product.reviews.push(review)

    // Update average rating
    const totalRating = product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0)
    product.rating = totalRating / product.reviews.length
    product.numReviews = product.reviews.length

    await product.save()

    return res.status(201).json({ message: "Review added successfully", product })
  } catch (error) {
    console.error("Add review error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
