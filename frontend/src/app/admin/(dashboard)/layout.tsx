import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminNav } from "@/components/admin/AdminNav";
import { BACKEND_URL } from "@/lib/api-server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  if (!res.ok) redirect("/admin/login");
  const { email } = (await res.json()) as { email?: string };

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg">
      <AdminNav email={email} />
      <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-[28px] sm:py-8">{children}</main>
    </div>
  );
}
