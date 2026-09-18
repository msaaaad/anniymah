import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { CollectionItem, DeliveryZone, FeatureItem, OrderStatus } from "@/lib/types";

// These must be `type` aliases, not `interface` — postgrest-js's generic
// inference for .insert()/.update() silently collapses to `never` when an
// `interface` is plugged into the Database schema shape (a real, reproduced
// quirk of how it resolves the Row/Insert/Update generics; plain object
// type aliases resolve correctly).
type LandingPageRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  regular_price: number;
  phone: string;
  image_url: string;
  collection_enabled: boolean;
  collection_title: string;
  collection_items: CollectionItem[];
  features_enabled: boolean;
  features_title: string;
  features_subtitle: string;
  features: FeatureItem[];
  shipping_bar_enabled: boolean;
  shipping_bar_items: string[];
  free_delivery: boolean;
  delivery_charge_inside_dhaka: number;
  delivery_charge_outside_dhaka: number;
  created_at: string;
  updated_at: string;
};

type OrderRow = {
  id: string;
  landing_page_id: string | null;
  customer_name: string;
  phone: string;
  address: string;
  quantity: number;
  unit_price: number;
  delivery_zone: DeliveryZone | null;
  delivery_charge: number;
  total: number;
  notes: string;
  status: OrderStatus;
  courier_tracking_id: string | null;
  created_at: string;
  confirmed_at: string | null;
};

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface Database {
  public: {
    Tables: {
      landing_pages: {
        Row: LandingPageRow;
        Insert: Optional<LandingPageRow, "id" | "created_at" | "updated_at">;
        Update: Partial<LandingPageRow>;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: Optional<
          OrderRow,
          "id" | "created_at" | "confirmed_at" | "courier_tracking_id" | "status"
        >;
        Update: Partial<OrderRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// Server-only client using the service_role key, which bypasses RLS.
// Every caller of this module is already behind the app's own admin
// session check (or is public data by design, like the landing page GET
// and order INSERT) — RLS on the tables is a defense-in-depth backstop,
// not the primary access control here.
let client: SupabaseClient<Database> | null = null;

export function getSupabaseAdmin() {
  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
