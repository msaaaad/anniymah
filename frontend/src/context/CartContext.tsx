"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  regularPrice?: number;
  imageUrl?: string;
  freeDelivery?: boolean;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = "anniymah_storefront_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {}
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, isHydrated]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addItem = (product: Omit<CartItem, "quantity">, quantity = 1) => {
    const safeQuantity = Math.max(1, quantity);
    setItems((previousItems) => {
      const existingIndex = previousItems.findIndex((item) => item.productId === product.productId);
      if (existingIndex > -1) {
        const updated = [...previousItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + safeQuantity,
        };
        return updated;
      }
      return [...previousItems, { ...product, quantity: safeQuantity }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((previousItems) =>
      previousItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

