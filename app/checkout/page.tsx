"use client"

import { useState, useEffect } from "react"
import { useCart, cartTotal } from "@/stores/cart-store"
import { useAuth } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { checkoutSchema } from "@/lib/validations"
import { toast } from "sonner"

export default function CheckoutPage() {
  const items = useCart((s) => s.items)
  const { user, token, isBuyer, hydrated } = useAuth()
  const total = cartTotal(items)
  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  // Redirect sellers and admins away from checkout
  useEffect(() => {
    if (hydrated && user && !isBuyer()) {
      toast.error("Sellers cannot place orders")
      router.push("/seller")
    }
  }, [hydrated, user, isBuyer, router])

  // Redirect to login if not authenticated (only after hydration)
  useEffect(() => {
    if (hydrated && (!user || !token)) {
      toast.error("Please login to checkout")
      router.push("/login")
    }
  }, [hydrated, user, token, router])

  // Redirect to cart if empty
  useEffect(() => {
    if (hydrated && items.length === 0) {
      router.push("/cart")
    }
  }, [hydrated, items.length, router])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate shipping info
    const result = checkoutSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      setErrors(fieldErrors)
      toast.error("Please fill in all fields correctly")
      return
    }

    setIsProcessing(true)

    try {
      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shippingInfo: form,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error(error)
        setIsProcessing(false)
        return
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to create checkout session")
      setIsProcessing(false)
    }
  }

  // Show loading state while hydrating
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    )
  }

  // Don't render if not authenticated or not a buyer (will redirect)
  if (!user || !token || !isBuyer()) {
    return null
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleCheckout} className="space-y-6">
        {/* Shipping Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Shipping Information</h2>
          <div className="space-y-3">
            <div>
              <input
                value={form.fullName}
                onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                placeholder="Full Name"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <input
                value={form.address}
                onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                placeholder="Address"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                aria-invalid={!!errors.address}
              />
              {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  value={form.city}
                  onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                  placeholder="City"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  aria-invalid={!!errors.city}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </div>
              <div>
                <input
                  value={form.postalCode}
                  onChange={(e) => setForm((s) => ({ ...s, postalCode: e.target.value }))}
                  placeholder="Postal Code"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  aria-invalid={!!errors.postalCode}
                />
                {errors.postalCode && <p className="text-xs text-red-500 mt-1">{errors.postalCode}</p>}
              </div>
            </div>
            <div>
              <input
                value={form.country}
                onChange={(e) => setForm((s) => ({ ...s, country: e.target.value }))}
                placeholder="Country"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                aria-invalid={!!errors.country}
              />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-lg border p-4 bg-muted/50">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.title} x {item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="font-semibold text-base">Total</div>
            <div className="font-bold text-xl">${total.toFixed(2)}</div>
          </div>
        </div>

        {/* Checkout Button */}
        <Button
          className="w-full"
          type="submit"
          size="lg"
          disabled={isProcessing}
        >
          {isProcessing ? "Redirecting to payment..." : "Proceed to Payment"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          You will be redirected to Stripe to complete your payment securely
        </p>
      </form>
    </main>
  )
}
