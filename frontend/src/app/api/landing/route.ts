import { NextRequest, NextResponse } from "next/server";
import { getLandingPage, updateLandingPage } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function GET() {
  const landingPage = await getLandingPage();
  return NextResponse.json(landingPage);
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const patch = {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    price: Number(body.price) || 0,
    phone: String(body.phone ?? ""),
    imageUrl: String(body.imageUrl ?? ""),
    part2Enabled: Boolean(body.part2Enabled),
    part2Title: String(body.part2Title ?? ""),
    part2Text: String(body.part2Text ?? ""),
    part2ImageUrl: String(body.part2ImageUrl ?? ""),
  };

  const landingPage = await updateLandingPage(patch);
  return NextResponse.json(landingPage);
}
