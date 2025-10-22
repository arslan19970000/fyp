"use client"

import { useCart, cartTotal } from "@/stores/cart-store"
import { useAuth } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CartPage() {
  const items = useCart((s) => s.items)
  const remove = useCart((s) => s.remove)
  const setQty = useCart((s) => s.setQty)
  const total = cartTotal(items)
  const { user, isBuyer, hydrated } = useAuth()
  const router = useRouter()

  // Redirect sellers and admins away from cart
  useEffect(() => {
    if (hydrated && user && !isBuyer()) {
      router.push("/seller")
    }
  }, [hydrated, user, isBuyer, router])

  // Show loading while checking authentication
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  // If user is seller/admin, show message while redirecting
  if (user && !isBuyer()) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            Sellers cannot access the cart. Redirecting to seller dashboard...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Your Cart</h1>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your cart is empty.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {items.map((i) => (
              <div key={i.id} className="flex items-center gap-4 rounded-md border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={i.title}
                  src={i.image || "/placeholder.svg?height=96&width=96&query=product thumbnail"}
                  className="h-16 w-16 rounded-md object-cover bg-muted"
                />
                <div className="flex-1">
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-muted-foreground">${i.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setQty(i.id, Math.max(1, i.quantity - 1))}>
                    -
                  </Button>
                  <div aria-live="polite">{i.quantity}</div>
                  <Button variant="outline" onClick={() => setQty(i.id, i.quantity + 1)}>
                    +
                  </Button>
                </div>
                <Button variant="ghost" onClick={() => remove(i.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <aside className="rounded-md border p-4 h-fit">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <Button className="w-full mt-4" asChild>
              <a href="/checkout">Checkout</a>
            </Button>
          </aside>
        </div>
      )}
    </main>
  )
}
