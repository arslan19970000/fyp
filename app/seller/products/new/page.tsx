"use client"

import { useState, useEffect } from "react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/stores/auth-store"
import { Package, DollarSign, Image, Tag, Box, Sparkles } from "lucide-react"

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

export default function AddProductPage() {
  const router = useRouter()
  const { user, isSeller, isAdmin, token, hydrated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Redirect if not seller or admin
  useEffect(() => {
    if (hydrated && user && !isSeller() && !isAdmin()) {
      router.push("/")
    }
  }, [hydrated, user, isSeller, isAdmin, router])

  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true)

      if (!token) {
        alert("Please sign in to add products")
        router.push("/login")
        return
      }

      // Process images (split by comma)
      const images = data.images
        ? data.images.split(",").map((img) => img.trim()).filter(Boolean)
        : []

      const payload = {
        ...data,
        price: parseFloat(data.price),
        countInStock: parseInt(data.countInStock),
        images,
      }

      console.log("API URL:", API_URL)
      console.log("Payload:", payload)
      console.log("Token:", token ? "Present" : "Missing")

      const res = await fetch(`${API_URL}/seller/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("Response status:", res.status)

      if (!res.ok) {
        const error = await res.json()
        console.error("Server error:", error)
        throw new Error(error.error || "Failed to create product")
      }

      const result = await res.json()
      console.log("Product created:", result)
      alert("Product added successfully!")
      router.push("/seller")
    } catch (error: any) {
      console.error("Create product error:", error)
      console.error("Error details:", error.message, error.stack)
      alert(error.message || "Failed to add product. Check console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    form.setValue("slug", slug)
  }

  // Show loading while hydrating
  if (!hydrated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Add New Product
          </h1>
          <p className="text-gray-600">Create an amazing product listing for your shop</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-100">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Package className="w-6 h-6 text-purple-600" />
              Product Details
            </CardTitle>
            <CardDescription>Fill in the information below to list your product</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Tag className="w-4 h-4 text-purple-500" />
                        Product Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            handleTitleChange(e.target.value)
                          }}
                          placeholder="Amazing Product"
                          className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                        />
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
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Package className="w-4 h-4 text-pink-500" />
                        Slug (URL-friendly name)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="amazing-product" 
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all font-mono text-sm"
                        />
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
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Package className="w-4 h-4 text-blue-500" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Describe your product in detail..."
                          rows={4}
                          className="border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          Price ($)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            placeholder="99.99" 
                            className="border-green-200 focus:border-green-400 focus:ring-green-400 transition-all"
                          />
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
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                          <Box className="w-4 h-4 text-orange-500" />
                          Stock Count
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            placeholder="100" 
                            className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 transition-all"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                          <Tag className="w-4 h-4 text-indigo-500" />
                          Category
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Electronics" 
                            className="border-indigo-200 focus:border-indigo-400 focus:ring-indigo-400 transition-all"
                          />
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
                        <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          Brand (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Brand Name" 
                            className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                          />
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
                      <FormLabel className="flex items-center gap-2 text-gray-700 font-semibold">
                        <Image className="w-4 h-4 text-pink-500" />
                        Image URLs (comma-separated)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                          rows={3}
                          className="border-pink-200 focus:border-pink-400 focus:ring-pink-400 transition-all resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/seller")}
                    className="border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}