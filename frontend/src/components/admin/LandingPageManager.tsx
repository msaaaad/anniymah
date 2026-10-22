"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { LandingPageAdmin } from "@/lib/api-types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { btnGhost, btnIconDanger, btnIconEdit, btnPrimary, cardClass } from "@/components/admin/styles";

interface LandingPageManagerProps {
  pages: LandingPageAdmin[];
}

export function LandingPageManager({ pages }: LandingPageManagerProps) {
  const router = useRouter();
  const [deletingPage, setDeletingPage] = useState<LandingPageAdmin | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  async function handleDelete() {
    if (!deletingPage) return;
    setBusyDelete(true);
    try {
      await apiJson(`/landing-pages/${deletingPage.id}`, "DELETE");
      toast.success(`Landing page "${deletingPage.title || deletingPage.slug}" deleted`);
      setDeletingPage(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join("\n") || "Failed to delete landing page");
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Landing Pages
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Standalone promotional campaign pages with dedicated checkout funnels
          </p>
        </div>
        <Link href="/admin/landing-pages/new" className={btnPrimary}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Landing Page</span>
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border bg-surface py-16 text-center">
          <div className="rounded-full bg-media-bg p-3 text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-text">No landing pages yet</h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            Launch high-converting campaign landing pages for your featured combos and perfume collections.
          </p>
          <Link href="/admin/landing-pages/new" className={`${btnPrimary} mt-4`}>
            Create your first page
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="space-y-3.5 md:hidden">
            {pages.map((page) => (
              <div key={page.id} className="rounded-[12px] border border-border bg-surface p-4 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[8px] bg-media-bg border border-border/70">
                    {page.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={page.imageUrl} alt={page.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">No Image</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm font-semibold text-text line-clamp-1">
                      {page.title || "Untitled Page"}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <span className="font-mono text-sage-dark">/p/{page.slug}</span>
                      <a
                        href={`/p/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted hover:text-text"
                        title="Preview live page in new tab"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="font-mono text-sm font-bold text-sage-dark">৳{page.price}</span>
                      {page.regularPrice > page.price && (
                        <span className="font-mono text-xs text-muted line-through">৳{page.regularPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border/60 text-[11px]">
                  {page.freeDelivery ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">Free Delivery</span>
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-600">
                      Dhaka ৳{page.deliveryChargeInsideDhaka} / Outside ৳{page.deliveryChargeOutsideDhaka}
                    </span>
                  )}
                  {page.collectionEnabled && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">Collection</span>
                  )}
                  {page.featuresEnabled && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 font-medium text-purple-700">Features</span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <a
                    href={`/p/${page.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sage-dark hover:underline"
                  >
                    <span>View Live</span>
                    <span>↗</span>
                  </a>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/landing-pages/${page.id}/edit`} className={btnIconEdit} title="Edit landing page">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeletingPage(page)}
                      className={btnIconDanger}
                      title="Delete landing page"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-hidden rounded-[12px] border border-border bg-surface shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-media-bg/50 font-medium text-muted">
                <tr>
                  <th className="px-5 py-3.5">Campaign Page</th>
                  <th className="px-4 py-3.5">Slug / URL</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Active Sections</th>
                  <th className="px-4 py-3.5">Delivery</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-normal text-text">
                {pages.map((page) => (
                  <tr key={page.id} className="transition-colors hover:bg-media-bg/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[8px] bg-media-bg border border-border/70">
                          {page.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={page.imageUrl} alt={page.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted">No Image</div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-text text-sm">{page.title || "Untitled"}</div>
                          {page.phone && <span className="text-[11px] text-muted">Phone: {page.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <code className="rounded bg-media-bg px-2 py-0.5 font-mono text-sage-dark">
                          /p/{page.slug}
                        </code>
                        <a
                          href={`/p/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-text"
                          title="Open in new tab"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-mono font-bold text-sage-dark text-sm">৳{page.price}</div>
                      {page.regularPrice > page.price && (
                        <div className="font-mono text-[11px] text-muted line-through">৳{page.regularPrice}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1">
                        {page.collectionEnabled && (
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                            Collection ({page.collectionItems?.length || 0})
                          </span>
                        )}
                        {page.featuresEnabled && (
                          <span className="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                            Features ({page.features?.length || 0})
                          </span>
                        )}
                        {page.shippingBarEnabled && (
                          <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            Shipping Bar
                          </span>
                        )}
                        {!page.collectionEnabled && !page.featuresEnabled && !page.shippingBarEnabled && (
                          <span className="text-muted italic">Hero only</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {page.freeDelivery ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700">
                          Free
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted">
                          ৳{page.deliveryChargeInsideDhaka} / ৳{page.deliveryChargeOutsideDhaka}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/p/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-[8px] border border-border bg-surface px-2.5 text-xs font-semibold text-text shadow-2xs hover:border-sage hover:text-sage-dark"
                        >
                          View Live ↗
                        </a>
                        <Link
                          href={`/admin/landing-pages/${page.id}/edit`}
                          className={btnIconEdit}
                          title="Edit landing page"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingPage(page)}
                          className={btnIconDanger}
                          title="Delete landing page"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* SweetAlert-style Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingPage)}
        variant="danger"
        title="Delete Landing Page?"
        message={
          <>
            Are you sure you want to delete{" "}
            <strong>{deletingPage?.title || deletingPage?.slug}</strong>? Its custom campaign URL and associated storage image will be permanently removed.
          </>
        }
        confirmLabel="Yes, Delete Page"
        busy={busyDelete}
        onConfirm={handleDelete}
        onCancel={() => setDeletingPage(null)}
      />
    </div>
  );
}
