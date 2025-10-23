"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  MessageCircle,
  X,
  Send,
  Bot,
  UserIcon,
  Paperclip,
  Image as ImageIcon,
  Package,
  Search,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type MessageType = "text" | "product-card" | "product-list" | "order-status" | "image"

interface BaseMessage {
  role: "user" | "assistant"
  type: MessageType
  content: string
  timestamp?: Date
}

interface ProductMessage extends BaseMessage {
  type: "product-card"
  product?: {
    id: string
    title: string
    price: number
    image?: string
  }
}

interface ProductListMessage extends BaseMessage {
  type: "product-list"
  products?: Array<{
    id: string
    title: string
    price: number
    image?: string
  }>
}

interface ImageMessage extends BaseMessage {
  type: "image"
  imageUrl?: string
}

type Message = BaseMessage | ProductMessage | ProductListMessage | ImageMessage

const QUICK_ACTIONS = [
  { label: "Track Order", icon: Package, action: "track-order", prompt: "I want to track my order" },
  { label: "Search Products", icon: Search, action: "search-products", prompt: "Show me popular products" },
  { label: "View Cart", icon: ShoppingCart, action: "view-cart", prompt: "What's in my cart?" },
]

export function EnhancedChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      type: "text",
      content: "Hi! I'm your ShopLite shopping assistant. I can help you:\n\n• Search for products\n• Track your orders\n• Answer questions\n• Analyze product images\n\nHow can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("chatbot-history")
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setMessages(parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })))
      } catch (e) {
        console.error("Failed to load chat history")
      }
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem("chatbot-history", JSON.stringify(messages))
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const clearHistory = () => {
    setMessages([
      {
        role: "assistant",
        type: "text",
        content: "Chat history cleared! How can I help you?",
        timestamp: new Date(),
      },
    ])
    localStorage.removeItem("chatbot-history")
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      // Check file type
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        alert("Only images and PDFs are allowed")
        return
      }

      setSelectedFile(file)
    }
  }

  const handleQuickAction = (action: string, prompt: string) => {
    setInput(prompt)
    handleSend(prompt)
  }

  const handleSend = async (customMessage?: string) => {
    const messageText = customMessage || input
    if ((!messageText.trim() && !selectedFile) || isLoading) return

    const userMessage: Message = {
      role: "user",
      type: selectedFile ? "image" : "text",
      content: messageText,
      timestamp: new Date(),
      ...(selectedFile && {
        imageUrl: URL.createObjectURL(selectedFile),
      }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      let response

      if (selectedFile) {
        // Handle file upload
        const formData = new FormData()
        formData.append("file", selectedFile)
        formData.append("message", messageText)

        response = await fetch("/api/chat/upload", {
          method: "POST",
          body: formData,
        })
      } else {
        // Regular chat
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            history: messages.slice(-6).map(m => ({
              role: m.role,
              content: m.content
            })),
          }),
        })
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Check if response contains product information
      let assistantMessage: Message

      if (data.products && data.products.length > 0) {
        // Product list response
        assistantMessage = {
          role: "assistant",
          type: "product-list",
          content: data.response || "Here are some products I found:",
          products: data.products,
          timestamp: new Date(),
        }
      } else {
        // Regular text response
        assistantMessage = {
          role: "assistant",
          type: "text",
          content: data.response,
          timestamp: new Date(),
        }
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        type: "text",
        content: "Sorry, I'm having trouble responding right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case "product-list":
        const productListMsg = message as ProductListMessage
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            {productListMsg.products && productListMsg.products.length > 0 && (
              <div className="grid grid-cols-1 gap-2 mt-2">
                {productListMsg.products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow block"
                  >
                    <div className="flex gap-3">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={60}
                          height={60}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">
                          {product.title}
                        </h4>
                        <p className="text-primary font-bold mt-1">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )

      case "product-card":
        const productMsg = message as ProductMessage
        if (!productMsg.product) return <p className="text-sm">{message.content}</p>
        return (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            <Link
              href={`/products/${productMsg.product.id}`}
              className="border rounded-lg p-3 hover:shadow-md transition-shadow block"
            >
              {productMsg.product.image && (
                <Image
                  src={productMsg.product.image}
                  alt={productMsg.product.title}
                  width={200}
                  height={200}
                  className="w-full rounded object-cover mb-2"
                />
              )}
              <h4 className="font-semibold text-sm">{productMsg.product.title}</h4>
              <p className="text-primary font-bold mt-1">
                ${productMsg.product.price.toFixed(2)}
              </p>
            </Link>
          </div>
        )

      case "image":
        const imageMsg = message as ImageMessage
        return (
          <div className="space-y-2">
            {imageMsg.imageUrl && (
              <Image
                src={imageMsg.imageUrl}
                alt="Uploaded image"
                width={200}
                height={200}
                className="rounded-lg max-w-full"
              />
            )}
            {message.content && <p className="text-sm">{message.content}</p>}
          </div>
        )

      default:
        return <p className="whitespace-pre-wrap text-sm">{message.content}</p>
    }
  }

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 z-50 bg-primary text-primary-foreground"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 rounded-2xl border-0 p-0 overflow-hidden bg-card">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">ShopLite Assistant</div>
                <div className="text-xs opacity-80">AI-Powered Shopping Help</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
                title="Clear chat history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 p-3 border-b border-border bg-muted/30 overflow-x-auto">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon
              return (
                <Button
                  key={action.action}
                  size="sm"
                  variant="outline"
                  onClick={() => handleQuickAction(action.action, action.prompt)}
                  className="flex items-center gap-1 whitespace-nowrap text-xs"
                >
                  <Icon className="h-3 w-3" />
                  {action.label}
                </Button>
              )
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg p-3 leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none border border-border"
                  }`}
                >
                  {renderMessage(message)}
                </div>
                {message.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted text-foreground rounded-lg rounded-bl-none p-3 border border-border">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground flex-1 truncate">
                {selectedFile.name}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => {
                  setSelectedFile(null)
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-9 w-9"
                title="Upload image or document"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedFile ? "Describe the image..." : "Type your message..."}
                disabled={isLoading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={() => handleSend()}
                disabled={(!input.trim() && !selectedFile) || isLoading}
                size="icon"
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 w-9"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Powered by Google Gemini AI
            </p>
          </div>
        </Card>
      )}
    </>
  )
}
