import mongoose, { Schema, type Model } from "mongoose"
import bcrypt from "bcryptjs"

export type UserRole = "buyer" | "seller" | "admin"

export interface IUser {
  _id: string
  name: string
  email: string
  password: string
  role: UserRole
  phone?: string
  address?: {
    street?: string
    city?: string
    country?: string
    postalCode?: string
  }
  // Seller-specific fields
  shopName?: string
  shopDescription?: string
  // Buyer-specific fields
  wishlist?: string[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["buyer", "seller", "admin"], default: "buyer" },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    // Seller fields
    shopName: { type: String },
    shopDescription: { type: String },
    // Buyer fields
    wishlist: { type: [String], default: [] },
  },
  { timestamps: true },
)

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  const salt = await bcrypt.genSalt(10)
  // @ts-ignore
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

UserSchema.methods.comparePassword = async function (candidate: string) {
  // @ts-ignore
  return bcrypt.compare(candidate, this.password)
}

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
