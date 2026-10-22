"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Customer } from "@/lib/api-types";
import { Pagination } from "@/components/admin/Pagination";
import { cardClass, inputClass } from "@/components/admin/styles";

interface CustomerManagerProps {
  customers: Customer[];
  currentSearch?: string;
  page: number;
  totalPages: number;
  total: number;
}

export function CustomerManager({
  customers,
  currentSearch = "",
  page,
  totalPages,
  total,
}: CustomerManagerProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(currentSearch);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchTerm.trim()) query.set("search", searchTerm.trim());
    router.push(`/admin/customers${query.toString() ? `?${query.toString()}` : ""}`);
  }

  function handleClear() {
    setSearchTerm("");
    router.push("/admin/customers");
  }

  function hrefFor(targetPage: number) {
    const query = new URLSearchParams();
    if (currentSearch) query.set("search", currentSearch);
    if (targetPage > 1) query.set("page", String(targetPage));
    return `/admin/customers${query.toString() ? `?${query.toString()}` : ""}`;
  }

  // Calculate quick aggregates for current page
  const pageTotalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const pageTotalOrders = customers.reduce((sum, c) => sum + (c.orderCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Customer directory and lifetime value from storefront orders
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-muted shadow-2xs sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-sage" />
          <span>{total} Total Registered</span>
        </div>
      </div>

      {/* Quick Stat Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[12px] border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted">Total Customers</span>
          <p className="mt-2 font-heading text-xl font-bold text-text sm:text-2xl">{total}</p>
          <p className="mt-1 text-[11px] text-muted">Unique phone & customer profiles</p>
        </div>
        <div className="rounded-[12px] border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted">Page Orders</span>
          <p className="mt-2 font-heading text-xl font-bold text-blue-600 sm:text-2xl">{pageTotalOrders}</p>
          <p className="mt-1 text-[11px] text-muted">Placed by customers on this page</p>
        </div>
        <div className="rounded-[12px] border border-border bg-surface p-4 shadow-2xs">
          <span className="text-xs font-medium text-muted">Page Delivered Spent</span>
          <p className="mt-2 font-heading text-xl font-bold text-emerald-600 sm:text-2xl">
            ৳{pageTotalSpent.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-muted">Lifetime delivered revenue from these customers</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`${cardClass} p-4`}>
        <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name, phone, or email..."
              className={`${inputClass} pl-10 text-xs sm:text-sm`}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-[8px] bg-sage px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-sage-dark"
            >
              Search
            </button>
            {currentSearch && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center justify-center rounded-[8px] border border-border bg-surface px-3 py-2.5 text-xs sm:text-sm font-medium text-muted hover:text-text"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Customers List / Table */}
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[12px] border border-dashed border-border bg-surface py-16 text-center">
          <div className="rounded-full bg-media-bg p-3 text-muted">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-text">No customers found</h3>
          <p className="mt-1 text-xs text-muted max-w-sm">
            {currentSearch
              ? `No customers matched "${currentSearch}". Try searching with a different name or phone number.`
              : "Customers will appear here once storefront orders are placed."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List (< md screens) */}
          <div className="space-y-3 md:hidden">
            {customers.map((c) => (
              <div key={c.id} className="rounded-[12px] border border-border bg-surface p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-semibold text-text">{c.name || "Unnamed Customer"}</h3>
                    <p className="text-[11px] text-muted">
                      Joined {new Date(c.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <span className="rounded-full bg-sage-tint px-2.5 py-1 text-xs font-bold text-sage-dark">
                    {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-muted">Phone:</span>
                    <a href={`tel:${c.phone}`} className="font-mono font-medium text-sage-dark hover:underline">
                      {c.phone}
                    </a>
                  </div>
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted">Email:</span>
                      <a href={`mailto:${c.email}`} className="font-medium text-text hover:underline truncate max-w-[200px]">
                        {c.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-border">
                    <span className="text-muted">Total Delivered Spent:</span>
                    <span className="font-mono font-bold text-emerald-700">৳{c.totalSpent.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex justify-end">
                  <Link
                    href={`/admin/orders?search=${encodeURIComponent(c.phone)}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sage-dark hover:underline"
                  >
                    <span>View Orders</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table (>= md screens) */}
          <div className="hidden md:block overflow-hidden rounded-[12px] border border-border bg-surface shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-media-bg/50 font-medium text-muted">
                <tr>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Contact Details</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-4 py-3.5 text-center">Orders</th>
                  <th className="px-4 py-3.5 text-right">Delivered Spent</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-normal text-text">
                {customers.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-media-bg/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-tint font-bold text-sage-dark text-sm">
                          {(c.name || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-text text-sm">{c.name || "Unnamed"}</div>
                          <span className="font-mono text-[11px] text-muted">ID: {c.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <a href={`tel:${c.phone}`} className="font-mono font-medium text-sage-dark hover:underline block">
                          {c.phone}
                        </a>
                        {c.email ? (
                          <a href={`mailto:${c.email}`} className="text-muted hover:text-text block truncate max-w-[180px]">
                            {c.email}
                          </a>
                        ) : (
                          <span className="text-[11px] text-muted italic">No email</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-700">
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-mono font-bold text-emerald-700">
                      ৳{c.totalSpent.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders?search=${encodeURIComponent(c.phone)}`}
                        className="inline-flex items-center gap-1 rounded-[6px] border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text transition-colors hover:border-sage hover:text-sage-dark"
                      >
                        <span>Orders</span>
                        <span>→</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} total={total} hrefFor={hrefFor} />
        </>
      )}
    </div>
  );
}
