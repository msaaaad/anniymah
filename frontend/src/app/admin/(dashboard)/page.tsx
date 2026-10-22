import { serverFetch } from "@/lib/api-server";
import type { DashboardAnalytics } from "@/lib/api-types";
import { DashboardView } from "@/components/admin/DashboardView";

export const metadata = { title: "Dashboard · Anniymah Admin" };

interface SearchParams {
  days?: string;
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsedDays = Number(params.days);
  const days = [7, 14, 30, 90].includes(parsedDays) ? parsedDays : 30;

  let analyticsData: DashboardAnalytics;
  try {
    analyticsData = await serverFetch<DashboardAnalytics>(`/analytics/dashboard?days=${days}`);
  } catch {
    analyticsData = {
      revenue: { total: 0, thisMonth: 0 },
      ordersByStatus: { pending: 0, confirmed: 0, delivered: 0, cancelled: 0, rejected: 0 },
      totalOrders: 0,
      topProductsSource: "latest",
      topProducts: [],
      salesOverTime: [],
      stock: { lowStockThreshold: 5, lowStockCount: 0, outOfStockCount: 0 },
    };
  }

  return <DashboardView data={analyticsData} days={days} />;
}
