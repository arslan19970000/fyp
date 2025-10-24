"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  countInStock: z.string().min(1, "Stock count is required"),
  images: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ unwrap Next.js 15 async params
  const { id } = React.use(params)

  const router = useRouter()
  const { user, isSeller, isAdmin, token } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      price: "",
      category: "",
      brand: "",
      countInStock: "",
      images: "",
    },
  })

  // ✅ redirect safely in useEffect
  useEffect(() => {
    if (user && !isSeller() && !isAdmin()) {
      router.push("/")
    }
  }, [user, isSeller, isAdmin, router])

  // ✅ Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`)
        if (!res.ok) throw new Error("Product not found")

        const product = await res.json()

        form.reset({
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price.toString(),
          category: product.category,
          brand: product.brand || "",
          countInStock: product.countInStock.toString(),
          images: product.images?.join(", ") || "",
        })
      } catch (error) {
        console.error("Load product error:", error)
        alert("Failed to load product")
        router.push("/seller")
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, form, router])

  // ✅ Handle form submit
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true)

      if (!token) {
        alert("Please sign in to edit products")
        router.push("/login")
        return
      }

      const images = data.images
        ? data.images.split(",").map((img) => img.trim()).filter(Boolean)
        : []

      const payload = {
        ...data,
        price: parseFloat(data.price),
        countInStock: parseInt(data.countInStock),
        images,
      }

      const res = await fetch(`${API_URL}/seller/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update product")
      }

      alert("Product updated successfully!")
      router.push("/seller")
    } catch (error: any) {
      console.error("Update product error:", error)
      alert(error.message || "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ✅ Loading state
  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p>Loading product...</p>
      </main>
    )
  }

  // ✅ Render form
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
          <CardDescription>Update your product details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Amazing Product" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug (URL-friendly name)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="amazing-product" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Describe your product..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" placeholder="99.99" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="countInStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Count</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Electronics" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Brand Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URLs (comma-separated)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/seller")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  )
}
