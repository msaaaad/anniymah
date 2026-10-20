import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { parseErrorBody } from "@/lib/api-error";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

export async function serverFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  if (res.status === 401) redirect("/admin/login");
  if (!res.ok) {
    throw parseErrorBody(res.status, await res.json().catch(() => null));
  }
  return (await res.json()) as T;
}

export async function hasValidAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const res = await fetch(`${BACKEND_URL}/auth/me`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });
  return res.ok;
}
