import Link from "next/link";
import { Pagination } from "@/components/admin/Pagination";
import { TrashTable } from "@/components/admin/TrashTable";
import { btnGhost } from "@/components/admin/styles";
import { serverFetch } from "@/lib/api-server";
import type { Category, Paginated } from "@/lib/api-types";

export const metadata = { title: "Category trash · Anniymah Admin" };

export default async function CategoryTrashPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await serverFetch<Paginated<Category>>(`/categories/trash?page=${page}&limit=20`);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Category trash</h1>
        <Link href="/admin/categories" className={btnGhost}>
          Back to categories
        </Link>
      </div>
      <TrashTable
        endpoint="/categories"
        noun="Category"
        rows={result.data.map((c) => ({ id: c.id, title: c.name, subtitle: c.slug, deletedAt: c.deletedAt }))}
      />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        hrefFor={(p) => `/admin/categories/trash?page=${p}`}
      />
    </>
  );
}
