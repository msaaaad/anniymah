"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/api-types";
import { useCart } from "@/context/CartContext";
import { BagIcon, MinusIcon, PlusIcon, TruckIcon, ShieldCheckIcon, ArrowRightIcon } from "./Icons";

export function ProductDetailView({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const images = product.images ?? [];
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url;

  const hasDiscount = product.regularPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
    : 0;

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        regularPrice: product.regularPrice,
        imageUrl: currentImage,
        freeDelivery: product.freeDelivery,
      },
      quantity,
    );
  }

  function handleBuyNow() {
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        regularPrice: product.regularPrice,
        imageUrl: currentImage,
        freeDelivery: product.freeDelivery,
      },
      quantity,
    );
    router.push("/checkout");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <nav className="flex items-center gap-2 text-xs text-muted mb-8">
        <Link href="/" className="hover:text-text transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-text transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-text font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-4">
          <div className="aspect-square bg-rose-tint rounded-2xl overflow-hidden border border-border flex items-center justify-center relative shadow-sm">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <BagIcon className="w-20 h-20 text-muted" />
            )}

            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-danger text-white text-sm font-bold px-3 py-1 rounded-lg shadow-xs">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx ? "border-sage shadow-xs" : "border-border opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.category?.name && (
            <span className="inline-block px-3 py-1 bg-sage-tint text-sage-dark text-xs font-semibold rounded-full">
              {product.category.name}
            </span>
          )}

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-extrabold text-text">৳{product.price}</span>
            {hasDiscount && (
              <span className="text-lg text-muted line-through">৳{product.regularPrice}</span>
            )}
            {product.freeDelivery && (
              <span className="text-xs font-semibold text-sage-dark bg-sage-tint px-2.5 py-1 rounded-md border border-sage/20">
                Free Delivery Eligible
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border space-y-2 text-xs text-muted">
            <div className="flex items-center gap-2 font-medium text-text">
              <TruckIcon className="w-4 h-4 text-sage" />
              <span>Delivery Options (Cash on Delivery)</span>
            </div>
            <p>
              • Inside Dhaka: {product.freeDelivery ? "Free" : `৳${product.deliveryChargeInsideDhaka || 60}`} (24-48 Hours)
            </p>
            <p>
              • Outside Dhaka: {product.freeDelivery ? "Free" : `৳${product.deliveryChargeOutsideDhaka || 120}`} (2-4 Days)
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Quantity
            </label>
            <div className="flex items-center border border-border rounded-xl bg-surface w-fit">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="p-3 text-muted hover:text-text hover:bg-rose-tint rounded-l-xl transition-colors"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="px-6 text-sm font-bold text-text">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="p-3 text-muted hover:text-text hover:bg-rose-tint rounded-r-xl transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border-2 border-sage text-sage font-bold text-sm hover:bg-sage hover:text-white transition-all shadow-xs"
            >
              <BagIcon className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sage text-white font-bold text-sm hover:bg-sage-dark transition-all shadow-sm"
            >
              <span>Order Now (Cash on Delivery)</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {product.description && (
            <div className="pt-6 border-t border-border">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted mb-3">
                Product Details
              </h2>
              <div className="prose prose-sm text-text/80 whitespace-pre-line leading-relaxed">
                {product.description}
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center gap-4 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-sage" />
              <span>100% Genuine Guaranteed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TruckIcon className="w-4 h-4 text-sage" />
              <span>Safe Doorstep Delivery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

