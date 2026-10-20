"use client";

import { Modal } from "@/components/admin/Modal";
import { btnDanger, btnGhost } from "@/components/admin/styles";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel, busy, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className={btnGhost} disabled={busy}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} className={btnDanger} disabled={busy}>
          {busy ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
