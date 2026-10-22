import { HeroBannerManager } from "@/components/admin/HeroBannerManager";
import { serverFetch } from "@/lib/api-server";
import type { HeroBanner } from "@/lib/api-types";

export const metadata = { title: "Hero Banners · Anniymah Admin" };

export default async function HeroBannersPage() {
  const banners = await serverFetch<HeroBanner[]>("/hero-banners");
  return <HeroBannerManager banners={banners} />;
}
