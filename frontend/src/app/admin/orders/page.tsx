"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  delivered: "Delivered",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending: "bg-media-bg text-text",
  confirmed: "bg-sage-tint text-sage-dark",
  delivered: "bg-sage text-white",
  rejected: "bg-rose-tint text-rose-dark",
  cancelled: "bg-rose-tint text-rose-dark",
};

const STATUS_FILTERS: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "delivered",
  "rejected",
  "cancelled",
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");

  function loadOrders() {
    fetch("/api/orders")
      .then((res) => res.json())
      .then(setOrders);
  }

  useEffect(loadOrders, []);

  async function updateStatus(id: string, status: OrderStatus) {
    const previous = orders;
    setOrders((prev) =>
      prev ? prev.map((o) => (o.id === id ? { ...o, status } : o)) : prev
    );

    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      setOrders(previous);
      toast.error("Failed to update order status");
      return;
    }

    toast.success(`Order marked as ${STATUS_LABEL[status]}`);
    loadOrders();
  }

  async function deleteOrder(id: string) {
    const previous = orders;
    setConfirmDeleteId(null);
    setOrders((prev) => (prev ? prev.filter((o) => o.id !== id) : prev));

    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });

    if (!res.ok) {
      setOrders(previous);
      toast.error("Failed to delete order");
      return;
    }

    toast.success("Order deleted");
  }

  if (!orders) {
    return <p className="text-muted">Loading...</p>;
  }

  const query = search.trim().toLowerCase();
  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (!query) return true;
    return (
      order.customerName.toLowerCase().includes(query) ||
      order.phone.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Orders</h1>
      <p className="mt-1 text-sm text-muted">{orders.length} total</p>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => {
            const count =
              status === "all" ? orders.length : orders.filter((o) => o.status === status).length;
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-sage text-white"
                    : "bg-media-bg text-muted hover:text-text"
                }`}
              >
                {status === "all" ? "All" : STATUS_LABEL[status]} ({count})
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full rounded-[8px] border border-border bg-surface px-3.5 py-2 text-sm focus:border-sage focus:outline-none sm:w-64"
        />
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-muted">No orders yet.</p>
      ) : filteredOrders.length === 0 ? (
        <p className="mt-6 text-muted">No orders match your filter.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {filteredOrders.map((order) => {
            const isOpen = openId === order.id;
            return (
              <div key={order.id} className="rounded-[10px] border border-border bg-surface">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : order.id)}
                  className="flex w-full flex-col items-start gap-2 px-5 py-4 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-muted">
                      {order.phone} · ৳{order.total} · {new Date(order.createdAt).toLocaleString()}
                      {order.landingPageSlug && <> · from /p/{order.landingPageSlug}</>}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[order.status]}`}
                  >
                    {STATUS_LABEL[order.status]}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border px-5 py-4">
                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-muted">Address</dt>
                        <dd>{order.address}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Quantity</dt>
                        <dd>{order.quantity} × ৳{order.unitPrice}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Delivery</dt>
                        <dd>
                          {order.deliveryZone
                            ? `${order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"} · ৳${order.deliveryCharge}`
                            : "Free"}
                        </dd>
                      </div>
                      {order.notes && (
                        <div className="sm:col-span-2">
                          <dt className="text-muted">Notes</dt>
                          <dd>{order.notes}</dd>
                        </div>
                      )}
                      {order.confirmedAt && (
                        <div>
                          <dt className="text-muted">Confirmed at</dt>
                          <dd>{new Date(order.confirmedAt).toLocaleString()}</dd>
                        </div>
                      )}
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={order.status === status}
                          onClick={() => updateStatus(order.id, status)}
                          className="rounded-[8px] border border-border px-4 py-2 text-sm hover:border-sage-dark hover:text-sage-dark disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Mark {STATUS_LABEL[status]}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          confirmDeleteId === order.id
                            ? deleteOrder(order.id)
                            : setConfirmDeleteId(order.id)
                        }
                        onBlur={() => setConfirmDeleteId((id) => (id === order.id ? null : id))}
                        className={`ml-auto rounded-[8px] border px-4 py-2 text-sm font-semibold text-white transition-colors ${
                          confirmDeleteId === order.id
                            ? "border-danger-dark bg-danger-dark"
                            : "border-danger bg-danger hover:bg-danger-dark hover:border-danger-dark"
                        }`}
                      >
                        {confirmDeleteId === order.id ? "Click again to confirm" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
