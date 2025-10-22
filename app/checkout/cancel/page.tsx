"use client"

import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function CheckoutCancelPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <XCircle className="w-20 h-20 text-red-600" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Cancelled</h1>
          <p className="text-muted-foreground text-lg">
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-6">
          <p className="text-sm">
            If you experienced any issues during checkout, please try again or contact our support team for assistance.
          </p>
        </div>

        <div className="pt-4 flex gap-3 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/cart">Return to Cart</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
