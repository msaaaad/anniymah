import { ProductForm } from "@/components/admin/ProductForm";
import { serverFetch } from "@/lib/api-server";
import type { Category } from "@/lib/api-types";

export const metadata = { title: "New product · Anniymah Admin" };

export default async function NewProductPage() {
  const categories = await serverFetch<Category[]>("/categories");
  return <ProductForm categories={categories} />;
}
