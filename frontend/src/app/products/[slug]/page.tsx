import React from "react";
import { notFound } from "next/navigation";
import { Product } from "@/lib/api-types";
import { BACKEND_URL } from "@/lib/api-server";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { ProductDetailView } from "@/components/storefront/ProductDetailView";

export const dynamic = "force-dynamic";

async function fetchProductBySlug(slug: string): Promise<Product | null> {
  try {
    const response = await fetch(`${BACKEND_URL}/products/${encodeURIComponent(slug)}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as Product;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <StoreHeader />
      <main className="flex-1">
        <ProductDetailView product={product} />
      </main>
      <StoreFooter />
    </div>
  );
}

