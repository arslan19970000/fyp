import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["buyer", "seller"], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
  shopName: z.string().min(3, "Shop name must be at least 3 characters").optional(),
}).refine(
  (data) => {
    // If role is seller, shopName is required
    if (data.role === "seller" && !data.shopName) {
      return false
    }
    return true
  },
  {
    message: "Shop name is required for sellers",
    path: ["shopName"],
  }
)

export const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required").max(100, "Name is too long"),
  address: z.string().min(5, "Address is required").max(200, "Address is too long"),
  city: z.string().min(2, "City is required").max(100, "City name is too long"),
  country: z.string().min(2, "Country is required").max(100, "Country name is too long"),
  postalCode: z.string().min(3, "Postal code is required").max(20, "Invalid postal code"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>

// Sanitize user input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove < and > to prevent basic XSS
    .substring(0, 1000) // Limit length
}

// Sanitize all fields in an object
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      sanitized[key] = sanitizeInput(obj[key]) as any
    } else {
      sanitized[key] = obj[key]
    }
  }
  return sanitized
}
