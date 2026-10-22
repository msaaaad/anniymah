"use client";

import { useEffect, useRef } from "react";
import { btnGhost } from "@/components/admin/styles";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  busy?: boolean;
  variant?: "danger" | "warning" | "sage";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  busy,
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current && !busy) onCancel();
      }}
      className="fixed inset-0 z-50 m-auto w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-border bg-surface p-0 shadow-2xl backdrop:bg-black/45 backdrop:backdrop-blur-xs transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="p-6 text-center sm:p-7">
        {/* SweetAlert-style animated luxury icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
          {variant === "danger" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600 ring-8 ring-red-50">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          )}
          {variant === "warning" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-8 ring-amber-50">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          {variant === "sage" && (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-tint text-sage-dark ring-8 ring-sage-tint/40">
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
          )}
        </div>

        {/* Title & message */}
        <h3 className="font-heading text-lg font-bold text-text sm:text-xl">
          {title}
        </h3>
        <div className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
          {message}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={`${btnGhost} w-full sm:w-auto rounded-[10px] text-xs sm:text-sm py-2.5 px-4 font-medium`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-[10px] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-all disabled:opacity-60 ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-sage hover:bg-sage-dark"
            }`}
          >
            {busy ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
