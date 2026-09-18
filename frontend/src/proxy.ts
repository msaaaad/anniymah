import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const authorized = await verifySessionToken(token);

  if (pathname === "/admin/login") {
    if (authorized) {
      return NextResponse.redirect(new URL("/admin/landing", request.url));
    }
    return NextResponse.next();
  }

  if (!authorized) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
