"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isValidBangladeshiPhone } from "@/lib/phone";
import type { DeliveryZone } from "@/lib/types";

interface OrderFormProps {
  landingPageId: string;
  slug: string;
  price: number;
  freeDelivery: boolean;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
}

type SubmitState = "idle" | "submitting" | "error";

export function OrderForm({
  landingPageId,
  slug,
  price,
  freeDelivery,
  deliveryChargeInsideDhaka,
  deliveryChargeOutsideDhaka,
}: OrderFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>("inside_dhaka");
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const deliveryCharge = freeDelivery
    ? 0
    : deliveryZone === "inside_dhaka"
      ? deliveryChargeInsideDhaka
      : deliveryChargeOutsideDhaka;
  const total = price * quantity + deliveryCharge;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get("phone") ?? "");

    if (!isValidBangladeshiPhone(phone)) {
      setPhoneError("সঠিক বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712345678)");
      return;
    }
    setPhoneError("");
    setState("submitting");

    const payload = {
      landingPageId,
      customerName: formData.get("customerName"),
      phone,
      address: formData.get("address"),
      quantity,
      deliveryZone: freeDelivery ? null : deliveryZone,
      notes: formData.get("notes"),
      company: formData.get("company"), // honeypot
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "অর্ডার সাবমিট করা যায়নি, আবার চেষ্টা করুন।");
      }
      const params = new URLSearchParams({
        name: String(payload.customerName ?? ""),
        total: String(total),
      });
      router.push(`/p/${slug}/thank-you?${params.toString()}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে।";
      setMessage(errorMessage);
      setState("error");
      toast.error(errorMessage);
    }
  }

  return (
    <div className="order-section" id="order">
      <div className="order-grid">
        <form id="order-form" onSubmit={handleSubmit}>
          {/* Honeypot — hidden from real customers, catches naive bots */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
            aria-hidden="true"
          />

          <div className="form-grid">
            <div className="field">
              <label htmlFor="customerName">Full name</label>
              <input id="customerName" name="customerName" placeholder="আপনার নাম" required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                onChange={() => phoneError && setPhoneError("")}
                required
              />
              {phoneError && (
                <p style={{ marginTop: 6, fontSize: 12.5, color: "var(--rose-dark)" }}>{phoneError}</p>
              )}
            </div>
            <div className="field full">
              <label htmlFor="address">Delivery address</label>
              <input id="address" name="address" placeholder="বাসা, রোড, এলাকা — শহর" required />
            </div>
            {!freeDelivery && (
              <div className="field full">
                <label>Delivery area</label>
                <div className="delivery-options">
                  <label className={`delivery-option${deliveryZone === "inside_dhaka" ? " active" : ""}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="radio"
                        name="deliveryZoneChoice"
                        checked={deliveryZone === "inside_dhaka"}
                        onChange={() => setDeliveryZone("inside_dhaka")}
                      />
                      ঢাকার ভিতরে
                    </span>
                    <span className="charge">৳{deliveryChargeInsideDhaka}</span>
                  </label>
                  <label className={`delivery-option${deliveryZone === "outside_dhaka" ? " active" : ""}`}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input
                        type="radio"
                        name="deliveryZoneChoice"
                        checked={deliveryZone === "outside_dhaka"}
                        onChange={() => setDeliveryZone("outside_dhaka")}
                      />
                      ঢাকার বাইরে
                    </span>
                    <span className="charge">৳{deliveryChargeOutsideDhaka}</span>
                  </label>
                </div>
              </div>
            )}
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <div className="qty-stepper">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input id="quantity" type="text" inputMode="numeric" readOnly value={quantity} aria-live="polite" />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                  disabled={quantity >= 20}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="notes">Notes (optional)</label>
              <input id="notes" name="notes" placeholder="ল্যান্ডমার্ক, ডেলিভারির সময়, ইত্যাদি" />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={state === "submitting"}>
            {state === "submitting" ? "Sending..." : "Confirm Order"}
          </button>
        </form>

        <div className="order-summary">
          <h4>Order summary</h4>
          <div className="row">
            <span>Quantity</span>
            <span>{quantity}</span>
          </div>
          <div className="row">
            <span>Unit price</span>
            <span><span className="tk">৳</span>{price}</span>
          </div>
          <div className="row">
            <span>Delivery</span>
            {freeDelivery ? (
              <span style={{ color: "var(--sage-dark)", fontWeight: 600 }}>Free</span>
            ) : (
              <span><span className="tk">৳</span>{deliveryCharge}</span>
            )}
          </div>
          <div className="row total">
            <span>Total</span>
            <span><span className="tk">৳</span>{total}</span>
          </div>
          <div className="wa-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4m5 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <span>
              {freeDelivery && "ডেলিভারি সম্পূর্ণ ফ্রি — "}
              Confirm করলেই আপনার অর্ডার আমাদের কাছে পৌঁছে যাবে।
            </span>
          </div>

          {state === "error" && (
            <div className="order-status show error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v5M12 16h.01" />
              </svg>
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
