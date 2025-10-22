import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const API_KEY = process.env.GEMINI_API_KEY
    if (!API_KEY || API_KEY === "your-gemini-api-key-here") {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      )
    }

    // Build conversation context
    const systemPrompt = "You are a helpful shopping assistant for ShopLite, an e-commerce platform. Help customers find products, answer questions about orders and shipping. Be friendly and concise."

    let fullPrompt = systemPrompt + "\n\n"

    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        const role = msg.role === "user" ? "Customer" : "Assistant"
        fullPrompt += `${role}: ${msg.content}\n`
      })
    }

    fullPrompt += `Customer: ${message}\nAssistant:`

    // Use v1 REST API with gemini-pro (stable model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      throw new Error("No response generated")
    }

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error("Chat error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    )
  }
}
