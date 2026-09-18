"use client";

import { FormEvent, ReactNode, useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";

export interface LandingPageFormValues {
  slug: string;
  title: string;
  description: string;
  price: number;
  phone: string;
  imageUrl: string;
  part2Enabled: boolean;
  part2Title: string;
  part2Text: string;
  part2ImageUrl: string;
}

interface LandingPageFormProps {
  initial: LandingPageFormValues;
  submitLabel: string;
  onSubmit: (values: LandingPageFormValues) => Promise<string | void>;
  headerActions?: ReactNode;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function LandingPageForm({ initial, submitLabel, onSubmit, headerActions }: LandingPageFormProps) {
  const [values, setValues] = useState<LandingPageFormValues>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  function update<K extends keyof LandingPageFormValues>(key: K, value: LandingPageFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
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
          <label className="text-[13px] text-muted">
            Slug — lowercase letters, numbers, hyphens only
          </label>
          <div className="flex items-center gap-1 text-sm text-muted">
            <span>/p/</span>
            <input
              value={values.slug}
              onChange={(e) => update("slug", e.target.value.toLowerCase())}
              placeholder="combo-offer"
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              required
              className="flex-1 rounded-[8px] border border-border bg-surface px-3.5 py-3 text-text focus:border-sage focus:outline-none"
            />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[10px] border border-border bg-surface p-4 sm:p-6">
        <h2 className="font-heading text-lg font-semibold">Part 1 — Main offer</h2>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] text-muted">Title</label>
          <input
            value={values.title}
            onChange={(e) => update("title", e.target.value)}
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] text-muted">Description</label>
          <textarea
            value={values.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-muted">Price (৳)</label>
            <input
              type="number"
              min={0}
              value={values.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-muted">Contact phone</label>
            <input
              value={values.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold">Part 2 — What&apos;s inside</h2>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={values.part2Enabled}
              onChange={(e) => update("part2Enabled", e.target.checked)}
            />
            Enabled
          </label>
        </div>

        {values.part2Enabled && (
          <>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[13px] text-muted">Title</label>
              <input
                value={values.part2Title}
                onChange={(e) => update("part2Title", e.target.value)}
                className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
              />
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[13px] text-muted">
                Items shown on the page — one per line
              </label>
              <textarea
                value={values.part2Text}
                onChange={(e) => update("part2Text", e.target.value)}
                rows={4}
                placeholder={"Hawas Ice — For Him\nDior Sauvage\nVampire Blood\nBleu de Chanel"}
                className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
              />
            </div>
            <div className="mt-4">
              <ImageUploader
                label="Image"
                value={values.part2ImageUrl}
                onChange={(url) => update("part2ImageUrl", url)}
              />
            </div>
          </>
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
