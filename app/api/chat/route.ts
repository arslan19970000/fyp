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

    const context = `You are a helpful shopping assistant for ShopLite, an e-commerce platform.
You help customers find products, answer questions about orders, shipping, and provide shopping recommendations.
Be friendly, concise, and helpful. If asked about specific products or orders, suggest they check the website.
Keep responses short and to the point.`

    // Create chat with history
    const chat = model.startChat({
      history: history && history.length > 0
        ? history.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
          }))
        : [],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    })

    // Send message with context on first interaction
    const prompt = history && history.length === 0
      ? `${context}\n\nCustomer: ${message}`
      : message

    const result = await chat.sendMessage(prompt)
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
