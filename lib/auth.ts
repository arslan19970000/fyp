import jwt from "jsonwebtoken"
import { cookies, headers } from "next/headers"
import type { NextRequest } from "next/server"
import type { UserRole } from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET as string
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable")
}

export type JWTPayload = {
  sub: string
  email: string
  role: UserRole
}

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getTokenFromRequest(req: NextRequest) {
  const auth = req.headers.get("authorization") || (await headers()).get("authorization")
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7)
  }
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value
  return token || null
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
