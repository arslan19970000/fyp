import mongoose, { Schema, type Model } from "mongoose"

export interface IReview {
  userId: string
  name: string
  rating: number
  comment?: string
  createdAt?: Date
}

export interface IProduct {
  _id: string
  title: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  brand?: string
  rating: number
  numReviews: number
  countInStock: number
  featured?: boolean
  sellerId?: string
  sellerName?: string
  reviews: IReview[]
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    comment: { type: String },
  },
  { timestamps: true, _id: false },
)

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: String, required: true, index: true },
    brand: { type: String },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    countInStock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    sellerId: { type: String, index: true },
    sellerName: { type: String },
    reviews: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true },
)

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema)
