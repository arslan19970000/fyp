"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { useCart } from "@/stores/cart-store"
import { useAuth } from "@/stores/auth-store"
import { Star, Check } from "lucide-react"
import { toast } from "sonner"

export type ProductCardProps = {
  id: string
  title: string
  price: number
  image?: string
  rating?: number
  numReviews?: number
}

export function ProductCard({ id, title, price, image, rating = 0, numReviews = 0 }: ProductCardProps) {
  const add = useCart((s) => s.add)
  const items = useCart((s) => s.items)
  const { user, isBuyer } = useAuth()
  const [isAdded, setIsAdded] = useState(false)

  // Check if product is already in cart
  const isInCart = items.some(item => item.id === id)

  // Check if user can purchase (only buyers or non-logged-in users)
  const canPurchase = !user || isBuyer()

  const handleAddToCart = () => {
    // Don't add if already in cart
    if (isInCart) {
      toast.info("This product is already in your cart!")
      return
    }

    add({ id, title, price, quantity: 1, image })
    setIsAdded(true)
    toast.success(`${title} added to cart!`)

    // Reset button after 2 seconds
    setTimeout(() => {
      setIsAdded(false)
    }, 2000)
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/products/${id}`} className="block aspect-square w-full bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt={title}
            src={image || "/placeholder.svg?height=400&width=400&query=product image"}
            className="h-full w-full object-cover rounded-t-md"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <Link href={`/products/${id}`} className="font-medium line-clamp-2">
          {title}
        </Link>
        <div className="mt-2 font-semibold">${price.toFixed(2)}</div>

        {/* Rating Display */}
        {rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : i < rating
                      ? "fill-yellow-200 text-yellow-400"
                      : "fill-gray-200 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">
              ({numReviews})
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        {canPurchase ? (
          <Button
            onClick={handleAddToCart}
            disabled={isInCart && !isAdded}
            className={`w-full transition-colors ${
              isAdded
                ? "bg-green-600 hover:bg-green-700"
                : isInCart
                ? "bg-gray-400 cursor-not-allowed"
                : ""
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Added to Cart!
              </>
            ) : isInCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Already in Cart
              </>
            ) : (
              "Add to Cart"
            )}
          </Button>
        ) : (
          <Link href={`/products/${id}`} className="w-full">
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
 
