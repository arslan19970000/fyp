import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
})

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export async function POST(req: NextRequest) {
  try {
    const { sessionId, token } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      )
    }

    // Parse metadata
    const items = JSON.parse(session.metadata?.items || "[]")
    const shippingInfo = JSON.parse(session.metadata?.shippingInfo || "{}")
    const total = parseFloat(session.metadata?.total || "0")

    // Create order in backend
    const orderResponse = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: items.map((item: any) => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total,
        shipping: shippingInfo,
        paymentIntentId: session.payment_intent,
        stripeSessionId: sessionId,
      }),
    })

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json()
      throw new Error(errorData.error || "Failed to create order")
    }

    const order = await orderResponse.json()

    return NextResponse.json({
      success: true,
      order,
      session: {
        id: session.id,
        payment_status: session.payment_status,
        amount_total: session.amount_total,
      }
    })
  } catch (error: any) {
    console.error("Session verification error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to verify session" },
      { status: 500 }
    )
  }
}
