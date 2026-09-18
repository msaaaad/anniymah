export type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

export interface LandingPage {
  id: number;
  title: string;
  description: string;
  price: number;
  phone: string;
  imageUrl: string;
  part2Enabled: boolean;
  part2Title: string;
  part2Text: string;
  part2ImageUrl: string;
  updatedAt: string;
}

export interface Order {
  id: string;
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

export interface Database {
  landingPage: LandingPage;
  orders: Order[];
}
