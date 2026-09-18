export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled" | "rejected";

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
  total: number;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  confirmedAt: string | null;
}
