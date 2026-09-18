"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LandingPage } from "@/lib/types";
import { MAX_LANDING_PAGES } from "@/lib/types";

export default function AdminPagesList() {
  const [pages, setPages] = useState<LandingPage[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function load() {
    fetch("/api/landing-pages")
      .then((res) => res.json())
      .then(setPages);
  }

  useEffect(load, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title || "this page"}"? This cannot be undone.`)) return;
    setDeletingId(id);
    await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
    setDeletingId(null);
    load();
  }

  if (!pages) {
    return <p className="text-muted">Loading...</p>;
  }

  const atLimit = pages.length >= MAX_LANDING_PAGES;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Landing Pages</h1>
          <p className="mt-1 text-sm text-muted">
            {pages.length} of {MAX_LANDING_PAGES} used
          </p>
        </div>
        {atLimit ? (
          <span className="rounded-[8px] border border-border px-4 py-2 text-sm text-muted">
            Limit reached — delete one to add another
          </span>
        ) : (
          <Link
            href="/admin/pages/new"
            className="rounded-[8px] bg-sage px-[26px] py-[13px] font-medium text-white transition-colors hover:bg-sage-dark"
          >
            Create new page
          </Link>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center gap-4 rounded-[10px] border border-border bg-surface p-4"
          >
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-media-bg">
              {page.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail preview, small local/CDN image
                <img src={page.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] text-muted">No image</span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{page.title || "(untitled)"}</p>
              <p className="text-sm text-muted">
                /p/{page.slug} · ৳{page.price}
              </p>
            </div>
            <a
              href={`/p/${page.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-[8px] border border-border px-4 py-2 text-sm hover:border-sage-dark hover:text-sage-dark"
            >
              View live
            </a>
            <Link
              href={`/admin/pages/${page.id}/edit`}
              className="rounded-[8px] border border-border px-4 py-2 text-sm hover:border-sage-dark hover:text-sage-dark"
            >
              Edit
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(page.id, page.title)}
              disabled={deletingId === page.id}
              className="rounded-[8px] border border-border px-4 py-2 text-sm text-muted hover:border-rose-dark hover:text-rose-dark disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
