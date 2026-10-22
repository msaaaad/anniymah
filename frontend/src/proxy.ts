import { NextRequest, NextResponse } from "next/server";

const ADMIN_SESSION_COOKIE = "anniymah_admin_session";

// Optimistic check only: the cookie is signed by the API, so the real
// verification happens server-side in the dashboard layout via GET /auth/me.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(ADMIN_SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
