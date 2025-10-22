"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { signupSchema } from "@/lib/validations"
import { toast } from "sonner"
import Link from "next/link"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"buyer" | "seller">("buyer")
  const [shopName, setShopName] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    // Validate input
    const result = signupSchema.safeParse({ name, email, password, role, shopName: shopName || undefined })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message
        }
      })
      setErrors(fieldErrors)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      })

      if (res.ok) {
        toast.success("Account created! Please sign in.")
        router.push("/login")
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || "Signup failed")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-sm px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form onSubmit={signup} className="space-y-3">
        <div>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>
        <div>
          <input
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">I want to:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("buyer")}
              disabled={isLoading}
              className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                role === "buyer"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              }`}
            >
              Buy Products
            </button>
            <button
              type="button"
              onClick={() => setRole("seller")}
              disabled={isLoading}
              className={`rounded-md border px-4 py-3 text-sm font-medium transition-colors ${
                role === "seller"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent"
              }`}
            >
              Sell Products
            </button>
          </div>
          {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
        </div>
        {role === "seller" && (
          <div>
            <input
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Shop Name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              disabled={isLoading}
              aria-invalid={!!errors.shopName}
            />
            {errors.shopName && <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>}
          </div>
        )}
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-3">
        Already have an account?{" "}
        <Link className="underline" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  )
}
