// Load environment variables FIRST before any other imports
import dotenv from "dotenv"
dotenv.config()

import express, { Express, Request, Response } from "express"
import cors from "cors"
import { connectDB } from "./config/db"

// Import routes
import authRoutes from "./routes/auth"
import productRoutes from "./routes/products"
import orderRoutes from "./routes/orders"
import userRoutes from "./routes/users"

const app: Express = express()
const PORT = process.env.PORT || 5000
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000"

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    message: "E-commerce Backend API is running",
    timestamp: new Date().toISOString()
  })
})

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "E-commerce Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      users: "/api/users"
    }
  })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : undefined
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`)
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`)
  console.log(`🏥 Health check: http://localhost:${PORT}/health`)
})

export default app
