"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { btnIconDanger } from "@/components/admin/styles";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await apiJson(`/products/${id}`, "DELETE");
      toast.success(`"${name}" moved to trash`);
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join(", "));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        title="Delete product"
        aria-label="Delete product"
        className={btnIconDanger}
        onClick={() => setOpen(true)}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
      <ConfirmDialog
        open={open}
        title="Move to trash?"
        message={
          <>
            <strong>{name}</strong> will be moved to the trash. You can restore it later.
          </>
        }
        confirmLabel="Move to trash"
        busy={busy}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
