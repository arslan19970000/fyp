"use client"

import useSWR from "swr"
import { ProductCard } from "@/components/product-card"

type Product = {
  _id: string
  title: string
  price: number
  images?: string[]
  rating?: number
  numReviews?: number
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ProductGrid({ query = "" }: { query?: string }) {
  const url = query ? `/api/products?${query}` : "/api/products"
  const { data, isLoading } = useSWR<Product[]>(url, fetcher)

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading products...</div>
  }
  if (!data || data.length === 0) {
    return <div className="text-sm text-muted-foreground">No products found.</div>
  }

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {data.map((p) => (
        <ProductCard
          key={p._id}
          id={p._id}
          title={p.title}
          price={p.price}
          image={p.images?.[0]}
          rating={p.rating}
          numReviews={p.numReviews}
        />
      ))}
    </div>
  )
}
