"use client"

import { useState } from "react"
import useSWR from "swr"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/stores/cart-store"
import { useAuth } from "@/stores/auth-store"
import { Star } from "lucide-react"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, mutate } = useSWR(`/api/products/${id}`, fetcher)
  const add = useCart((s) => s.add)
  const items = useCart((s) => s.items)
  const { user, token, isBuyer } = useAuth()
  const router = useRouter()

  const [rating, setRating] = useState(5)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if product is already in cart
  const isInCart = data ? items.some(item => item.id === data._id) : false

  // Check if user can purchase (only buyers can purchase)
  const canPurchase = !user || isBuyer()

  const handleAddToCart = () => {
    if (isInCart) {
      toast.info("This product is already in your cart!")
      return
    }

    add({
      id: data._id,
      title: data.title,
      price: data.price,
      quantity: 1,
      image: data.images?.[0]
    })
    toast.success(`${data.title} added to cart!`)
  }

  const handleBuyNow = () => {
    // Add product to cart if not already there
    if (!isInCart) {
      add({
        id: data._id,
        title: data.title,
        price: data.price,
        quantity: 1,
        image: data.images?.[0]
      })
    }

    // Redirect to checkout
    router.push("/checkout")
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !token) {
      toast.error("Please login to submit a review")
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch(`${API_URL}/products/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, comment }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to submit review")
      }

      toast.success("Review submitted successfully!")
      setComment("")
      setRating(5)
      mutate() // Refresh product data
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) return <main className="mx-auto max-w-6xl px-4 py-6">Loading...</main>
  if (!data) return <main className="mx-auto max-w-6xl px-4 py-6">Not found</main>

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={data.title}
          src={data.images?.[0] || "/placeholder.svg?height=600&width=600&query=product image"}
          className="w-full rounded-md bg-muted"
        />
        <div>
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          <p className="text-muted-foreground mt-2">{data.description}</p>

          {/* Rating Display */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(data.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {data.rating ? data.rating.toFixed(1) : "0"} ({data.numReviews || 0} reviews)
            </span>
          </div>

          <div className="mt-4 text-xl font-semibold">${data.price.toFixed(2)}</div>

          {/* Show purchase buttons only for buyers or non-logged-in users */}
          {canPurchase ? (
            <div className="mt-4 flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={isInCart}
                className={isInCart ? "bg-gray-400 cursor-not-allowed" : ""}
              >
                {isInCart ? "Already in Cart" : "Add to Cart"}
              </Button>
              <Button variant="outline" onClick={handleBuyNow}>
                Buy Now
              </Button>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Sellers cannot purchase products. Please sign in with a buyer account to shop.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>

        {/* Review Form - Only for buyers */}
        {user && isBuyer() ? (
          <form onSubmit={handleSubmitReview} className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium mb-3">Write a Review</h4>

            {/* Star Rating Selector */}
            <div className="mb-3">
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-3">
              <label htmlFor="comment" className="text-sm font-medium mb-2 block">
                Your Review (Optional)
              </label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="resize-none"
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        ) : user && !isBuyer() ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Only buyers can submit reviews. Sellers cannot review products.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-6 p-4 border rounded-lg bg-muted/30">
            Please login to write a review
          </p>
        )}

        {/* Reviews List */}
        {data.reviews?.length ? (
          <ul className="space-y-4">
            {data.reviews.map((r: any, idx: number) => (
              <li key={idx} className="rounded-lg border p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{r.name}</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < r.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </main>
  )
}
