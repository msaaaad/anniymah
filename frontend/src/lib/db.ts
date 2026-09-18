import { getSupabaseAdmin } from "@/lib/supabase";
import { MAX_LANDING_PAGES, type LandingPage, type Order, type OrderStatus } from "@/lib/types";

export class LandingPageLimitError extends Error {
  constructor() {
    super(`You can only have up to ${MAX_LANDING_PAGES} landing pages.`);
    this.name = "LandingPageLimitError";
  }
}

interface LandingPageRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  phone: string;
  image_url: string;
  part2_enabled: boolean;
  part2_title: string;
  part2_text: string;
  part2_image_url: string;
  created_at: string;
  updated_at: string;
}

interface OrderRow {
  id: string;
  landing_page_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  quantity: number;
  unit_price: number;
  total: number;
  notes: string;
  status: OrderStatus;
  created_at: string;
  confirmed_at: string | null;
  landing_pages: { slug: string } | { slug: string }[] | null;
}

function toLandingPage(row: LandingPageRow): LandingPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: row.price,
    phone: row.phone,
    imageUrl: row.image_url,
    part2Enabled: row.part2_enabled,
    part2Title: row.part2_title,
    part2Text: row.part2_text,
    part2ImageUrl: row.part2_image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOrder(row: OrderRow): Order {
  const joined = Array.isArray(row.landing_pages) ? row.landing_pages[0] : row.landing_pages;
  return {
    id: row.id,
    landingPageId: row.landing_page_id,
    landingPageSlug: joined?.slug ?? null,
    customerName: row.customer_name,
    phone: row.phone,
    address: row.address,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    total: row.total,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    confirmedAt: row.confirmed_at,
  };
}

export async function listLandingPages(): Promise<LandingPage[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("landing_pages")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Failed to load landing pages: ${error.message}`);
  return (data as LandingPageRow[]).map(toLandingPage);
}

export async function getLandingPageById(id: string): Promise<LandingPage | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("landing_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load landing page: ${error.message}`);
  return data ? toLandingPage(data as LandingPageRow) : null;
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("landing_pages")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load landing page: ${error.message}`);
  return data ? toLandingPage(data as LandingPageRow) : null;
}

type LandingPageInput = Omit<LandingPage, "id" | "createdAt" | "updatedAt">;

function toRowPatch(patch: Partial<LandingPageInput>) {
  return {
    ...(patch.slug !== undefined && { slug: patch.slug }),
    ...(patch.title !== undefined && { title: patch.title }),
    ...(patch.description !== undefined && { description: patch.description }),
    ...(patch.price !== undefined && { price: patch.price }),
    ...(patch.phone !== undefined && { phone: patch.phone }),
    ...(patch.imageUrl !== undefined && { image_url: patch.imageUrl }),
    ...(patch.part2Enabled !== undefined && { part2_enabled: patch.part2Enabled }),
    ...(patch.part2Title !== undefined && { part2_title: patch.part2Title }),
    ...(patch.part2Text !== undefined && { part2_text: patch.part2Text }),
    ...(patch.part2ImageUrl !== undefined && { part2_image_url: patch.part2ImageUrl }),
  };
}

export async function createLandingPage(input: LandingPageInput): Promise<LandingPage> {
  const supabase = getSupabaseAdmin();
  const { count, error: countError } = await supabase
    .from("landing_pages")
    .select("*", { count: "exact", head: true });
  if (countError) throw new Error(`Failed to check page count: ${countError.message}`);
  if ((count ?? 0) >= MAX_LANDING_PAGES) throw new LandingPageLimitError();

  const { data, error } = await supabase
    .from("landing_pages")
    .insert({
      slug: input.slug,
      title: input.title,
      description: input.description,
      price: input.price,
      phone: input.phone,
      image_url: input.imageUrl,
      part2_enabled: input.part2Enabled,
      part2_title: input.part2Title,
      part2_text: input.part2Text,
      part2_image_url: input.part2ImageUrl,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create landing page: ${error.message}`);
  return toLandingPage(data as LandingPageRow);
}

export async function updateLandingPage(
  id: string,
  patch: Partial<LandingPageInput>
): Promise<LandingPage | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("landing_pages")
    .update({ ...toRowPatch(patch), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(`Failed to update landing page: ${error.message}`);
  return data ? toLandingPage(data as LandingPageRow) : null;
}

export async function deleteLandingPage(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("landing_pages").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete landing page: ${error.message}`);
}

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("*, landing_pages(slug)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load orders: ${error.message}`);
  return (data as OrderRow[]).map(toOrder);
}

export async function createOrder(
  input: Pick<Order, "customerName" | "phone" | "address" | "quantity" | "notes"> & {
    landingPageId: string;
  }
): Promise<Order> {
  const page = await getLandingPageById(input.landingPageId);
  if (!page) throw new Error("Landing page not found");

  const unitPrice = page.price;
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .insert({
      landing_page_id: input.landingPageId,
      customer_name: input.customerName,
      phone: input.phone,
      address: input.address,
      quantity: input.quantity,
      unit_price: unitPrice,
      total: unitPrice * input.quantity,
      notes: input.notes,
      status: "pending",
    })
    .select("*, landing_pages(slug)")
    .single();
  if (error) throw new Error(`Failed to create order: ${error.message}`);
  return toOrder(data as OrderRow);
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<Order | null> {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .update({
      status,
      ...(status === "confirmed" && { confirmed_at: new Date().toISOString() }),
    })
    .eq("id", id)
    .select("*, landing_pages(slug)")
    .maybeSingle();
  if (error) throw new Error(`Failed to update order: ${error.message}`);
  return data ? toOrder(data as OrderRow) : null;
}
