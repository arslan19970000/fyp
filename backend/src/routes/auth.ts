import { Router, Request, Response } from "express"
import bcrypt from "bcryptjs"
import { connectDB } from "../config/db"
import { User } from "../models/User"
import { signToken } from "../utils/auth"
import { loginSchema, signupSchema, sanitizeObject } from "../utils/validations"

const router = Router()

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    await connectDB()

    // Validate input
    const result = signupSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.errors,
      })
    }

    // Sanitize input
    const sanitized = sanitizeObject(result.data)

    // Check if user exists
    const exists = await User.findOne({ email: sanitized.email.toLowerCase() })
    if (exists) {
      return res.status(400).json({ error: "Email already in use" })
    }

    // Create user
    const user = new User(sanitized)
    await user.save()

    return res.status(201).json({ ok: true, message: "User created successfully" })
  } catch (error) {
    console.error("Registration error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    await connectDB()

    // Validate input
    const result = loginSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid input",
        details: result.error.errors,
      })
    }

    const { email, password } = result.data

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = signToken({ sub: String(user._id), email: user.email, role: user.role })

    // Send response with token
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return res.status(500).json({ error: "Server error" })
  }
})

export default router
