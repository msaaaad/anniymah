"use client";

import { FormEvent, useEffect, useState } from "react";
import type { LandingPage } from "@/lib/types";
import { ImageUploader } from "@/components/ImageUploader";

type SaveState = "idle" | "saving" | "saved" | "error";

export default function AdminLandingPage() {
  const [form, setForm] = useState<LandingPage | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/landing")
      .then((res) => res.json())
      .then(setForm);
  }, []);

  function update<K extends keyof LandingPage>(key: K, value: LandingPage[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setSaveState("saving");
    setError("");

    const res = await fetch("/api/landing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Save failed");
      setSaveState("error");
      return;
    }

    const updated = await res.json();
    setForm(updated);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  if (!form) {
    return <p className="text-muted">Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h1 className="font-heading text-2xl font-semibold">Landing Page</h1>
      <p className="mt-1 text-sm text-muted">Edit the content shown on the public landing page.</p>

      <section className="mt-6 rounded-[10px] border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-semibold">Part 1 — Main offer</h2>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] text-muted">Title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-[13px] text-muted">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-muted">Price (৳)</label>
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-muted">Contact phone</label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <ImageUploader
            label="Product image"
            value={form.imageUrl}
            onChange={(url) => update("imageUrl", url)}
          />
        </div>
      </section>

      <section className="mt-6 rounded-[10px] border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Part 2 — What&apos;s inside</h2>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.part2Enabled}
              onChange={(e) => update("part2Enabled", e.target.checked)}
            />
            Enabled
          </label>
        </div>

        {form.part2Enabled && (
          <>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[13px] text-muted">Title</label>
              <input
                value={form.part2Title}
                onChange={(e) => update("part2Title", e.target.value)}
                className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
              />
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-[13px] text-muted">
                Items shown on the page — one per line
              </label>
              <textarea
                value={form.part2Text}
                onChange={(e) => update("part2Text", e.target.value)}
                rows={4}
                placeholder={"Hawas Ice — For Him\nDior Sauvage\nVampire Blood\nBleu de Chanel"}
                className="rounded-[8px] border border-border bg-surface px-3.5 py-3 focus:border-sage focus:outline-none"
              />
            </div>
            <div className="mt-4">
              <ImageUploader
                label="Image"
                value={form.part2ImageUrl}
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
        {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}
