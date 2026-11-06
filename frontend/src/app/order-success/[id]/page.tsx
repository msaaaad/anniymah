"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { CheckIcon, TruckIcon, ShieldCheckIcon, BagIcon, ArrowLeftIcon } from "@/components/storefront/Icons";
import { StoreHeader } from "@/components/storefront/StoreHeader";
import { StoreFooter } from "@/components/storefront/StoreFooter";
import { toast } from "sonner";

interface OrderDetail {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  deliveryZone: string;
  deliveryCharge: number;
  total: number;
  status: string;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    apiRequest<OrderDetail>(`/orders/${orderId}`)
      .then((data) => setOrder(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  function handleCopyOrderId() {
    navigator.clipboard.writeText(orderId);
    toast.success("Order ID copied to clipboard!");
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <StoreHeader />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-10 shadow-sm text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-sage-tint flex items-center justify-center text-sage mb-6 animate-in zoom-in-75 duration-300">
            <CheckIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-sage-dark bg-sage-tint px-3 py-1 rounded-full">
            Order Placed Successfully
          </span>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text mt-3 mb-2">
            Thank you for your order!
          </h1>
          <p className="text-sm text-muted max-w-md mx-auto mb-6">
            We have received your order and our representative will call you shortly to confirm before dispatch.
          </p>

          <div className="inline-flex items-center gap-2 p-2.5 px-4 rounded-xl bg-bg border border-border text-xs mb-8">
            <span className="text-muted">Order ID:</span>
            <span className="font-mono font-bold text-text select-all">{orderId}</span>
            <button
              onClick={handleCopyOrderId}
              className="ml-2 text-sage-dark font-semibold hover:underline"
            >
              Copy
            </button>
          </div>

          {order && (
            <div className="border-t border-border pt-6 text-left space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-bg p-4 rounded-2xl border border-border">
                <div>
                  <span className="text-muted block">Recipient Name</span>
                  <span className="font-semibold text-text text-sm">{order.customerName}</span>
                </div>
                <div>
                  <span className="text-muted block">Phone Number</span>
                  <span className="font-semibold text-text text-sm">{order.phone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted block">Delivery Address</span>
                  <span className="font-semibold text-text text-sm">{order.address}</span>
                </div>
                <div>
                  <span className="text-muted block">Delivery Zone</span>
                  <span className="font-semibold text-text text-sm capitalize">
                    {order.deliveryZone ? order.deliveryZone.replace("_", " ") : "Inside Dhaka"}
                  </span>
                </div>
                <div>
                  <span className="text-muted block">Payment Method</span>
                  <span className="font-semibold text-sage-dark text-sm">Cash on Delivery</span>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-text mb-3">Order Items</h3>
                  <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden bg-bg">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-text text-sm">{item.productName}</p>
                          <p className="text-muted">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-text text-sm">
                          ৳{item.unitPrice * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5 pt-2 text-sm">
                <div className="flex justify-between text-muted text-xs">
                  <span>Delivery Charge</span>
                  <span>{order.deliveryCharge === 0 ? "FREE" : `৳${order.deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-text pt-2 border-t border-border">
                  <span>Total Due on Delivery</span>
                  <span className="text-sage-dark">৳{order.total}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sage text-white font-semibold text-sm hover:bg-sage-dark transition-colors shadow-xs"
            >
              <BagIcon className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-bg border border-border text-text font-semibold text-sm hover:bg-rose-tint transition-colors"
            >
              <span>Browse All Products</span>
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}

