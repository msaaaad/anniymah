import React from "react";
import Link from "next/link";
import { TruckIcon, ShieldCheckIcon, PhoneIcon } from "./Icons";

export function StoreFooter() {
  return (
    <footer className="bg-surface border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-4">
            <span className="font-heading text-2xl font-bold text-text">Anniymah</span>
            <p className="text-sm text-muted max-w-sm">
              Discover authentic, premium fragrances and curated lifestyle products crafted for distinction. Enjoy reliable cash on delivery across Bangladesh.
            </p>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <TruckIcon className="w-4 h-4 text-sage" /> Fast Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-sage" /> 100% Authentic
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-text transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-text transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-text transition-colors">
                  Cart & Checkout
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Customer Support</h3>
            <div className="space-y-3 text-sm text-muted">
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-sage" />
                <span>+880 1700-000000</span>
              </p>
              <p>Delivery: Inside Dhaka 24-48 hours, Outside Dhaka 2-4 days.</p>
              <p>Payment: Cash on Delivery (COD)</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} Anniymah. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

