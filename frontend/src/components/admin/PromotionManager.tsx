"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import type { Promotion } from "@/lib/api-types";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Modal } from "@/components/admin/Modal";
import {
  btnGhost,
  btnIconDanger,
  btnIconEdit,
  btnPrimary,
  cardClass,
  inputClass,
  labelClass,
} from "@/components/admin/styles";

interface PromotionManagerProps {
  promotions: Promotion[];
}

type Editing = { mode: "create" } | { mode: "edit"; promotion: Promotion } | null;

export function PromotionManager({ promotions }: PromotionManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [deleting, setDeleting] = useState<Promotion | null>(null);
  const [busyDelete, setBusyDelete] = useState(false);

  async function confirmDelete() {
    if (!deleting) return;
    setBusyDelete(true);
    try {
      await apiJson(`/promotions/${deleting.id}`, "DELETE");
      toast.success("Promotion deleted");
      setDeleting(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err, "Failed to delete promotion").join(", "));
    } finally {
      setBusyDelete(false);
    }
  }

  function getStatusBadge(promo: Promotion) {
    if (!promo.active) {
      return <span className="rounded-full bg-rose px-2.5 py-0.5 text-xs font-medium text-muted">Inactive</span>;
    }
    const now = new Date();
    const start = new Date(promo.startsAt);
    const end = new Date(promo.endsAt);

    if (now < start) {
      return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">Upcoming</span>;
    }
    if (now > end) {
      return <span className="rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-medium text-stone-600">Expired</span>;
    }
    return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">Live now</span>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-text">Promotions</h1>
          <p className="mt-1 text-sm text-muted">
            Configure sitewide discount campaigns and flash sales
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ mode: "create" })}
          className={btnPrimary}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>New promotion</span>
        </button>
      </div>

      {promotions.length === 0 ? (
        <p className={`${cardClass} mt-6 p-8 text-center text-sm text-muted`}>
          No promotions configured yet. Create a promotion to apply sitewide discounts.
        </p>
      ) : (
        <div className={`${cardClass} mt-6 overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Campaign</th>
                <th scope="col" className="px-4 py-3 font-medium">Discount</th>
                <th scope="col" className="px-4 py-3 font-medium">Schedule</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((promo) => (
                <tr key={promo.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-semibold text-text">
                    {promo.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-sage-tint px-2.5 py-1 text-xs font-bold text-sage-dark">
                      {promo.discountPercent}% OFF
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                    <div>
                      Starts: {new Date(promo.startsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                    <div>
                      Ends: {new Date(promo.endsAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(promo)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Edit promotion"
                        aria-label="Edit promotion"
                        onClick={() => setEditing({ mode: "edit", promotion: promo })}
                        className={btnIconEdit}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        title="Delete promotion"
                        aria-label="Delete promotion"
                        onClick={() => setDeleting(promo)}
                        className={btnIconDanger}
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
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={editing !== null}
        title={editing?.mode === "edit" ? "Edit promotion" : "New promotion"}
        onClose={() => setEditing(null)}
      >
        {editing && (
          <PromotionForm
            key={editing.mode === "edit" ? editing.promotion.id : "new"}
            promotion={editing.mode === "edit" ? editing.promotion : undefined}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleting !== null}
        title="Delete promotion?"
        message={
          <>
            Are you sure you want to delete campaign <strong>{deleting?.name}</strong>?
          </>
        }
        confirmLabel="Delete promotion"
        busy={busyDelete}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}

interface PromotionFormProps {
  promotion?: Promotion;
  onCancel: () => void;
  onSaved: () => void;
}

function PromotionForm({ promotion, onCancel, onSaved }: PromotionFormProps) {
  const [name, setName] = useState(promotion?.name ?? "");
  const [discountPercent, setDiscountPercent] = useState(String(promotion?.discountPercent ?? 15));
  // Format start date as YYYY-MM-DD
  const defaultDate = promotion
    ? new Date(promotion.startsAt).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];
  const [startsAt, setStartsAt] = useState(defaultDate);
  // Calculate existing duration in days
  const defaultDuration = promotion
    ? Math.max(1, Math.round((new Date(promotion.endsAt).getTime() - new Date(promotion.startsAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 3;
  const [durationDays, setDurationDays] = useState(String(defaultDuration));
  const [active, setActive] = useState(promotion?.active ?? true);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);

    const payload = {
      name: name.trim(),
      discountPercent: Number(discountPercent),
      startsAt: new Date(startsAt).toISOString(),
      durationDays: Number(durationDays),
      active,
    };

    try {
      if (promotion) {
        await apiJson(`/promotions/${promotion.id}`, "PATCH", payload);
        toast.success("Promotion updated");
      } else {
        await apiJson("/promotions", "POST", payload);
        toast.success("Promotion created");
      }
      onSaved();
    } catch (err) {
      setErrors(errorMessages(err));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="promo-name" className={labelClass}>
          Promotion Name *
        </label>
        <input
          id="promo-name"
          required
          autoFocus
          value={name}
          placeholder="e.g. Victory Day Flash Sale"
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="promo-discount" className={labelClass}>
            Discount Percentage (1-100%) *
          </label>
          <div className="relative">
            <input
              id="promo-discount"
              type="number"
              min={1}
              max={100}
              required
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              className={inputClass}
            />
            <span className="absolute right-3.5 top-2.5 text-sm text-muted">%</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="promo-duration" className={labelClass}>
            Duration (in days) *
          </label>
          <input
            id="promo-duration"
            type="number"
            min={1}
            step={1}
            required
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 items-center">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="promo-starts-at" className={labelClass}>
            Start Date *
          </label>
          <input
            id="promo-starts-at"
            type="date"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className={inputClass}
          />
        </div>

        <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-sage"
          />
          Active promotion
        </label>
      </div>

      {errors.length > 0 && (
        <ul role="alert" className="list-disc pl-5 text-sm text-danger">
          {errors.map((msg) => (
            <li key={msg}>{msg}</li>
          ))}
        </ul>
      )}

      <div className="mt-2 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? "Saving..." : promotion ? "Save changes" : "Create promotion"}
        </button>
      </div>
    </form>
  );
}
