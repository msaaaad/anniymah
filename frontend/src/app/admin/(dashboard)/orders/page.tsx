import { OrderManager } from "@/components/admin/OrderManager";
import { serverFetch } from "@/lib/api-server";
import type { Order, Paginated } from "@/lib/api-types";

export const metadata = { title: "Orders · Anniymah Admin" };

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.status?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status && status !== "all") query.set("status", status);
  if (page > 1) query.set("page", String(page));

  const queryString = query.toString();
  const result = await serverFetch<Paginated<Order>>(`/orders${queryString ? `?${queryString}` : ""}`);

  return (
    <OrderManager
      orders={result.data}
      currentSearch={search}
      currentStatus={status}
      page={result.page}
      totalPages={result.totalPages}
      total={result.total}
    />
  );
}
