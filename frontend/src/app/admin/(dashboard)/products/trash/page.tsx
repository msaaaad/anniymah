import Link from "next/link";
import { Pagination } from "@/components/admin/Pagination";
import { TrashTable } from "@/components/admin/TrashTable";
import { btnGhost } from "@/components/admin/styles";
import { serverFetch } from "@/lib/api-server";
import type { Paginated, Product } from "@/lib/api-types";

export const metadata = { title: "Product trash · Anniymah Admin" };

export default async function ProductTrashPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await serverFetch<Paginated<Product>>(`/products/trash?page=${page}&limit=20`);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Product trash</h1>
        <Link href="/admin/products" className={btnGhost}>
          Back to products
        </Link>
      </div>
      <TrashTable
        endpoint="/products"
        noun="Product"
        rows={result.data.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: p.slug,
          deletedAt: p.deletedAt,
          thumbnailUrl: p.images[0]?.url,
        }))}
      />
      <Pagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        hrefFor={(p) => `/admin/products/trash?page=${p}`}
      />
    </>
  );
}
