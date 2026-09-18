"use client";

import { useRouter } from "next/navigation";
import { LandingPageForm, type LandingPageFormValues } from "@/components/LandingPageForm";

const EMPTY: LandingPageFormValues = {
  slug: "",
  title: "",
  description: "",
  price: 999,
  phone: "",
  imageUrl: "",
  collectionEnabled: false,
  collectionTitle: "",
  collectionItems: [],
  featuresEnabled: false,
  featuresTitle: "",
  featuresSubtitle: "",
  features: [],
  shippingBarEnabled: false,
  shippingBarText: "",
  freeDelivery: true,
  deliveryChargeInsideDhaka: 0,
  deliveryChargeOutsideDhaka: 0,
};

export default function NewLandingPage() {
  const router = useRouter();

  async function handleSubmit(values: LandingPageFormValues): Promise<string | void> {
    const res = await fetch("/api/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return body.error || "Failed to create page";
    }
    const created = await res.json();
    router.push(`/admin/pages/${created.id}/edit`);
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">New Landing Page</h1>
      <p className="mt-1 text-sm text-muted">Set up a new offer page with its own URL.</p>
      <div className="mt-6">
        <LandingPageForm initial={EMPTY} submitLabel="Create page" onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
