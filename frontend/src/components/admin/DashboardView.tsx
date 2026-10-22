"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { DashboardAnalytics, OrderStatus } from "@/lib/api-types";

interface DashboardViewProps {
  data: DashboardAnalytics;
  days: number;
}

const STATUS_MAP: Record<OrderStatus, { label: string; badge: string; border: string; bg: string }> = {
  pending: {
    label: "Pending",
    badge: "text-amber-800 bg-amber-100",
    border: "border-amber-300",
    bg: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    badge: "text-blue-800 bg-blue-100",
    border: "border-blue-300",
    bg: "bg-blue-500",
  },
  delivered: {
    label: "Delivered",
    badge: "text-emerald-800 bg-emerald-100",
    border: "border-emerald-300",
    bg: "bg-emerald-500",
  },
  cancelled: {
    label: "Cancelled",
    badge: "text-stone-700 bg-stone-200",
    border: "border-stone-300",
    bg: "bg-stone-400",
  },
  rejected: {
    label: "Rejected",
    badge: "text-red-800 bg-red-100",
    border: "border-red-300",
    bg: "bg-red-500",
  },
};

export function DashboardView({ data, days }: DashboardViewProps) {
  const router = useRouter();
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    orders: number;
    revenue: number;
    x: number;
    y: number;
  } | null>(null);

  function handleDaysChange(newDays: number) {
    router.push(`/admin?days=${newDays}`);
  }

  // Chart computations
  const sales = data.salesOverTime || [];
  const maxRevenue = Math.max(...sales.map((s) => s.revenue), 100);
  const maxOrders = Math.max(...sales.map((s) => s.orders), 5);
  const chartHeight = 220;
  const chartPadding = 24;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-text sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-xs text-muted sm:text-sm">
            Live overview of storefront sales, fulfillment status, and inventory alerts
          </p>
        </div>

        {/* Days Filter Pills */}
        <div className="flex items-center gap-1.5 self-start rounded-[10px] border border-border bg-surface p-1 shadow-2xs sm:self-auto">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDaysChange(d)}
              className={`rounded-[7px] px-3 py-1.5 text-xs font-semibold transition-all ${
                days === d
                  ? "bg-sage text-white shadow-xs"
                  : "text-muted hover:text-text hover:bg-media-bg"
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Top Stats Cards Grid (Mobile-first: 1 col -> 2 col -> 4 col) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-[12px] border border-border bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Revenue (Delivered)</span>
            <span className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-text">
              ৳{data.revenue.total.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-emerald-700">
            ৳{data.revenue.thisMonth.toLocaleString()} this month
          </p>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-[12px] border border-border bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Total Orders</span>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-text">
              {data.totalOrders.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            <span className="font-semibold text-emerald-600">{data.ordersByStatus.delivered ?? 0}</span> delivered ·{" "}
            <span className="font-semibold text-blue-600">{data.ordersByStatus.confirmed ?? 0}</span> confirmed
          </p>
        </div>

        {/* Pending Orders Alert */}
        <Link
          href="/admin/orders?status=pending"
          className="group relative overflow-hidden rounded-[12px] border border-border bg-surface p-5 shadow-2xs transition-all hover:border-amber-400 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Pending Orders</span>
            <span className="rounded-full bg-amber-50 p-2 text-amber-600 transition-transform group-hover:scale-110">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-text">
              {data.ordersByStatus.pending ?? 0}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-700">
            <span>Needs fulfillment</span>
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </p>
        </Link>

        {/* Inventory Stock Alerts */}
        <Link
          href="/admin/products"
          className="group relative overflow-hidden rounded-[12px] border border-border bg-surface p-5 shadow-2xs transition-all hover:border-red-400 hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">Inventory Alerts</span>
            <span className="rounded-full bg-red-50 p-2 text-red-600 transition-transform group-hover:scale-110">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading text-2xl font-bold tracking-tight text-text">
              {(data.stock.outOfStockCount + data.stock.lowStockCount).toLocaleString()}
            </span>
            <span className="text-xs text-muted">items</span>
          </div>
          <p className="mt-2 text-xs text-muted">
            <span className="font-semibold text-red-600">{data.stock.outOfStockCount}</span> out ·{" "}
            <span className="font-semibold text-amber-600">{data.stock.lowStockCount}</span> low (≤{data.stock.lowStockThreshold})
          </p>
        </Link>
      </div>

      {/* Main Analytics Section: Sales Chart & Orders by Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales & Orders Over Time Chart (Takes 2 cols on desktop) */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-2xs lg:col-span-2">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-heading text-base font-semibold text-text sm:text-lg">
                Revenue & Orders Trend
              </h2>
              <p className="text-xs text-muted">Daily delivered revenue and orders placed over the last {days} days</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-sage-dark">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-sage" />
                Revenue (৳)
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-500" />
                Orders
              </span>
            </div>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="relative mt-6 h-64 w-full">
            {sales.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-muted">
                No activity recorded in this period.
              </div>
            ) : (
              <svg
                className="h-full w-full overflow-visible"
                viewBox={`0 0 ${Math.max(sales.length * 28, 400)} ${chartHeight}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--sage)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--sage)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal guidelines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = chartPadding + (chartHeight - chartPadding * 2) * (1 - ratio);
                  return (
                    <line
                      key={ratio}
                      x1="0"
                      y1={y}
                      x2={Math.max(sales.length * 28, 400)}
                      y2={y}
                      stroke="currentColor"
                      className="text-border"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Revenue Area Fill & Line */}
                {(() => {
                  const width = Math.max(sales.length * 28, 400);
                  const step = width / Math.max(sales.length - 1, 1);
                  const points = sales.map((s, idx) => {
                    const x = idx * step;
                    const y =
                      chartHeight -
                      chartPadding -
                      (s.revenue / maxRevenue) * (chartHeight - chartPadding * 2);
                    return { x, y, data: s };
                  });

                  const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                  const areaPath = `${linePath} L ${points[points.length - 1]?.x ?? 0} ${chartHeight - chartPadding} L 0 ${chartHeight - chartPadding} Z`;

                  return (
                    <>
                      <path d={areaPath} fill="url(#revenueGradient)" />
                      <path d={linePath} fill="none" stroke="var(--sage)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                      {/* Data Points */}
                      {points.map((p, idx) => (
                        <g key={idx}>
                          {/* Orders Bar (thin bar behind) */}
                          <rect
                            x={p.x - 3}
                            y={chartHeight - chartPadding - (p.data.orders / maxOrders) * (chartHeight - chartPadding * 2)}
                            width="6"
                            height={(p.data.orders / maxOrders) * (chartHeight - chartPadding * 2)}
                            rx="2"
                            className="fill-blue-500/40 hover:fill-blue-600 transition-colors"
                          />
                          {/* Revenue Point circle */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredPoint?.date === p.data.date ? 5 : 3.5}
                            className="fill-white stroke-sage stroke-2 transition-all cursor-pointer hover:r-6"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                date: p.data.date,
                                orders: p.data.orders,
                                revenue: p.data.revenue,
                                x: p.x,
                                y: p.y,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            )}

            {/* Hover Tooltip Box */}
            {hoveredPoint && (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-[8px] border border-border bg-text px-3 py-2 text-xs text-white shadow-lg"
                style={{
                  left: `${(hoveredPoint.x / Math.max(sales.length * 28, 400)) * 100}%`,
                  top: `${hoveredPoint.y - 12}px`,
                }}
              >
                <p className="font-semibold text-rose">{hoveredPoint.date}</p>
                <div className="mt-1 flex items-center justify-between gap-4">
                  <span className="text-stone-300">Revenue:</span>
                  <span className="font-mono font-bold text-white">৳{hoveredPoint.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-stone-300">Orders:</span>
                  <span className="font-mono font-bold text-blue-200">{hoveredPoint.orders}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status Breakdown */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-2xs">
          <h2 className="font-heading text-base font-semibold text-text sm:text-lg">
            Fulfillment Status
          </h2>
          <p className="text-xs text-muted">Breakdown across all lifetime orders</p>

          <div className="mt-5 space-y-3.5">
            {(Object.keys(STATUS_MAP) as OrderStatus[]).map((status) => {
              const count = data.ordersByStatus[status] ?? 0;
              const percent = data.totalOrders > 0 ? Math.round((count / data.totalOrders) * 100) : 0;
              const cfg = STATUS_MAP[status];

              return (
                <Link
                  key={status}
                  href={`/admin/orders?status=${status}`}
                  className="group flex flex-col gap-1.5 rounded-[8px] p-2 transition-colors hover:bg-media-bg/50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text">{cfg.label}</span>
                    <span className="font-semibold text-muted">
                      {count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cfg.bg}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/admin/orders"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-sage-dark hover:underline"
            >
              <span>Manage all orders</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Products & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top 5 Products Leaderboard */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-semibold text-text sm:text-lg">
                Top Products
              </h2>
              <p className="text-xs text-muted">
                {data.topProductsSource === "sales"
                  ? "Ranked by units sold on delivered orders"
                  : "Latest added active products (no delivered sales yet)"}
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-sage-dark hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-4 divide-y divide-border">
            {data.topProducts.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted">No products available yet.</p>
            ) : (
              data.topProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0
                          ? "bg-amber-100 text-amber-800"
                          : idx === 1
                          ? "bg-slate-200 text-slate-700"
                          : idx === 2
                          ? "bg-orange-100 text-orange-800"
                          : "bg-surface border border-border text-muted"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span className="font-medium text-text text-sm line-clamp-1">
                      {prod.productName}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-medium">
                    <span className="text-muted">
                      {prod.unitsSold} {prod.unitsSold === 1 ? "unit" : "units"}
                    </span>
                    <span className="font-semibold text-sage-dark font-mono">
                      ৳{prod.revenue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Shortcuts */}
        <div className="rounded-[12px] border border-border bg-surface p-5 shadow-2xs">
          <h2 className="font-heading text-base font-semibold text-text sm:text-lg">
            Quick Actions
          </h2>
          <p className="text-xs text-muted">Common admin workflows and management shortcuts</p>

          <div className="mt-4 grid grid-cols-1 gap-2.5">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-3 rounded-[8px] border border-border bg-surface px-4 py-3 text-xs font-semibold text-text transition-colors hover:border-sage hover:bg-sage-tint/40"
            >
              <span className="rounded-md bg-sage-tint p-1.5 text-sage-dark">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </span>
              <span>Add New Product</span>
            </Link>

            <Link
              href="/admin/landing-pages"
              className="flex items-center gap-3 rounded-[8px] border border-border bg-surface px-4 py-3 text-xs font-semibold text-text transition-colors hover:border-sage hover:bg-sage-tint/40"
            >
              <span className="rounded-md bg-sage-tint p-1.5 text-sage-dark">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span>Manage Landing Pages</span>
            </Link>

            <Link
              href="/admin/customers"
              className="flex items-center gap-3 rounded-[8px] border border-border bg-surface px-4 py-3 text-xs font-semibold text-text transition-colors hover:border-sage hover:bg-sage-tint/40"
            >
              <span className="rounded-md bg-blue-50 p-1.5 text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
              <span>View Customers Database</span>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-[8px] border border-border bg-surface px-4 py-3 text-xs font-semibold text-text transition-colors hover:border-sage hover:bg-sage-tint/40"
            >
              <span className="rounded-md bg-stone-100 p-1.5 text-stone-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </span>
              <span>Store Settings & Theme Colors</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
