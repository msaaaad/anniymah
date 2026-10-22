import { serverFetch } from "@/lib/api-server";
import type { LandingPageAdmin } from "@/lib/api-types";
import { LandingPageManager } from "@/components/admin/LandingPageManager";

export const metadata = { title: "Landing Pages · Anniymah Admin" };

export default async function LandingPagesAdminPage() {
  let pages: LandingPageAdmin[] = [];
  try {
    pages = await serverFetch<LandingPageAdmin[]>("/landing-pages");
  } catch {
    pages = [];
  }

  return <LandingPageManager pages={pages} />;
}
