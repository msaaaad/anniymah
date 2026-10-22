"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { Order, OrderStatus } from "@/lib/api-types";
import { Pagination } from "@/components/admin/Pagination";

interface OrderManagerProps {
  orders: Order[];
  currentSearch?: string;
  currentStatus?: string;
  page?: number;
  totalPages?: number;
  total?: number;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; activePillClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-100 text-amber-800 border border-amber-200",
    activePillClass: "bg-amber-600 text-white",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-blue-100 text-blue-800 border border-blue-200",
    activePillClass: "bg-blue-600 text-white",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    activePillClass: "bg-emerald-600 text-white",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-stone-200 text-stone-700 border border-stone-300",
    activePillClass: "bg-stone-600 text-white",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-red-100 text-red-800 border border-red-200",
    activePillClass: "bg-red-600 text-white",
  },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "delivered", "cancelled", "rejected"];

export function OrderManager({
  orders,
  currentSearch = "",
  currentStatus = "",
  page,
  totalPages,
  total,
}: OrderManagerProps) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState(currentSearch);

  function hrefFor(targetPage: number, targetStatus = currentStatus, targetSearch = currentSearch) {
    const q = new URLSearchParams();
    if (targetSearch.trim()) q.set("search", targetSearch.trim());
    if (targetStatus && targetStatus !== "all") q.set("status", targetStatus);
    if (targetPage > 1) q.set("page", String(targetPage));
    const qs = q.toString();
    return `/admin/orders${qs ? `?${qs}` : ""}`;
  }

  function handleFilterChange(status: string) {
    router.push(hrefFor(1, status, search));
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(hrefFor(1, currentStatus, search));
  }

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await apiJson(`/orders/${orderId}`, "PATCH", { status: newStatus });
      toast.success(`Order marked as ${STATUS_CONFIG[newStatus].label}`);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err, "Failed to update order status").join(", "));
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(orderId: string) {
    setDeletingId(orderId);
    setConfirmDeleteId(null);
    try {
      await apiJson(`/orders/${orderId}`, "DELETE");
      toast.success("Order deleted");
      if (openId === orderId) setOpenId(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err, "Failed to delete order").join(", "));
    } finally {
      setDeletingId(null);
    }
  }

  // Live counts for status buttons
  const counts = {
    all: total ?? orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-heading text-2xl font-semibold text-text">Orders</h1>
        <p className="mt-1 text-sm text-muted">{total ?? orders.length} total orders</p>
      </div>

      {/* Filter and Search Bar (Previous Management Style) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleFilterChange("")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !currentStatus || currentStatus === "all"
                ? "bg-sage text-white shadow-xs"
                : "bg-surface border border-border text-muted hover:text-text hover:bg-media-bg"
            }`}
          >
            All ({counts.all})
          </button>
          {ALL_STATUSES.map((status) => {
            const active = currentStatus === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleFilterChange(status)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? STATUS_CONFIG[status].activePillClass + " shadow-xs"
                    : "bg-surface border border-border text-muted hover:text-text hover:bg-media-bg"
                }`}
              >
                {STATUS_CONFIG[status].label} ({counts[status]})
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-full rounded-[8px] border border-border bg-surface px-3.5 py-2 text-sm text-text focus:border-sage focus:outline-none sm:w-64"
          />
          <button
            type="submit"
            className="rounded-[8px] border border-border bg-surface px-3 py-2 text-xs font-medium text-text hover:bg-media-bg"
          >
            Search
          </button>
        </form>
      </div>

      {/* Orders List (Expandable Cards from Previous Management) */}
      {orders.length === 0 ? (
        <div className="rounded-[10px] border border-border bg-surface p-12 text-center text-sm text-muted">
          No orders found.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => {
            const isOpen = openId === order.id;
            const isUpdating = updatingId === order.id;
            const isDeleting = deletingId === order.id;

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-[10px] border border-border bg-surface transition-shadow hover:shadow-xs"
              >
                {/* Header Row (Click to toggle expand) */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : order.id)}
                  className="flex w-full flex-col items-start gap-2 px-5 py-4 text-left transition-colors hover:bg-surface/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-text">{order.customerName}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      <span className="font-mono">{order.phone}</span>
                      {" · "}
                      <span className="font-semibold text-sage-dark">৳{order.total}</span>
                      {" · "}
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {order.items && order.items.length > 0 && (
                        <>
                          {" · "}
                          <span className="text-text/80">
                            {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                          </span>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_CONFIG[order.status]?.badgeClass ?? "bg-stone-100 text-stone-800"
                      }`}
                    >
                      {STATUS_CONFIG[order.status]?.label ?? order.status}
                    </span>
                    <svg
                      className={`h-4 w-4 text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded Details Section */}
                {isOpen && (
                  <div className="border-t border-border bg-bg/40 px-5 py-4">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium text-muted">Delivery Address</dt>
                        <dd className="mt-0.5 text-text">{order.address}</dd>
                      </div>

                      <div>
                        <dt className="text-xs font-medium text-muted">Delivery Zone & Charge</dt>
                        <dd className="mt-0.5 text-text">
                          {order.deliveryZone === "inside_dhaka"
                            ? "Inside Dhaka"
                            : order.deliveryZone === "outside_dhaka"
                            ? "Outside Dhaka"
                            : "Standard"}
                          {" · "}
                          ৳{order.deliveryCharge}
                        </dd>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-medium text-muted">Ordered Items</dt>
                          <dd className="mt-1 space-y-1">
                            {order.items.map((item, idx) => (
                              <div
                                key={item.id ?? idx}
                                className="flex items-center justify-between rounded-[6px] border border-border bg-surface px-3 py-2 text-xs"
                              >
                                <span className="font-medium text-text">{item.productName}</span>
                                <span className="text-muted">
                                  {item.quantity} × ৳{item.unitPrice} ={" "}
                                  <span className="font-semibold text-text">
                                    ৳{item.quantity * item.unitPrice}
                                  </span>
                                </span>
                              </div>
                            ))}
                          </dd>
                        </div>
                      )}

                      {order.notes && (
                        <div className="sm:col-span-2">
                          <dt className="text-xs font-medium text-muted">Customer Notes</dt>
                          <dd className="mt-0.5 rounded-[6px] bg-surface p-2 text-xs text-text border border-border">
                            {order.notes}
                          </dd>
                        </div>
                      )}

                      {order.confirmedAt && (
                        <div>
                          <dt className="text-xs font-medium text-muted">Confirmed At</dt>
                          <dd className="mt-0.5 text-xs text-text">
                            {new Date(order.confirmedAt).toLocaleString()}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {/* Action Buttons to update status or delete */}
                    <div className="mt-5 flex flex-wrap items-center gap-2 pt-3 border-t border-border">
                      <span className="text-xs font-medium text-muted mr-1">Update Status:</span>
                      {ALL_STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={order.status === status || isUpdating}
                          onClick={() => handleStatusChange(order.id, status)}
                          className={`rounded-[8px] border px-3 py-1.5 text-xs font-medium transition-colors ${
                            order.status === status
                              ? "border-transparent bg-muted/20 text-muted cursor-not-allowed"
                              : "border-border bg-surface hover:border-sage-dark hover:text-sage-dark hover:bg-sage-tint/40"
                          }`}
                        >
                          Mark {STATUS_CONFIG[status].label}
                        </button>
                      ))}

                      {/* Delete Button with 2-step click confirmation */}
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() =>
                          confirmDeleteId === order.id
                            ? handleDelete(order.id)
                            : setConfirmDeleteId(order.id)
                        }
                        onBlur={() => setConfirmDeleteId((id) => (id === order.id ? null : id))}
                        className={`ml-auto rounded-[8px] border px-3.5 py-1.5 text-xs font-semibold text-white transition-colors ${
                          confirmDeleteId === order.id
                            ? "border-red-700 bg-red-700"
                            : "border-red-600 bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {confirmDeleteId === order.id ? "Click again to confirm delete" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages && totalPages > 1 && page && (
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total ?? orders.length}
            hrefFor={(p) => hrefFor(p)}
          />
        </div>
      )}
    </div>
  );
}
