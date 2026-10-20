import Link from "next/link";
import { btnGhost } from "@/components/admin/styles";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  hrefFor: (page: number) => string;
}

export function Pagination({ page, totalPages, total, hrefFor }: PaginationProps) {
  if (totalPages <= 1) {
    return <p className="mt-4 text-sm text-muted">{total} total</p>;
  }
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} className={btnGhost}>
            Previous
          </Link>
        ) : (
          <span className={`${btnGhost} opacity-50`} aria-disabled="true">
            Previous
          </span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} className={btnGhost}>
            Next
          </Link>
        ) : (
          <span className={`${btnGhost} opacity-50`} aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
