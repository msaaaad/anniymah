export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled" | "rejected";
export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export const MAX_LANDING_PAGES = 4;

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  phone: string;
  imageUrl: string;
  part2Enabled: boolean;
  part2Title: string;
  part2Text: string;
  part2ImageUrl: string;
  freeDelivery: boolean;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  landingPageId: string | null;
  landingPageSlug: string | null;
  customerName: string;
  phone: string;
  address: string;
  quantity: number;
  unitPrice: number;
  deliveryZone: DeliveryZone | null;
  deliveryCharge: number;
  total: number;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  confirmedAt: string | null;
}
