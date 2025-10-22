import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: Request) {
  const token =
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    // cookie access in route handler response side isn't needed here; client can send header
    null
  const payload = token ? verifyToken(token) : null
  if (!payload) return NextResponse.json({ user: null })
  return NextResponse.json({ user: payload })
}
