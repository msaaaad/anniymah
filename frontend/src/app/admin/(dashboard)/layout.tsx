import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminShell } from "@/components/admin/AdminShell";
import { BACKEND_URL } from "@/lib/api-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) redirect("/admin/login");
  const { email } = (await res.json()) as { email?: string };

  return <AdminShell email={email}>{children}</AdminShell>;
}
