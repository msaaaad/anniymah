import React from "react";
import Link from "next/link";
import { Product, Paginated, Category } from "@/lib/api-types";
import { BACKEND_URL } from "@/lib/api-server";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { ProductCard } from "@/components/storefront/ProductCard";
import { BagIcon } from "@/components/storefront/Icons";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

async function fetchProducts(queryParams: {
  category?: string;
  search?: string;
  sort?: string;
  page?: string;
}): Promise<Paginated<Product>> {
  const search = new URLSearchParams();
  if (queryParams.category) search.set("category", queryParams.category);
  if (queryParams.search) search.set("search", queryParams.search);
  if (queryParams.sort) search.set("sort", queryParams.sort);
  if (queryParams.page) search.set("page", queryParams.page);
  search.set("limit", "24");

  try {
    const res = await fetch(`${BACKEND_URL}/products?${search.toString()}`, { cache: "no-store" });
    if (!res.ok) return { data: [], total: 0, page: 1, limit: 24, totalPages: 0 };
    return await res.json();
  } catch {
    return { data: [], total: 0, page: 1, limit: 24, totalPages: 0 };
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

export default async function ProductsCatalogPage({ searchParams }: ProductsPageProps) {
  const query = await searchParams;
  const [{ data: products, total }, categories] = await Promise.all([
    fetchProducts(query),
    fetchCategories(),
  ]);

  const activeCategory = query.category || "";
  const activeSort = query.sort || "newest";
  const activeSearch = query.search || "";

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <StoreHeader />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text">
              {activeSearch ? `Search results for "${activeSearch}"` : "All Products"}
            </h1>
            <p className="text-sm text-muted mt-1">
              Showing {products.length} of {total} products
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="sortSelect" className="text-xs font-semibold text-muted shrink-0">
              Sort by:
            </label>
            <form method="GET" action="/products" className="inline-block">
              {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
              {activeSearch && <input type="hidden" name="search" value={activeSearch} />}
              <select
                id="sortSelect"
                name="sort"
                defaultValue={activeSort}
                className="px-3 py-1.5 rounded-xl bg-surface border border-border text-xs text-text font-medium focus:outline-none focus:border-sage"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="oldest">Oldest</option>
              </select>
            </form>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                !activeCategory
                  ? "bg-sage text-white shadow-xs"
                  : "bg-surface border border-border text-muted hover:text-text"
              }`}
            >
              All Categories
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.slug)}`}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-sage text-white shadow-xs"
                    : "bg-surface border border-border text-muted hover:text-text"
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {products.length === 0 ? (
          <div className="py-24 text-center bg-surface border border-border rounded-3xl">
            <div className="w-16 h-16 mx-auto rounded-full bg-sage-tint flex items-center justify-center text-sage mb-4">
              <BagIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-text mb-2">No Products Found</h2>
            <p className="text-sm text-muted max-w-sm mx-auto mb-6">
              We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
            </p>
            <Link
              href="/products"
              className="inline-block px-5 py-2.5 rounded-xl bg-sage text-white text-xs font-semibold hover:bg-sage-dark transition-colors"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}

