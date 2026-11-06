"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { apiJson } from "@/lib/api-client";
import { BagIcon, TruckIcon, ShieldCheckIcon, ArrowLeftIcon, CheckIcon } from "./Icons";
import { toast } from "sonner";

export function CheckoutView() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState<"inside_dhaka" | "outside_dhaka">("inside_dhaka");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllFreeDelivery = items.length > 0 && items.every((item) => item.freeDelivery);
  const deliveryCharge = isAllFreeDelivery ? 0 : deliveryZone === "inside_dhaka" ? 60 : 120;
  const grandTotal = subtotal + deliveryCharge;

  async function handleSubmitOrder(event: React.FormEvent) {
    event.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add products before checking out.");
      return;
    }

    const cleanPhone = phone.trim().replace(/[^0-9+]/g, "");
    if (!cleanPhone || cleanPhone.length < 11) {
      toast.error("Please enter a valid 11-digit Bangladeshi phone number (e.g. 01712345678).");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter your full delivery address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        deliveryZone,
        notes: notes.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const order = await apiJson<{ id: string }>("/orders", "POST", payload);
      clearCart();
      toast.success("Order confirmed successfully!");
      router.push(`/order-success/${order.id}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to place order. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-sage-tint flex items-center justify-center text-sage mb-6">
          <BagIcon className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-text mb-3">Your Cart is Empty</h1>
        <p className="text-muted text-sm max-w-md mx-auto mb-8">
          You have no items in your cart to checkout. Browse our collection and add your favorite items.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Explore Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center gap-2 text-xs text-muted mb-6">
        <Link href="/products" className="inline-flex items-center gap-1.5 hover:text-text transition-colors">
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          <span>Back to Shopping</span>
        </Link>
      </div>

      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mb-8">
        Checkout & Delivery
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-text mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-sage-tint text-sage-dark text-sm flex items-center justify-center font-bold">
                1
              </span>
              <span>Delivery Details</span>
            </h2>

            <div className="space-y-5">
              <div>
                <label htmlFor="customerName" className="block text-xs font-semibold text-text mb-1.5">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  required
                  autoComplete="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Tanvir Hossain"
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-sm text-text focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs font-semibold text-text mb-1.5">
                  Mobile Number <span className="text-danger">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  autoCorrect="off"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-sm text-text focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage"
                />
                <p className="text-xs text-muted mt-1.5">
                  We will call this number to confirm order dispatch.
                </p>
              </div>

              <div>
                <label htmlFor="address" className="block text-xs font-semibold text-text mb-1.5">
                  Full Delivery Address <span className="text-danger">*</span>
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House number, road name/number, area, city/district"
                  className="w-full px-4 py-3 rounded-xl bg-bg border border-border text-sm text-text focus:outline-none focus:border-sage focus:ring-1 focus:ring-sage resize-none"
                />
              </div>

              <fieldset className="space-y-3 pt-2">
                <legend className="block text-xs font-semibold text-text mb-2">
                  Select Delivery Zone <span className="text-danger">*</span>
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryZone === "inside_dhaka"
                        ? "border-sage bg-sage-tint/30 shadow-2xs"
                        : "border-border bg-bg hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryZone"
                        value="inside_dhaka"
                        checked={deliveryZone === "inside_dhaka"}
                        onChange={() => setDeliveryZone("inside_dhaka")}
                        className="w-4 h-4 text-sage focus:ring-sage accent-sage"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-text">Inside Dhaka</span>
                        <span className="block text-xs text-muted">24-48 Hours</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-sage-dark">
                      {isAllFreeDelivery ? "FREE" : "৳60"}
                    </span>
                  </label>

                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      deliveryZone === "outside_dhaka"
                        ? "border-sage bg-sage-tint/30 shadow-2xs"
                        : "border-border bg-bg hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryZone"
                        value="outside_dhaka"
                        checked={deliveryZone === "outside_dhaka"}
                        onChange={() => setDeliveryZone("outside_dhaka")}
                        className="w-4 h-4 text-sage focus:ring-sage accent-sage"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-text">Outside Dhaka</span>
                        <span className="block text-xs text-muted">2-4 Days</span>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-sage-dark">
                      {isAllFreeDelivery ? "FREE" : "৳120"}
                    </span>
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor="notes" className="block text-xs font-semibold text-text mb-1.5">
                  Order Notes (Optional)
                </label>
                <input
                  id="notes"
                  name="notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special instructions for the delivery person"
                  className="w-full px-4 py-2.5 rounded-xl bg-bg border border-border text-sm text-text focus:outline-none focus:border-sage"
                />
              </div>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-sage-tint text-sage-dark text-sm flex items-center justify-center font-bold">
                2
              </span>
              <span>Payment Method</span>
            </h2>

            <div className="p-4 rounded-xl border-2 border-sage bg-sage-tint/20 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-sage text-white flex items-center justify-center mt-0.5 shrink-0">
                <CheckIcon className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text">Cash on Delivery (ক্যাশ অন ডেলিভারি)</p>
                <p className="text-xs text-muted">
                  You can inspect your parcel and pay cash directly to the courier delivery agent at your doorstep.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-xs sticky top-28 space-y-6">
            <h2 className="text-lg font-bold text-text pb-4 border-b border-border">
              Order Summary
            </h2>

            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-3 flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-lg bg-rose-tint border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <BagIcon className="w-6 h-6 text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{item.name}</p>
                    <p className="text-xs text-muted">
                      Qty: {item.quantity} × ৳{item.price}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-text shrink-0">
                    ৳{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-4 border-t border-border text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-semibold text-text">৳{subtotal}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery Charge ({deliveryZone === "inside_dhaka" ? "Dhaka" : "Outside Dhaka"})</span>
                <span className="font-semibold text-text">
                  {deliveryCharge === 0 ? "FREE" : `৳${deliveryCharge}`}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex justify-between text-base font-bold text-text">
                <span>Total Due on Delivery</span>
                <span className="text-lg text-sage-dark font-extrabold">৳{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-sage text-white font-bold text-sm hover:bg-sage-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Placing Your Order...</span>
                </>
              ) : (
                <span>Confirm Order (৳{grandTotal})</span>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-3 text-xs text-muted text-center">
              <ShieldCheckIcon className="w-4 h-4 text-sage" />
              <span>Safe & Secure Cash on Delivery</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

