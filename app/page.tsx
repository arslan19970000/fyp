import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductGrid } from "@/components/product-grid"
import { Sparkles, ShoppingBag, Zap, Shield, TrendingUp, Star } from "lucide-react"

const categories = [
  { name: "Electronic", icon: "💻", gradient: "from-blue-500 to-purple-500" },
  { name: "Fashion", icon: "👔", gradient: "from-pink-500 to-rose-500" },
  { name: "Beauty", icon: "💄", gradient: "from-purple-500 to-pink-500" },
  { name: "Home", icon: "🏠", gradient: "from-green-500 to-emerald-500" },
  { name: "Sports", icon: "⚽", gradient: "from-orange-500 to-red-500" },
  { name: "Toys", icon: "🎮", gradient: "from-yellow-500 to-orange-500" },
]

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section with Animated Gradient */}
      <section className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            {/* Left Content */}
            <div className="space-y-8 fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>New Arrivals Every Day</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Shop <span className="inline-block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">Smarter</span>
                <br />
                Live <span className="inline-block bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Better</span>
              </h1>

              <p className="text-xl text-white/90 leading-relaxed">
                Discover curated collections from trusted sellers. Fast delivery, great prices, and products you'll love.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 hover-lift shadow-2xl">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Start Shopping
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white backdrop-blur">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Become a Seller
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10K+-</div>
                  <div className="text-sm text-white/80">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">5K+-</div>
                  <div className="text-sm text-white/80">Sellers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">50K+-</div>
                  <div className="text-sm text-white/80">Happy Customers</div>
                </div>
              </div>
            </div>

            {/* Right Content - Floating Cards */}
            <div className="relative h-[500px] hidden md:block">
              <div className="absolute top-10 right-10 w-64 h-32 glass rounded-2xl p-6 float shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Secure Checkout</div>
                    <div className="text-white/70 text-sm">100% Protected</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 right-20 w-64 h-32 glass rounded-2xl p-6 float animation-delay-2000 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Fast Delivery</div>
                    <div className="text-white/70 text-sm">2-Day Shipping</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-40 left-10 w-56 h-28 glass rounded-2xl p-5 float animation-delay-4000 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Top Rated</div>
                    <div className="text-white/70 text-xs">4.8 / 5.0 Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-background"/>
          </svg>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center fade-in-up">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              href={`/products?category=${encodeURIComponent(category.name)}`}
              className="group relative overflow-hidden rounded-2xl p-6 text-center hover-lift card-shine bg-gradient-to-br shadow-lg transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
              <div className="relative z-10">
                <div className="text-4xl mb-2">{category.icon}</div>
                <div className="text-white font-semibold">{category.name}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center fade-in-up">Featured Products</h2>
        <ProductGrid query="featured=true" />
      </section>

      {/* Testimonials & Newsletter */}
      <section className="mx-auto max-w-6xl px-4 py-16 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border p-8 hover-lift card-shine bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <h3 className="font-bold text-xl mb-3">What customers say</h3>
          <p className="text-muted-foreground italic">"Amazing selection and fast shipping. My go-to shop for gifts. The quality is outstanding!"</p>
          <p className="text-sm mt-4 font-semibold">— Alex R.</p>
        </div>
        <div className="rounded-2xl border p-8 hover-lift card-shine bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
          <Sparkles className="h-8 w-8 text-blue-500 mb-4" />
          <h3 className="font-bold text-xl mb-3">Join our newsletter</h3>
          <p className="text-muted-foreground mb-4">Be the first to know about new drops and exclusive offers.</p>
          <form className="flex gap-2">
            <input
              className="flex-1 rounded-lg border bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 transition"
              placeholder="you@example.com"
              aria-label="Email address"
            />
            <Button type="button" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </main>
  )
}
