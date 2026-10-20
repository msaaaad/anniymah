import Link from "next/link";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { Pagination } from "@/components/admin/Pagination";
import { btnGhost, btnLink, btnPrimary, cardClass, inputClass } from "@/components/admin/styles";
import { serverFetch } from "@/lib/api-server";
import { PRODUCT_SORTS, type Category, type Paginated, type Product, type ProductSort } from "@/lib/api-types";

export const metadata = { title: "Products · Anniymah Admin" };

const SORT_LABELS: Record<ProductSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

interface SearchParams {
  page?: string;
  search?: string;
  categoryId?: string;
  sort?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search?.trim() ?? "";
  const categoryId = params.categoryId ?? "";
  const sort = PRODUCT_SORTS.includes(params.sort as ProductSort) ? (params.sort as ProductSort) : "newest";

  const query = new URLSearchParams({ page: String(page), limit: "20", sort });
  if (search) query.set("search", search);
  if (categoryId) query.set("categoryId", categoryId);

  const [result, categories] = await Promise.all([
    serverFetch<Paginated<Product>>(`/products?${query}`),
    serverFetch<Category[]>("/categories"),
  ]);

  function hrefFor(target: number) {
    const next = new URLSearchParams({ page: String(target), sort });
    if (search) next.set("search", search);
    if (categoryId) next.set("categoryId", categoryId);
    return `/admin/products?${next}`;
  }

  const filtered = Boolean(search || categoryId);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-semibold">Products</h1>
        <div className="flex gap-3">
          <Link href="/admin/products/trash" className={btnGhost}>
            Trash
          </Link>
          <Link href="/admin/products/new" className={btnPrimary}>
            New product
          </Link>
        </div>
      </div>

      <form method="GET" action="/admin/products" className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search products"
          aria-label="Search products"
          className={inputClass}
        />
        <select name="categoryId" defaultValue={categoryId} aria-label="Filter by category" className={inputClass}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} aria-label="Sort products" className={inputClass}>
          {PRODUCT_SORTS.map((value) => (
            <option key={value} value={value}>
              {SORT_LABELS[value]}
            </option>
          ))}
        </select>
        <button type="submit" className={btnGhost}>
          Apply
        </button>
      </form>

      {result.data.length === 0 ? (
        <p className={`${cardClass} mt-6 p-8 text-center text-sm text-muted`}>
          {filtered ? "No products match your filters." : "No products yet. Create your first product."}
        </p>
      ) : (
        <div className={`${cardClass} mt-6 overflow-x-auto`}>
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-[13px] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Product
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Price
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-media-bg">
                        {product.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element -- remote storage URL, not worth next/image config
                          <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-sage-dark">৳{product.price}</span>
                    {product.regularPrice > product.price && (
                      <span className="ml-2 text-xs text-muted line-through">৳{product.regularPrice}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        product.active ? "bg-sage-tint text-sage-dark" : "bg-rose text-muted"
                      }`}
                    >
                      {product.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/products/${product.slug}/edit`} className={btnLink}>
                        Edit
                      </Link>
                      <DeleteProductButton id={product.id} name={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} total={result.total} hrefFor={hrefFor} />
    </>
  );
}
