import { redirect } from "next/navigation";
import { listLandingPages } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const pages = await listLandingPages();
  if (pages.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>
        No landing pages have been created yet.
      </div>
    );
  }
  redirect(`/p/${pages[0].slug}`);
}
