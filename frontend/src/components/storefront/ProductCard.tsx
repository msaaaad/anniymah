"use client";

import React from "react";
import Link from "next/link";
import { Product } from "@/lib/api-types";
import { useCart } from "@/context/CartContext";
import { BagIcon, CheckIcon } from "./Icons";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const primaryImage = product.images?.[0]?.url;
  const hasDiscount = product.regularPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0;

  function handleAddToCart(event: React.MouseEvent) {
    event.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      regularPrice: product.regularPrice,
      imageUrl: primaryImage,
      freeDelivery: product.freeDelivery,
    });
  }

  return (
    <div className="group relative flex flex-col bg-surface border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-rose-tint overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted">
            <BagIcon className="w-12 h-12" />
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-danger text-white text-xs font-bold px-2 py-1 rounded-md shadow-xs">
            -{discountPercent}%
          </span>
        )}

        {product.freeDelivery && (
          <span className="absolute top-3 right-3 bg-sage-tint text-sage-dark text-xs font-semibold px-2 py-0.5 rounded-md border border-sage/20">
            Free Delivery
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-5">
        {product.category?.name && (
          <p className="text-xs uppercase tracking-wider text-muted font-medium mb-1.5">
            {product.category.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`} className="block mb-2">
          <h3 className="text-base font-semibold text-text group-hover:text-sage transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-xs text-muted line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/70 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-text">৳{product.price}</span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">৳{product.regularPrice}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sage-tint text-sage-dark text-xs font-semibold hover:bg-sage hover:text-white transition-all shadow-2xs"
          >
            <BagIcon className="w-3.5 h-3.5" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

