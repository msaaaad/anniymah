import { serverFetch } from "@/lib/api-server";
import type { Customer, Paginated } from "@/lib/api-types";
import { CustomerManager } from "@/components/admin/CustomerManager";

export const metadata = { title: "Customers · Anniymah Admin" };

interface CustomersPageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  query.set("page", String(page));
  query.set("limit", "20");

  let result: Paginated<Customer>;
  try {
    result = await serverFetch<Paginated<Customer>>(`/customers?${query.toString()}`);
  } catch {
    result = {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }

  return (
    <CustomerManager
      customers={result.data}
      currentSearch={search}
      page={result.page}
      totalPages={result.totalPages}
      total={result.total}
    />
  );
}
