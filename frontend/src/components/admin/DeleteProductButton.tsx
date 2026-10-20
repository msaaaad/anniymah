"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { btnLink } from "@/components/admin/styles";

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
      <button type="button" className={btnLink} onClick={() => setOpen(true)}>
        Delete
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
