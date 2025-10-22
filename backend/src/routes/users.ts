import { Router, Request, Response } from "express"
import { connectDB } from "../config/db"
import { User } from "../models/User"
import { authMiddleware, adminMiddleware } from "../middleware/auth"

const router = Router()

// All user routes require authentication
router.use(authMiddleware)

// GET /api/users/me - Get current user profile
router.get("/me", async (req: Request, res: Response) => {
  try {
    const user = req.user!

    return res.status(200).json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// PUT /api/users/me - Update current user profile
router.put("/me", async (req: Request, res: Response) => {
  try {
    await connectDB()

    const userId = req.user!.sub

    // Prevent updating sensitive fields
    const { password, role, ...updateData } = req.body

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error("Update user error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/users - Get all users (Admin only)
router.get("/", adminMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const users = await User.find().select("-password").lean()

    return res.status(200).json(users)
  } catch (error) {
    console.error("Get users error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// GET /api/users/:id - Get user by ID (Admin only)
router.get("/:id", adminMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const user = await User.findById(req.params.id).select("-password").lean()

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json(user)
  } catch (error) {
    console.error("Get user error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// DELETE /api/users/:id - Delete user (Admin only)
router.delete("/:id", adminMiddleware, async (req: Request, res: Response) => {
  try {
    await connectDB()

    const user = await User.findByIdAndDelete(req.params.id)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
