"use client";

import { FormEvent, ReactNode, useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import {
  MAX_COLLECTION_ITEMS,
  MAX_FEATURES,
  type CollectionItem,
  type FeatureItem,
} from "@/lib/types";

export interface LandingPageFormValues {
  slug: string;
  title: string;
  description: string;
  price: number;
  phone: string;
  imageUrl: string;
  collectionEnabled: boolean;
  collectionTitle: string;
  collectionItems: CollectionItem[];
  featuresEnabled: boolean;
  featuresTitle: string;
  featuresSubtitle: string;
  features: FeatureItem[];
  shippingBarEnabled: boolean;
  shippingBarText: string;
  freeDelivery: boolean;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
}

interface LandingPageFormProps {
  initial: LandingPageFormValues;
  submitLabel: string;
  onSubmit: (values: LandingPageFormValues) => Promise<string | void>;
  headerActions?: ReactNode;
}

type SaveState = "idle" | "saving" | "saved" | "error";

function padTo<T>(items: T[], length: number, empty: T): T[] {
  const padded = items.slice(0, length);
  while (padded.length < length) padded.push(empty);
  return padded;
}

const inputClass =
  "rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none";
const labelClass = "text-[13px] text-muted";

export function LandingPageForm({ initial, submitLabel, onSubmit, headerActions }: LandingPageFormProps) {
  const [values, setValues] = useState<LandingPageFormValues>({
    ...initial,
    collectionItems: padTo(initial.collectionItems, MAX_COLLECTION_ITEMS, {
      name: "",
      description: "",
      imageUrl: "",
    }),
    features: padTo(initial.features, MAX_FEATURES, { title: "", description: "" }),
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  function update<K extends keyof LandingPageFormValues>(key: K, value: LandingPageFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateCollectionItem(index: number, patch: Partial<CollectionItem>) {
    setValues((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateFeature(index: number, patch: Partial<FeatureItem>) {
    setValues((prev) => ({
      ...prev,
      features: prev.features.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState("saving");
    setError("");

    const errorMessage = await onSubmit(values);
    if (errorMessage) {
      setError(errorMessage);
      setSaveState("error");
      return;
    }
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {headerActions && (
        <div className="flex flex-wrap items-center justify-end gap-2">{headerActions}</div>
      )}

      <section className="mt-2 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Page URL</h2>
        <div className="mt-4 flex flex-col gap-1.5">
          <label className={labelClass}>Slug — lowercase letters, numbers, hyphens only</label>
          <div className="flex items-center gap-1 text-sm text-muted">
            <span>/p/</span>
            <input
              value={values.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase())}
              placeholder="combo-offer"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              className={`flex-1 ${inputClass} text-text`}
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Main offer (always shown)</h2>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className={labelClass}>Title</label>
          <input
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className={labelClass}>Description</label>
          <textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Price (৳)</label>
            <input
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className={labelClass}>Contact phone</label>
            <input
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4">
          <ImageUploader
            label="Product image"
            value={values.imageUrl}
            onChange={(url) => update("imageUrl", url)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Delivery</h2>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.freeDelivery}
            onChange={(e) => update("freeDelivery", e.target.checked)}
          />
          Free delivery
        </label>

        {!values.freeDelivery && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Charge — Inside Dhaka (৳)</label>
              <input
                type="number"
                min={0}
                value={values.deliveryChargeInsideDhaka}
                onChange={(e) => update("deliveryChargeInsideDhaka", Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass}>Charge — Outside Dhaka (৳)</label>
              <input
                type="number"
                min={0}
                value={values.deliveryChargeOutsideDhaka}
                onChange={(e) => update("deliveryChargeOutsideDhaka", Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>
        )}
      </section>

      {/* ---------- Optional section: Product Collection ---------- */}
      <section className="mt-6 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">Product Collection</h2>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.collectionEnabled}
              onChange={(e) => update("collectionEnabled", e.target.checked)}
            />
            Enabled
          </label>
        </div>
        <p className="mt-1 text-sm text-muted">
          A photo card per item — e.g. each perfume in the combo.
        </p>

        {values.collectionEnabled && (
          <>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className={labelClass}>Section title</label>
              <input
                value={values.collectionTitle}
                onChange={(e) => update("collectionTitle", e.target.value)}
                placeholder="কম্বোতে যা থাকছে"
                className={inputClass}
              />
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {values.collectionItems.map((item, i) => (
                <div key={i} className="rounded-[8px] border border-border p-3">
                  <p className="text-[13px] font-medium text-muted">Item {i + 1}</p>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateCollectionItem(i, { name: e.target.value })}
                      placeholder="Name — e.g. Hawas Ice"
                      className={inputClass}
                    />
                    <input
                      value={item.description}
                      onChange={(e) => updateCollectionItem(i, { description: e.target.value })}
                      placeholder="Short description (optional)"
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-3">
                    <ImageUploader
                      label="Photo"
                      value={item.imageUrl}
                      onChange={(url) => updateCollectionItem(i, { imageUrl: url })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Leave a slot&apos;s name blank to skip showing it on the page.
            </p>
          </>
        )}
      </section>

      {/* ---------- Optional section: Features / USP grid ---------- */}
      <section className="mt-6 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">Features</h2>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.featuresEnabled}
              onChange={(e) => update("featuresEnabled", e.target.checked)}
            />
            Enabled
          </label>
        </div>
        <p className="mt-1 text-sm text-muted">A 4-card grid of selling points.</p>

        {values.featuresEnabled && (
          <>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Section title</label>
                <input
                  value={values.featuresTitle}
                  onChange={(e) => update("featuresTitle", e.target.value)}
                  placeholder="সিগনেচার পারফিউম কম্বো"
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Subtitle (optional)</label>
                <input
                  value={values.featuresSubtitle}
                  onChange={(e) => update("featuresSubtitle", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {values.features.map((feature, i) => (
                <div key={i} className="rounded-[8px] border border-border p-3">
                  <p className="text-[13px] font-medium text-muted">Feature {i + 1}</p>
                  <input
                    value={feature.title}
                    onChange={(e) => updateFeature(i, { title: e.target.value })}
                    placeholder="Title — e.g. দীর্ঘস্থায়ী লাস্টিং"
                    className={`mt-2 w-full ${inputClass}`}
                  />
                  <input
                    value={feature.description}
                    onChange={(e) => updateFeature(i, { description: e.target.value })}
                    placeholder="Short description"
                    className={`mt-2 w-full ${inputClass}`}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">
              Leave a card&apos;s title blank to skip showing it on the page.
            </p>
          </>
        )}
      </section>

      {/* ---------- Optional section: Shipping trust bar ---------- */}
      <section className="mt-6 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">Shipping Info Bar</h2>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.shippingBarEnabled}
              onChange={(e) => update("shippingBarEnabled", e.target.checked)}
            />
            Enabled
          </label>
        </div>
        <p className="mt-1 text-sm text-muted">
          A short strip above the order form — e.g. delivery/COD reassurance.
        </p>

        {values.shippingBarEnabled && (
          <div className="mt-4 flex flex-col gap-1.5">
            <label className={labelClass}>Items shown — one short line per row</label>
            <textarea
              value={values.shippingBarText}
              onChange={(e) => update("shippingBarText", e.target.value)}
              rows={4}
              placeholder={"সারা বাংলাদেশে ডেলিভারি\nক্যাশ অন ডেলিভারি\nপণ্য হাতে পেয়ে মূল্য পরিশোধ"}
              className={inputClass}
            />
          </div>
        )}
      </section>

      {error && <p className="mt-3 text-sm text-rose-dark">{error}</p>}

      <button
        type="submit"
        disabled={saveState === "saving"}
        className="mt-6 rounded-[8px] bg-sage px-[26px] py-[13px] font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
      >
        {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved ✓" : submitLabel}
      </button>
    </form>
  );
}
