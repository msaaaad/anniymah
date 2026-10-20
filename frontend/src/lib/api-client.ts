import { parseErrorBody } from "@/lib/api-error";

const BASE = "/backend";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 401 && !path.startsWith("/auth/login")) {
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- plain module outside React, and a hard reload also clears cached server layouts
      window.location.href = "/admin/login";
    }
    throw parseErrorBody(res.status, body);
  }

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function apiJson<T = void>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown,
): Promise<T> {
  return apiRequest<T>(path, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
