import { NextRequest, NextResponse } from "next/server";
import { createLandingPage, LandingPageLimitError, listLandingPages } from "@/lib/db";
import { parseCollectionItems, parseFeatures, parseShippingBarItems } from "@/lib/sections";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { isValidSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pages = await listLandingPages();
  return NextResponse.json(pages);
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { error: "Slug must be lowercase letters, numbers, and hyphens only" },
      { status: 400 }
    );
  }

  try {
    const page = await createLandingPage({
      slug,
      title: String(body.title ?? ""),
      description: String(body.description ?? ""),
      price: Number(body.price) || 0,
      regularPrice: Math.max(0, Number(body.regularPrice) || 0),
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
      shippingBarItems: parseShippingBarItems(body.shippingBarItems),
      freeDelivery: body.freeDelivery !== false,
      deliveryChargeInsideDhaka: Math.max(0, Number(body.deliveryChargeInsideDhaka) || 0),
      deliveryChargeOutsideDhaka: Math.max(0, Number(body.deliveryChargeOutsideDhaka) || 0),
    });
    return NextResponse.json(page, { status: 201 });
  } catch (err) {
    if (err instanceof LandingPageLimitError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to create landing page";
    const status = message.includes("duplicate key") ? 409 : 500;
    return NextResponse.json(
      { error: status === 409 ? "That slug is already in use" : message },
      { status }
    );
  }
}
