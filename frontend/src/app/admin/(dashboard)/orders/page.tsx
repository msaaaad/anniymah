import { OrderManager } from "@/components/admin/OrderManager";
import { serverFetch } from "@/lib/api-server";
import type { Order } from "@/lib/api-types";

export const metadata = { title: "Orders · Anniymah Admin" };

interface OrdersPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const status = params.status?.trim() ?? "";

  const query = new URLSearchParams();
  if (search) query.set("search", search);
  if (status) query.set("status", status);

  const queryString = query.toString();
  const orders = await serverFetch<Order[]>(`/orders${queryString ? `?${queryString}` : ""}`);

  return (
    <OrderManager
      orders={orders}
      currentSearch={search}
      currentStatus={status}
    />
  );
}
