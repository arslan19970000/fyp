import { ProductGrid } from "@/components/product-grid"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const query = new URLSearchParams()
  if (params.q) query.set("q", String(params.q))
  if (params.category) query.set("category", String(params.category))
  if (params.min) query.set("min", String(params.min))
  if (params.max) query.set("max", String(params.max))

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="text-xl font-semibold mb-4">Products</h1>
      <ProductGrid query={query.toString()} />
    </main>
  )
}
