import { NextRequest, NextResponse } from "next/server";
import { deleteLandingPage, getLandingPageById, updateLandingPage } from "@/lib/db";
import { parseCollectionItems, parseFeatures } from "@/lib/sections";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { isValidSlug } from "@/lib/slug";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const page = await getLandingPageById(id);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers, and hyphens only" },
      { status: 400 }
    );
  }

  try {
    const page = await updateLandingPage(id, {
      slug,
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      price: Number(body.price) || 0,
      phone: String(body.phone ?? ""),
      imageUrl: String(body.imageUrl ?? ""),
      collectionEnabled: Boolean(body.collectionEnabled),
      collectionTitle: String(body.collectionTitle ?? ""),
      collectionItems: parseCollectionItems(body.collectionItems),
      featuresEnabled: Boolean(body.featuresEnabled),
      featuresTitle: String(body.featuresTitle ?? ""),
      featuresSubtitle: String(body.featuresSubtitle ?? ""),
      features: parseFeatures(body.features),
      shippingBarEnabled: Boolean(body.shippingBarEnabled),
      shippingBarText: String(body.shippingBarText ?? ""),
      freeDelivery: body.freeDelivery !== false,
      deliveryChargeInsideDhaka: Math.max(0, Number(body.deliveryChargeInsideDhaka) || 0),
      deliveryChargeOutsideDhaka: Math.max(0, Number(body.deliveryChargeOutsideDhaka) || 0),
    });
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(page);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update landing page";
    const status = message.includes("duplicate key") ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "That slug is already in use" : message },
      { status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteLandingPage(id);
  return NextResponse.json({ ok: true });
}
