import { Router, Request, Response } from "express"
import { connectDB } from "../../lib/db"
import { Order } from "../../models/order"
import { Product } from "../../models/product"
import { User } from "../../models/user"
import { authMiddleware } from "../middleware/auth"
import { sendBuyerOrderConfirmation, sendSellerOrderNotification } from "../services/email"

const router = Router()

// All order routes require authentication
router.use(authMiddleware)

// GET /api/orders - Get user's orders
router.get("/", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = (req as any).user.sub

    const orders = await Order.find({ userId }).sort({ createdAt: -1 }).lean()

    return res.status(200).json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/orders/:id - Get single order
router.get("/:id", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = (req as any).user.sub
    const order = await Order.findOne({ _id: req.params.id, userId }).lean()

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    return res.status(200).json(order)
  } catch (error) {
    console.error("Get order error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /api/orders - Create new order
router.post("/", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = (req as any).user.sub
    const userEmail = (req as any).user.email

    // Fetch user to get their name
    const user = await User.findById(userId)
    const userName = user?.name || "Customer"

    const orderData = {
      ...req.body,
      userId,
      status: "Pending",
    }

    const order = await Order.create(orderData)

    // Send emails after order is created
    try {
      // Send email to buyer
      await sendBuyerOrderConfirmation(
        userEmail,
        userName,
        order._id.toString(),
        order.items,
        order.total,
        order.shipping
      )

      // Send email to each seller whose product was ordered
      const sellerEmailsSent = new Set<string>() // Track to avoid duplicate emails to same seller

      for (const item of order.items) {
        // Get product to find seller ID
        const product = await Product.findById(item.productId)

        if (product && product.sellerId) {
          // Skip if we already sent email to this seller for this order
          if (sellerEmailsSent.has(product.sellerId)) {
            continue
          }

          // Get seller information
          const seller = await User.findById(product.sellerId)

          if (seller && seller.email) {
            // Send notification to seller
            await sendSellerOrderNotification(
              seller.email,
              seller.name || seller.shopName || "Seller",
              order._id.toString(),
              {
                title: item.title,
                quantity: item.quantity,
                price: item.price,
              },
              userName,
              order.shipping
            )

            sellerEmailsSent.add(product.sellerId)
          }
        }
      }
    } catch (emailError) {
      // Log email error but don't fail the order creation
      console.error("Error sending order emails:", emailError)
    }

    return res.status(201).json(order)
  } catch (error) {
    console.error("Create order error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/orders/:id - Update order status
router.put("/:id", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = (req as any).user.sub
    const { status } = req.body

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status },
      { new: true, runValidators: true }
    )

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    return res.status(200).json(order)
  } catch (error) {
    console.error("Update order error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/orders/:id - Cancel order
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = (req as any).user.sub

    const order = await Order.findOneAndDelete({ _id: req.params.id, userId })

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    return res.status(200).json({ message: "Order cancelled successfully" })
  } catch (error) {
    console.error("Delete order error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
