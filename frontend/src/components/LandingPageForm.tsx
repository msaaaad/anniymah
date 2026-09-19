"use client";

import { FormEvent, ReactNode, useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { useToast } from "@/components/Toast";
import {
  MAX_COLLECTION_ITEMS,
  MAX_FEATURES,
  MAX_SHIPPING_BAR_ITEMS,
  type CollectionItem,
  type FeatureItem,
} from "@/lib/types";

export interface LandingPageFormValues {
  slug: string;
  title: string;
  description: string;
  price: number;
  regularPrice: number;
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
  shippingBarItems: string[];
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
const addButtonClass =
  "mt-3 w-fit rounded-[8px] border border-dashed border-border px-4 py-2 text-sm text-muted hover:border-sage-dark hover:text-sage-dark disabled:cursor-not-allowed disabled:opacity-40";
const removeButtonClass = "text-xs text-muted hover:text-rose-dark";

export function LandingPageForm({ initial, submitLabel, onSubmit, headerActions }: LandingPageFormProps) {
  const [values, setValues] = useState<LandingPageFormValues>({
    ...initial,
    // Features stay a fixed 4-card grid (fixed rotating icons) — pad/trim to
    // exactly MAX_FEATURES. Collection items and shipping bar items are
    // genuinely dynamic lists the admin grows/shrinks with add/remove.
    features: padTo(initial.features, MAX_FEATURES, { title: "", description: "" }),
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");
  const { showToast } = useToast();

  function update<K extends keyof LandingPageFormValues>(key: K, value: LandingPageFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function updateCollectionItem(index: number, patch: Partial<CollectionItem>) {
    setValues((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addCollectionItem() {
    setValues((prev) => ({
      ...prev,
      collectionItems: [...prev.collectionItems, { name: "", description: "", imageUrl: "" }],
    }));
  }

  function removeCollectionItem(index: number) {
    setValues((prev) => ({
      ...prev,
      collectionItems: prev.collectionItems.filter((_, i) => i !== index),
    }));
  }

  function updateFeature(index: number, patch: Partial<FeatureItem>) {
    setValues((prev) => ({
      ...prev,
      features: prev.features.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function updateShippingBarItem(index: number, value: string) {
    setValues((prev) => ({
      ...prev,
      shippingBarItems: prev.shippingBarItems.map((item, i) => (i === index ? value : item)),
    }));
  }

  function addShippingBarItem() {
    setValues((prev) => ({ ...prev, shippingBarItems: [...prev.shippingBarItems, ""] }));
  }

  function removeShippingBarItem(index: number) {
    setValues((prev) => ({
      ...prev,
      shippingBarItems: prev.shippingBarItems.filter((_, i) => i !== index),
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
      showToast(errorMessage, "error");
      return;
    }
    setSaveState("saved");
    showToast("Page saved", "success");
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
            <label className={labelClass}>Regular price (৳) — optional, shown crossed out</label>
            <input
              type="number"
              min={0}
              value={values.regularPrice}
              onChange={(e) => update("regularPrice", Number(e.target.value))}
              placeholder="0 = don't show one"
              className={inputClass}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className={labelClass}>Contact phone</label>
          <input
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
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

      {/* ---------- Optional section: Product Collection (dynamic list) ---------- */}
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
          A photo card per item — e.g. each perfume in the combo. Add as many as you like.
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
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-medium text-muted">Item {i + 1}</p>
                    <button type="button" onClick={() => removeCollectionItem(i)} className={removeButtonClass}>
                      Remove
                    </button>
                  </div>
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
            <button
              type="button"
              onClick={addCollectionItem}
              disabled={values.collectionItems.length >= MAX_COLLECTION_ITEMS}
              className={addButtonClass}
            >
              + Add item
            </button>
          </>
        )}
      </section>

      {/* ---------- Optional section: Features / USP grid (fixed 4) ---------- */}
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

      {/* ---------- Optional section: Shipping trust bar (dynamic list) ---------- */}
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
          <>
            <div className="mt-4 flex flex-col gap-2">
              {values.shippingBarItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateShippingBarItem(i, e.target.value)}
                    placeholder="সারা বাংলাদেশে ডেলিভারি"
                    className={`flex-1 ${inputClass}`}
                  />
                  <button type="button" onClick={() => removeShippingBarItem(i)} className={removeButtonClass}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addShippingBarItem}
              disabled={values.shippingBarItems.length >= MAX_SHIPPING_BAR_ITEMS}
              className={addButtonClass}
            >
              + Add line
            </button>
          </>
        )}
      </section>

      {/* Spacer so the fixed save bar below never covers the last section */}
      <div className="h-24" />

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface shadow-[0_-6px_20px_rgba(43,33,26,.08)]">
        <div className="mx-auto max-w-[1180px] px-4 py-3 sm:px-[28px]">
          <div className="flex items-center justify-between gap-3">
            {error ? (
              <p className="text-sm text-rose-dark">{error}</p>
            ) : (
              <span className="text-sm text-muted">
                {saveState === "saved" ? "Saved ✓" : "Unsaved changes are lost if you navigate away."}
              </span>
            )}
            <button
              type="submit"
              disabled={saveState === "saving"}
              className="shrink-0 rounded-[8px] bg-sage px-[26px] py-[13px] font-medium text-white transition-colors hover:bg-sage-dark disabled:opacity-60"
            >
              {saveState === "saving" ? "Saving..." : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
