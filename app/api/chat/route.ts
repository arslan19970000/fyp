import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import Product from "@/models/product"

// Detect if message is asking for products
function isProductSearchQuery(message: string): boolean {
  const searchKeywords = [
    "search", "find", "show", "looking for", "products", "items",
    "laptop", "phone", "camera", "shoes", "clothes", "electronics",
    "popular", "trending", "best", "cheap", "affordable", "buy"
  ]

  const lowerMessage = message.toLowerCase()
  return searchKeywords.some(keyword => lowerMessage.includes(keyword))
}

// Extract search terms from message
function extractSearchTerms(message: string): string {
  const commonWords = ["show", "me", "find", "search", "for", "looking", "products", "items", "want", "need", "buy"]
  const words = message.toLowerCase().split(/\s+/)
  const searchWords = words.filter(word => !commonWords.includes(word) && word.length > 2)
  return searchWords.join(" ")
}

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

    // Check if user is asking for product search
    if (isProductSearchQuery(message)) {
      try {
        await connectDB()

        const searchTerms = extractSearchTerms(message)

        // Search products
        const products = await Product.find({
          $or: [
            { title: { $regex: searchTerms, $options: "i" } },
            { description: { $regex: searchTerms, $options: "i" } },
            { category: { $regex: searchTerms, $options: "i" } },
          ],
        })
          .limit(5)
          .select("title price images slug")
          .lean()

        if (products.length > 0) {
          const productList = products.map((p: any) => ({
            id: p.slug || p._id.toString(),
            title: p.title,
            price: p.price,
            image: p.images?.[0] || "/placeholder.png",
          }))

          return NextResponse.json({
            response: `I found ${products.length} product${products.length > 1 ? "s" : ""} for you! Click on any product to view details:`,
            products: productList,
          })
        }
      } catch (dbError) {
        console.error("Product search error:", dbError)
        // Continue to AI response if product search fails
      }
    }

    // Build conversation context
    const systemPrompt = `You are a helpful shopping assistant for ShopLite, an e-commerce platform.

Your capabilities:
- Help customers find products
- Answer questions about orders and shipping
- Provide product recommendations
- Analyze uploaded product images
- Track order status

If a customer asks about products and you can't find exact matches, suggest related categories or ask clarifying questions.

Be friendly, concise, and helpful.`

    let fullPrompt = systemPrompt + "\n\n"

    if (history && history.length > 0) {
      history.forEach((msg: any) => {
        const role = msg.role === "user" ? "Customer" : "Assistant"
        fullPrompt += `${role}: ${msg.content}\n`
      })
    }

    fullPrompt += `Customer: ${message}\nAssistant:`

    // Use v1 REST API with gemini-2.5-flash (stable model)
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`

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
