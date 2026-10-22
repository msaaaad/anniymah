"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { btnGhost, btnIconDanger, cardClass } from "@/components/admin/styles";

export interface TrashRow {
  id: string;
  title: string;
  subtitle: string;
  deletedAt: string | null;
  thumbnailUrl?: string;
}

interface TrashTableProps {
  rows: TrashRow[];
  endpoint: "/categories" | "/products";
  noun: string;
}

export function TrashTable({ rows, endpoint, noun }: TrashTableProps) {
  const router = useRouter();
  const [purging, setPurging] = useState<TrashRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function restore(row: TrashRow) {
    setBusyId(row.id);
    try {
      await apiJson(`${endpoint}/trash/${row.id}/restore`, "POST");
      toast.success(`"${row.title}" restored`);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join(", "));
    } finally {
      setBusyId(null);
    }
  }

  async function purge() {
    if (!purging) return;
    setBusyId(purging.id);
    try {
      await apiJson(`${endpoint}/trash/${purging.id}`, "DELETE");
      toast.success(`"${purging.title}" permanently deleted`);
      setPurging(null);
      router.refresh();
    } catch (err) {
      toast.error(errorMessages(err).join(", "));
    } finally {
      setBusyId(null);
    }
  }

  if (rows.length === 0) {
    return <p className={`${cardClass} mt-6 p-8 text-center text-sm text-muted`}>The trash is empty.</p>;
  }

  return (
    <>
      <div className={`${cardClass} mt-6 overflow-x-auto`}>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-[13px] text-muted">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                {noun}
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Deleted
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element -- remote storage URL, not worth next/image config
                      <img src={row.thumbnailUrl} alt="" className="h-10 w-10 rounded-md bg-media-bg object-cover" />
                    )}
                    <div>
                      <div className="font-medium">{row.title}</div>
                      <div className="text-xs text-muted">{row.subtitle}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">
                  {row.deletedAt ? new Date(row.deletedAt).toLocaleString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-1.5 rounded-[8px] border border-border bg-surface px-3 py-1.5 text-xs sm:text-sm font-medium text-text shadow-2xs transition-colors hover:border-sage hover:text-sage-dark hover:bg-sage-tint/40 disabled:opacity-50"
                      disabled={busyId === row.id}
                      onClick={() => restore(row)}
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      title="Delete permanently"
                      aria-label="Delete permanently"
                      className={btnIconDanger}
                      disabled={busyId === row.id}
                      onClick={() => setPurging(row)}
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

      <ConfirmDialog
        open={purging !== null}
        title="Delete permanently?"
        message={
          <>
            <strong>{purging?.title}</strong> will be deleted for good. This cannot be undone.
          </>
        }
        confirmLabel="Delete forever"
        busy={busyId !== null}
        onConfirm={purge}
        onCancel={() => setPurging(null)}
      />
    </>
  );
}
