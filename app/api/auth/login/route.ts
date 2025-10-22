import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import bcrypt from "bcryptjs"
import { signToken } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate input
    const result = loginSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate token
    const token = signToken({ sub: String(user._id), email: user.email, role: user.role })

    // Prepare response
    const res = NextResponse.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    })

    // Set secure cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return res
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
