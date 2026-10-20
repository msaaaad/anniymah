"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client";
import { errorMessages } from "@/lib/api-error";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { btnDangerOutline, btnLink, cardClass } from "@/components/admin/styles";

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
                  <div className="flex justify-end gap-4">
                    <button type="button" className={btnLink} disabled={busyId === row.id} onClick={() => restore(row)}>
                      Restore
                    </button>
                    <button type="button" className={btnDangerOutline} disabled={busyId === row.id} onClick={() => setPurging(row)}>
                      Delete forever
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
