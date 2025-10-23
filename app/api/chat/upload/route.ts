import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const message = formData.get("message") as string || "What is this?"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const API_KEY = process.env.GEMINI_API_KEY

    if (!API_KEY) {
      throw new Error("Gemini API key not configured")
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")

    // Build prompt for image analysis
    const prompt = `You are a helpful shopping assistant for an e-commerce platform called ShopLite.
The user has uploaded an image with this question: "${message}"

Analyze the image and provide a helpful response. If it's a product image:
- Describe the product
- Suggest similar products we might have
- Provide shopping advice

If it's a receipt or order confirmation:
- Summarize the key information
- Help with any questions about the order

Be friendly and concise.`

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      // For non-images (like PDFs), use text-only response
      return NextResponse.json({
        response: `I can see you've uploaded a ${file.type} file. Currently, I work best with images. For product images, I can help you identify items and find similar products. Would you like to upload an image instead?`,
      })
    }

    // Call Gemini API with vision
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
                text: prompt,
              },
              {
                inline_data: {
                  mime_type: file.type,
                  data: base64,
                },
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

    const data = await response.json()

    if (!response.ok) {
      console.error("Gemini API error:", data)

      // Handle specific error cases
      if (data.error?.message?.includes("overloaded")) {
        return NextResponse.json({
          response: `I can see you've uploaded an image! However, the AI service is currently experiencing high demand.

Here's what I can help you with:
• Describe what you're looking for, and I'll search our product database
• Ask questions about products, orders, or shipping
• Browse products using the "Search Products" button

Please try uploading the image again in a few moments! 🙏`
        })
      }

      throw new Error(data.error?.message || "AI request failed")
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponse) {
      return NextResponse.json({
        response: "I received your image but couldn't analyze it. Could you describe what you're looking for instead?"
      })
    }

    return NextResponse.json({ response: aiResponse })
  } catch (error: any) {
    console.error("Chat upload error:", error)

    // Provide helpful fallback message
    return NextResponse.json({
      response: `I'm having trouble analyzing images right now. But I can still help you!

Try these instead:
• Describe the product you're looking for
• Use "Search Products" to browse our catalog
• Ask me questions about orders or shipping

You can also try uploading the image again in a minute! 😊`
    })
  }
}
