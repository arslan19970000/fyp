"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/stores/cart-store"
import { useAuth } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const clear = useCart((s) => s.clear)
  const { token } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const session_id = searchParams.get("session_id")
    if (session_id && token) {
      setSessionId(session_id)
      verifySessionAndCreateOrder(session_id, token)
    } else if (session_id && !token) {
      // Wait a bit for token to hydrate
      const timeout = setTimeout(() => {
        if (!token) {
          setError("Please login to complete your order")
          setIsVerifying(false)
        }
      }, 1000)
      return () => clearTimeout(timeout)
    } else {
      // If no session_id, redirect to home
      router.push("/")
    }
  }, [searchParams, token, router])

  const verifySessionAndCreateOrder = async (sessionId: string, authToken: string) => {
    try {
      setIsVerifying(true)
      const response = await fetch("/api/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, token: authToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify payment")
      }

      // Clear the cart after successful order creation
      clear()
      toast.success("Order placed successfully!")
      setIsVerifying(false)
    } catch (err: any) {
      console.error("Verification error:", err)
      setError(err.message || "Failed to verify payment")
      toast.error(err.message || "Failed to verify payment")
      setIsVerifying(false)
    }
  }

  if (!sessionId || isVerifying) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Verifying your payment...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="text-center space-y-6">
          <p className="text-red-600">{error}</p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg">
            Thank you for your order. Your payment has been processed successfully.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Order Confirmation</p>
          <p className="font-mono text-xs break-all">{sessionId}</p>
        </div>

        <div className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to your email address.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/account">View Orders</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
