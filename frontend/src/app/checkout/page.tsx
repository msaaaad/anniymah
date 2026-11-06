import React from "react";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { CheckoutView } from "@/components/storefront/CheckoutView";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <StoreHeader />
      <main className="flex-1">
        <CheckoutView />
      </main>
      <StoreFooter />
    </div>
  );
}

