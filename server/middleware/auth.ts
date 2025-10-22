import { Request, Response, NextFunction } from "express"
import { verifyToken } from "../../lib/auth"

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string
        email: string
        role: string
      }
    }
  }
}

// Authentication middleware - verifies JWT token
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.slice(7) // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyToken(token)

    if (!payload) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    // Attach user to request
    req.user = payload

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    return res.status(401).json({ error: "Authentication failed" })
  }
}

// Admin authorization middleware - must be used after authMiddleware
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" })
    }

    next()
  } catch (error) {
    console.error("Admin middleware error:", error)
    return res.status(403).json({ error: "Authorization failed" })
  }
}

// Seller authorization middleware - must be used after authMiddleware
export const sellerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (req.user.role !== "seller" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Seller access required" })
    }

    next()
  } catch (error) {
    console.error("Seller middleware error:", error)
    return res.status(403).json({ error: "Authorization failed" })
  }
}
