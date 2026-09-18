"use client";

import { FormEvent, useState } from "react";

interface OrderFormProps {
  landingPageId: string;
  price: number;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function OrderForm({ landingPageId, price }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  const total = price * quantity;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      landingPageId,
      customerName: formData.get("customerName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      quantity,
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
      setMessage("অর্ডার কনফার্ম হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।");
      setState("success");
      form.reset();
      setQuantity(1);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে।");
      setState("error");
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
              <input id="phone" name="phone" type="tel" placeholder="01XXXXXXXXX" required />
            </div>
            <div className="field full">
              <label htmlFor="address">Delivery address</label>
              <input id="address" name="address" placeholder="বাসা, রোড, এলাকা — শহর" required />
            </div>
            <div className="field">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              />
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
            <span style={{ color: "var(--sage-dark)", fontWeight: 600 }}>Free</span>
          </div>
          <div className="row total">
            <span>Total</span>
            <span><span className="tk">৳</span>{total}</span>
          </div>
          <div className="wa-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4m5 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <span>ডেলিভারি সম্পূর্ণ ফ্রি — Confirm করলেই আপনার অর্ডার আমাদের কাছে পৌঁছে যাবে।</span>
          </div>

          {(state === "success" || state === "error") && (
            <div className={`order-status show ${state === "success" ? "success" : "error"}`}>
              {state === "success" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16h.01" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
