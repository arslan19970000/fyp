import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3">
        <div>
          <h3 className="font-semibold mb-2">About</h3>
          <p className="text-sm text-muted-foreground">
            ShopLite brings you modern eCommerce with fast delivery and curated collections.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <ul className="text-sm text-muted-foreground">
            <li>Email: support@shoplite.dev</li>
            <li>Phone: +1-234-567-8901</li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Social</h3>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <Link href="#">Twitter</Link>
            <Link href="#">Instagram</Link>
            <Link href="#">LinkedIn</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} ShopLite. All rights reserved.
      </div>
    </footer>
  )
}
