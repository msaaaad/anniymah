"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon, BagIcon, ArrowRightIcon } from "./Icons";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, subtotal, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isCartOpen) {
        closeCart();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen, closeCart]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <BagIcon className="w-5 h-5 text-sage" />
            <h2 className="text-lg font-semibold text-text">Your Cart</h2>
            <span className="text-xs bg-sage-tint text-sage-dark font-medium px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="p-2 text-muted hover:text-text rounded-full hover:bg-rose-tint transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/60">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-16 h-16 rounded-full bg-sage-tint flex items-center justify-center text-sage mb-4">
                <BagIcon className="w-8 h-8" />
              </div>
              <p className="text-base font-medium text-text mb-1">Your cart is empty</p>
              <p className="text-sm text-muted mb-6">Explore our exclusive collections and find something you love.</p>
              <button
                onClick={closeCart}
                className="px-5 py-2.5 rounded-lg bg-sage text-white text-sm font-medium hover:bg-sage-dark transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="py-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-lg bg-rose-tint overflow-hidden shrink-0 border border-border flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <BagIcon className="w-8 h-8 text-muted" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-text truncate">{item.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-sage-dark">৳{item.price}</span>
                    {item.regularPrice && item.regularPrice > item.price && (
                      <span className="text-xs text-muted line-through">৳{item.regularPrice}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-border rounded-md bg-surface">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="p-1.5 text-muted hover:text-text hover:bg-rose-tint rounded-l transition-colors"
                      >
                        <MinusIcon className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-text">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="p-1.5 text-muted hover:text-text hover:bg-rose-tint rounded-r transition-colors"
                      >
                        <PlusIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                      className="p-1.5 text-muted hover:text-danger transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border px-6 py-5 bg-surface space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-text">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>Delivery Charge</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/70 flex justify-between text-base font-bold text-text">
              <span>Total</span>
              <span className="text-sage-dark">৳{subtotal}</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark shadow-sm transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRightIcon className="w-4 h-4" />
            </Link>

            <button
              onClick={closeCart}
              className="w-full text-center text-xs font-medium text-muted hover:text-text transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

