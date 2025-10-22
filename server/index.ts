import express, { Express, Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"

// Load environment variables FIRST before any other imports
dotenv.config()

import { connectDB } from "../lib/db"

// Import routes
import authRoutes from "./routes/auth"
import productRoutes from "./routes/products"
import orderRoutes from "./routes/orders"
import userRoutes from "./routes/users"
import sellerRoutes from "./routes/seller"
import reviewRoutes from "./routes/reviews"

const app: Express = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.error("❌ MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/products", reviewRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.use("/api/seller", sellerRoutes)

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Server is running" })
})

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack)
  res.status(500).json({ error: "Something went wrong!", message: err.message })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Express server running on http://localhost:${PORT}`)
})

export default app
