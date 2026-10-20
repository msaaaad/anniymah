import { PromotionManager } from "@/components/admin/PromotionManager";
import { serverFetch } from "@/lib/api-server";
import type { Promotion } from "@/lib/api-types";

export const metadata = { title: "Promotions · Anniymah Admin" };

export default async function PromotionsPage() {
  const promotions = await serverFetch<Promotion[]>("/promotions");
  return <PromotionManager promotions={promotions} />;
}
