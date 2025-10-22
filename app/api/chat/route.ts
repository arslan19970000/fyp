import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file." },
        { status: 500 }
      )
    }

    // Use gemini-pro which is stable and works
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const systemPrompt = `You are a helpful shopping assistant for ShopLite, an e-commerce platform. You help customers find products, answer questions about orders, shipping, and provide shopping recommendations. Be friendly, concise, and helpful.`

    // Build the full prompt with context and history
    let fullPrompt = systemPrompt + "\n\n"

    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        const role = msg.role === "user" ? "Customer" : "Assistant"
        fullPrompt += `${role}: ${msg.content}\n`
      })
    }

    fullPrompt += `Customer: ${message}\nAssistant:`

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const text = result.response.text()
    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Chat error:", error)
    const message =
      error.statusText ||
      error.message ||
      "Unexpected error occurred while generating response."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
