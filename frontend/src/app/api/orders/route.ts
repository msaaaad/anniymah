import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await listOrders();
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Honeypot: a hidden field real customers never fill in. Bots that
  // auto-fill every field trip it; pretend success so they don't retry.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  const landingPageId = typeof body.landingPageId === "string" ? body.landingPageId : "";
  const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";
  const quantity = Number(body.quantity) || 1;
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!landingPageId) {
    return NextResponse.json({ error: "Missing landing page" }, { status: 400 });
  }
  if (!customerName || !phone || !address) {
    return NextResponse.json(
      { error: "Name, phone, and address are required" },
      { status: 400 }
    );
  }
  if (quantity < 1 || quantity > 20) {
    return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
  }

  try {
    const order = await createOrder({ landingPageId, customerName, phone, address, quantity, notes });
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Landing page not found" }, { status: 400 });
  }
}
