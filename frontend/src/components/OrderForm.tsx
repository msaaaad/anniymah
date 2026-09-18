"use client";

import { FormEvent, useState } from "react";

interface OrderFormProps {
  price: number;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

export function OrderForm({ price }: OrderFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const total = price * quantity;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
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
      setState("success");
      form.reset();
      setQuantity(1);
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "কিছু একটা সমস্যা হয়েছে।");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-[10px] border border-border bg-surface p-6 text-center">
        <h3 className="font-heading text-xl font-semibold text-text">ধন্যবাদ!</h3>
        <p className="mt-2 text-muted">
          আপনার অর্ডারটি পেয়েছি। কনফার্ম করার জন্য শীঘ্রই আপনাকে ফোন করা হবে।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} id="order-form" className="rounded-[10px] border border-border bg-surface p-5 sm:p-6">
      <h3 className="font-heading text-xl font-semibold text-text">অর্ডার করুন</h3>

      {/* Honeypot — hidden from real customers, catches naive bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="customerName" className="text-[13px] text-muted">আপনার নাম</label>
          <input
            id="customerName"
            name="customerName"
            required
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-[13px] text-muted">ফোন নাম্বার</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="address" className="text-[13px] text-muted">ঠিকানা</label>
          <input
            id="address"
            name="address"
            required
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quantity" className="text-[13px] text-muted">পরিমাণ</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            max={20}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label htmlFor="notes" className="text-[13px] text-muted">নোট (ঐচ্ছিক)</label>
          <input
            id="notes"
            name="notes"
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-sage-tint p-4">
        <div className="flex items-center justify-between text-sm">
          <span>একক মূল্য</span>
          <span>৳{price}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2 font-semibold">
          <span>মোট</span>
          <span>৳{total}</span>
        </div>
        <div className="mt-3 rounded-lg border border-dashed border-border bg-surface/60 p-3 text-xs text-muted">
          ফ্রি ডেলিভারি · ক্যাশ অন ডেলিভারি
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-rose-dark">{error}</p>}

      <button
        type="submit"
        disabled={state === "submitting"}
        className="mt-5 w-full rounded-[8px] bg-sage px-[26px] py-[13px] font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
      >
        {state === "submitting" ? "সাবমিট হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
      </button>
    </form>
  );
}
