import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ApiError } from "@/lib/api-error";
import { serverFetch } from "@/lib/api-server";
import type { Category, Product } from "@/lib/api-types";

export const metadata = { title: "Edit product · Anniymah Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [product, categories] = await Promise.all([
    serverFetch<Product>(`/products/${encodeURIComponent(slug)}`).catch((err: unknown) => {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }),
    serverFetch<Category[]>("/categories"),
  ]);

  if (!product) notFound();
  return <ProductForm key={product.id} categories={categories} product={product} />;
}
