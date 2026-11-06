import React from "react";
import Link from "next/link";
import { Product, Category } from "@/lib/api-types";
import { BACKEND_URL } from "@/lib/api-server";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { TruckIcon, ShieldCheckIcon, PhoneIcon, ArrowRightIcon } from "@/components/storefront/Icons";

export const dynamic = "force-dynamic";

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/products?limit=12&sort=newest`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchFeaturedProducts(),
    fetchCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <StoreHeader />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-rose-tint border-b border-border py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl space-y-6">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-sage-tint text-sage-dark text-xs font-bold tracking-wider uppercase">
                Premium Collection
              </span>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-text leading-tight">
                Authentic Fragrances & Timeless Luxury
              </h1>
              <p className="text-base sm:text-lg text-muted leading-relaxed">
                Experience crafted scents designed to leave a lasting impression. Enjoy fast, reliable cash on delivery all over Bangladesh.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sage text-white font-bold text-sm hover:bg-sage-dark transition-all shadow-sm"
                >
                  <span>Explore Collection</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  href="/#featured"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-surface border border-border text-text font-bold text-sm hover:bg-rose-tint transition-all"
                >
                  <span>Featured Items</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg border border-border">
                <div className="w-12 h-12 rounded-xl bg-sage-tint text-sage-dark flex items-center justify-center shrink-0">
                  <TruckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">Cash on Delivery</h3>
                  <p className="text-xs text-muted">Doorstep delivery across all districts</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg border border-border">
                <div className="w-12 h-12 rounded-xl bg-sage-tint text-sage-dark flex items-center justify-center shrink-0">
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">100% Genuine</h3>
                  <p className="text-xs text-muted">Authentic products guaranteed</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-bg border border-border">
                <div className="w-12 h-12 rounded-xl bg-sage-tint text-sage-dark flex items-center justify-center shrink-0">
                  <PhoneIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">Order Confirmation</h3>
                  <p className="text-xs text-muted">Quick call verification before dispatch</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section className="py-12 border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-bold text-text">Shop by Category</h2>
                <Link href="/products" className="text-xs font-bold text-sage-dark hover:underline">
                  View All
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeURIComponent(cat.slug)}`}
                    className="p-4 rounded-xl bg-surface border border-border text-center hover:border-sage hover:bg-sage-tint/20 transition-all group"
                  >
                    <span className="block text-sm font-bold text-text group-hover:text-sage truncate">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="featured" className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sage-dark">
                  Handpicked
                </span>
                <h2 className="font-heading text-3xl font-bold text-text mt-1">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-sage-dark hover:text-sage"
              >
                <span>See All Products</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            {products.length === 0 ? (
              <div className="py-16 text-center bg-surface border border-border rounded-2xl">
                <p className="text-sm text-muted">Products are currently being loaded into the catalog.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="mt-12 text-center sm:hidden">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sage text-white font-bold text-sm hover:bg-sage-dark"
              >
                <span>View All Products</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
