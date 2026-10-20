"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { Order, OrderStatus } from "@/lib/api-types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import { btnGhost, btnIconDanger, cardClass, inputClass } from "@/components/admin/styles";

interface OrderManagerProps {
  orders: Order[];
  currentSearch?: string;
  currentStatus?: string;
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
  },
  confirmed: {
    label: "Confirmed",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  delivered: {
    label: "Delivered",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-stone-200 text-stone-700 border-stone-300",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-red-100 text-red-800 border-red-200",
  },
};

const ALL_STATUSES: OrderStatus[] = ["pending", "confirmed", "delivered", "cancelled", "rejected"];

export function OrderManager({ orders, currentSearch = "", currentStatus = "" }: OrderManagerProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

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

  async function confirmDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await apiJson(`/orders/${deleting.id}`, "DELETE");
      toast.success("Order deleted");
      setDeleting(null);
      if (selectedOrder?.id === deleting.id) setSelectedOrder(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err, "Failed to delete order").join(", "));
    } finally {
      setBusyDelete(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text">Orders</h1>
          <p className="mt-1 text-sm text-muted">Manage storefront customer orders and fulfillment</p>
        </div>
      </div>

      {/* Filter and search bar */}
      <form method="GET" action="/admin/orders" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          name="search"
          defaultValue={currentSearch}
          placeholder="Search by customer name or phone"
          aria-label="Search orders"
          className={inputClass}
        />
        <select
          name="status"
          defaultValue={currentStatus}
          aria-label="Filter by status"
          className={inputClass}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_CONFIG[status].label}
            </option>
          ))}
        </select>
        <button type="submit" className={btnGhost}>
          Apply
        </button>
      </form>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <p className={`${cardClass} mt-6 p-8 text-center text-sm text-muted`}>
          No orders found matching your filters.
        </p>
      ) : (
        <div className={`${cardClass} mt-6 overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Customer</th>
                <th scope="col" className="px-4 py-3 font-medium">Items</th>
                <th scope="col" className="px-4 py-3 font-medium">Delivery</th>
                <th scope="col" className="px-4 py-3 font-medium">Total</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Date</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isUpdating = updatingId === order.id;
                return (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-text">{order.customerName}</div>
                      <div className="text-xs text-muted">{order.phone}</div>
                      <div className="line-clamp-1 max-w-[200px] text-xs text-muted/80">{order.address}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"}
                      </div>
                      <div className="line-clamp-1 max-w-[180px] text-xs text-muted">
                        {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-text">
                        {order.deliveryZone === "inside_dhaka"
                          ? "Inside Dhaka"
                          : order.deliveryZone === "outside_dhaka"
                            ? "Outside Dhaka"
                            : "Standard"}
                      </span>
                      <div className="text-xs text-muted">৳{order.deliveryCharge} charge</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-sage-dark">
                      ৳{order.total}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          disabled={isUpdating}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-sage ${
                            STATUS_CONFIG[order.status]?.badgeClass ?? "bg-stone-100 text-stone-800"
                          }`}
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {STATUS_CONFIG[status].label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text shadow-2xs transition-colors hover:border-sage hover:text-sage-dark hover:bg-sage-tint/40"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>Details</span>
                        </button>
                        <button
                          type="button"
                          title="Delete order"
                          aria-label="Delete order"
                          onClick={() => setDeleting(order)}
                          className={btnIconDanger}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      <Modal
        open={selectedOrder !== null}
        title="Order Details"
        onClose={() => setSelectedOrder(null)}
      >
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="rounded-lg border border-border bg-surface p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">Order ID:</span>
                <span className="font-mono text-xs">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">Status:</span>
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[selectedOrder.status].badgeClass}`}>
                  {STATUS_CONFIG[selectedOrder.status].label}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">Customer Name:</span>
                <span className="font-medium">{selectedOrder.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">Phone:</span>
                <a href={`tel:${selectedOrder.phone}`} className="font-medium text-sage hover:underline">
                  {selectedOrder.phone}
                </a>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-muted">Delivery Address:</span>
                <span className="text-right font-medium max-w-[240px]">{selectedOrder.address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="flex justify-between items-start border-t border-border/60 pt-2">
                  <span className="text-xs text-muted">Notes:</span>
                  <span className="text-right text-muted italic max-w-[240px]">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="font-medium text-xs uppercase tracking-wider text-muted mb-2">Order Items</h4>
              <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 text-xs">
                    <div>
                      <div className="font-medium text-text">{item.productName}</div>
                      <div className="text-muted">Qty: {item.quantity} × ৳{item.unitPrice}</div>
                    </div>
                    <div className="font-semibold text-text">
                      ৳{item.quantity * item.unitPrice}
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center p-3 text-xs bg-bg/50">
                  <span className="text-muted">Delivery Charge ({selectedOrder.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})</span>
                  <span className="font-medium">৳{selectedOrder.deliveryCharge}</span>
                </div>
                <div className="flex justify-between items-center p-3 text-sm font-semibold bg-sage-tint/40 text-sage-dark">
                  <span>Grand Total</span>
                  <span>৳{selectedOrder.total}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className={btnGhost}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete Order?"
        message={
          <>
            Are you sure you want to delete order for <strong>{deleting?.customerName}</strong> (৳{deleting?.total})? This action cannot be undone.
          </>
        }
        confirmLabel="Delete order"
        busy={busyDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
