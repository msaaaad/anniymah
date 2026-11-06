"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { CartIcon, SearchIcon, CloseIcon } from "./Icons";

export function StoreHeader() {
  const { itemCount, toggleCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-text group-hover:text-sage transition-colors">
                Anniymah
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/products"
                className="text-sm font-medium text-muted hover:text-text transition-colors"
              >
                All Products
              </Link>
              <Link
                href="/#featured"
                className="text-sm font-medium text-muted hover:text-text transition-colors"
              >
                Featured
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-48 sm:w-64 py-1.5 pl-3 pr-8 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-muted focus:outline-none focus:border-sage"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                  className="absolute right-2 text-muted hover:text-text"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search products"
                className="p-2 text-muted hover:text-text rounded-full hover:bg-rose-tint transition-colors"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={toggleCart}
              aria-label="Shopping Cart"
              className="relative p-2 text-muted hover:text-text rounded-full hover:bg-rose-tint transition-colors"
            >
              <CartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-sage text-white text-xs font-bold rounded-full flex items-center justify-center shadow-xs">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

