import { CategoryManager } from "@/components/admin/CategoryManager";
import { serverFetch } from "@/lib/api-server";
import type { Category } from "@/lib/api-types";

export const metadata = { title: "Categories · Anniymah Admin" };

export default async function CategoriesPage() {
  const categories = await serverFetch<Category[]>("/categories");
  return <CategoryManager categories={categories} />;
}
