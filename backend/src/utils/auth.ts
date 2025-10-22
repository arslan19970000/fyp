import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable")
}

export type UserRole = "buyer" | "seller" | "admin"

export type JWTPayload = {
  sub: string
  email: string
  role: UserRole
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Role-based authorization helpers
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === "admin"
}

export function isSeller(userRole: UserRole): boolean {
  return userRole === "seller"
}

export function isBuyer(userRole: UserRole): boolean {
  return userRole === "buyer"
}
