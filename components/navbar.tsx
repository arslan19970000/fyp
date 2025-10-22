"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, User, Search, Moon, Sun, LogOut, Plus } from "lucide-react"
import { useCart } from "@/stores/cart-store"
import { useAuth } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import { toast } from "sonner"

export function Navbar() {
  const items = useCart((s) => s.items)
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
  const { user, isAuthenticated, logout, isBuyer } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [q, setQ] = useState("")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark)

    if (shouldBeDark) {
      document.documentElement.classList.add("dark")
      setDark(true)
    } else {
      document.documentElement.classList.remove("dark")
      setDark(false)
    }
  }, [])

  const toggleDark = () => {
    const root = document.documentElement
    const newDarkState = !dark

    if (newDarkState) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
    setDark(newDarkState)
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/products?q=${encodeURIComponent(q)}`)
  }

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="font-semibold text-xl">
          ShopLite
        </Link>
        <form onSubmit={onSearch} className="hidden md:flex items-center gap-2 flex-1 max-w-xl">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="flex-1"
            aria-label="Search products"
          />
          <Button type="submit" variant="default">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" onClick={toggleDark} aria-label="Toggle dark mode">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/products" className="hidden md:inline text-sm">
            Browse
          </Link>
          {(user?.role === "seller" || user?.role === "admin") && (
            <Link href="/seller/products/new">
              <Button variant="default" size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Add Product</span>
              </Button>
            </Link>
          )}
          {/* Show cart only for buyers or non-logged-in users */}
          {(!user || isBuyer()) && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Cart</span>
                {totalQty > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1">
                    {totalQty}
                  </span>
                )}
              </Button>
            </Link>
          )}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="text-sm">
                    <div className="font-semibold">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account">My Orders</Link>
                </DropdownMenuItem>
                {(user?.role === "seller" || user?.role === "admin") && (
                  <DropdownMenuItem asChild>
                    <Link href="/seller">Seller Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {user?.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant={pathname?.startsWith("/login") ? "default" : "ghost"}>
                <User className="h-5 w-5" />
                <span className="sr-only">Sign in</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
