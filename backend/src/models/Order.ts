import mongoose, { Schema, type Model } from "mongoose"

export type OrderStatus = "Pending" | "Shipped" | "Delivered"

export interface IOrderItem {
  productId: string
  title: string
  price: number
  quantity: number
  image?: string
}

export interface IOrder {
  _id: string
  userId: string
  items: IOrderItem[]
  total: number
  shipping: {
    fullName: string
    address: string
    city: string
    country: string
    postalCode: string
  }
  status: OrderStatus
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false },
)

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    shipping: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    status: { type: String, enum: ["Pending", "Shipped", "Delivered"], default: "Pending" },
  },
  { timestamps: true },
)

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema)
