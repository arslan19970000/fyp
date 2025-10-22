import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { User } from "@/models/user"
import { signupSchema, sanitizeObject } from "@/lib/validations"

export async function POST(request: Request) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate input
    const result = signupSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitized = sanitizeObject(result.data)

    // Check if user exists
    const exists = await User.findOne({ email: sanitized.email.toLowerCase() }).lean()
    if (exists) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Create user
    const user = new User(sanitized)
    await user.save()

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
