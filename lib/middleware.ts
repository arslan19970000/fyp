import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken, hasRole, type JWTPayload } from "@/lib/auth"
import type { UserRole } from "@/models/user"

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload
}

/**
 * Middleware to verify authentication
 */
export function requireAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const auth = req.headers.get("authorization")
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null

    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token provided" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 })
    }

    // Attach user to request
    const authenticatedReq = req as AuthenticatedRequest
    authenticatedReq.user = payload

    return handler(authenticatedReq)
  }
}

/**
 * Middleware to verify user has required role(s)
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return requireAuth(async (req: AuthenticatedRequest) => {
      const userRole = req.user?.role

      if (!userRole || !hasRole(userRole, allowedRoles)) {
        return NextResponse.json(
          { error: `Forbidden - Requires role: ${allowedRoles.join(" or ")}` },
          { status: 403 }
        )
      }

      return handler(req)
    })
  }
}

/**
 * Middleware for admin-only routes
 */
export function requireAdmin(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireRole("admin")(handler)
}

/**
 * Middleware for seller-only routes
 */
export function requireSeller(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireRole("seller", "admin")(handler) // Admin can access seller routes
}

/**
 * Middleware for buyer-only routes
 */
export function requireBuyer(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireRole("buyer", "admin")(handler) // Admin can access buyer routes
}

/**
 * Middleware that allows any authenticated user
 */
export function requireAnyAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
  return requireAuth(handler)
}
