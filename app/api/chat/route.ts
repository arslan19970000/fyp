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

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    // Build context for the chatbot
    const context = `You are a helpful shopping assistant for ShopLite, an e-commerce platform.
You help customers find products, answer questions about orders, shipping, and provide shopping recommendations.
Be friendly, concise, and helpful. If asked about specific products or orders, suggest they check the website.
Keep responses short and to the point.`

    // Build conversation history
    let fullPrompt = context + "\n\n"
    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        fullPrompt += `${msg.role === "user" ? "Customer" : "Assistant"}: ${msg.content}\n`
      })
    }
    fullPrompt += `Customer: ${message}\nAssistant:`

    // Generate response
    const result = await model.generateContent(fullPrompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    )
  }
}
