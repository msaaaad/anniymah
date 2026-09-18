"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { LandingPage } from "@/lib/types";
import { LandingPageForm, type LandingPageFormValues } from "@/components/LandingPageForm";

export default function EditLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/landing-pages/${id}`).then(async (res) => {
      if (!res.ok) {
        setNotFound(true);
        return;
      }
      setPage(await res.json());
    });
  }, [id]);

  async function handleSubmit(values: LandingPageFormValues): Promise<string | void> {
    const res = await fetch(`/api/landing-pages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return body.error || "Save failed";
    }
    setPage(await res.json());
  }

  async function handleDelete() {
    if (!page) return;
    if (!confirm(`Delete "${page.title || "this page"}"? This cannot be undone.`)) return;
    await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
    router.push("/admin/pages");
  }

  if (notFound) {
    return <p className="text-muted">Page not found.</p>;
  }
  if (!page) {
    return <p className="text-muted">Loading...</p>;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Edit Landing Page</h1>
      <p className="mt-1 text-sm text-muted">Edit the content shown at /p/{page.slug}.</p>
      <div className="mt-6">
        <LandingPageForm
          initial={{
            slug: page.slug,
            title: page.title,
            description: page.description,
            price: page.price,
            regularPrice: page.regularPrice,
            phone: page.phone,
            imageUrl: page.imageUrl,
            collectionEnabled: page.collectionEnabled,
            collectionTitle: page.collectionTitle,
            collectionItems: page.collectionItems,
            featuresEnabled: page.featuresEnabled,
            featuresTitle: page.featuresTitle,
            featuresSubtitle: page.featuresSubtitle,
            features: page.features,
            shippingBarEnabled: page.shippingBarEnabled,
            shippingBarItems: page.shippingBarItems,
            freeDelivery: page.freeDelivery,
            deliveryChargeInsideDhaka: page.deliveryChargeInsideDhaka,
            deliveryChargeOutsideDhaka: page.deliveryChargeOutsideDhaka,
          }}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
          headerActions={
            <div className="flex gap-2">
              <a
                href={`/p/${page.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-[8px] border border-border px-4 py-2 text-sm hover:border-sage-dark hover:text-sage-dark"
              >
                View live
              </a>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-[8px] border border-border px-4 py-2 text-sm text-muted hover:border-rose-dark hover:text-rose-dark"
              >
                Delete page
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}
