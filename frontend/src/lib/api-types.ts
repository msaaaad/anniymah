export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  position: number;
  createdAt: string;
}

export interface Product {
  id: string;
  categoryId: string | null;
  category: Category | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  regularPrice: number;
  freeDelivery: boolean;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  images: ProductImage[];
  effectivePrice?: number;
  activeDiscountPercent?: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const PRODUCT_SORTS = ["newest", "oldest", "price_asc", "price_desc"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const MAX_PRODUCT_IMAGES = 8;

export interface ProductPayload {
  name: string;
  slug: string;
  categoryId: string | null;
  description: string;
  price: number;
  regularPrice: number;
  freeDelivery: boolean;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  active: boolean;
  images: string[];
}

export const ORDER_STATUSES = ["pending", "confirmed", "delivered", "cancelled", "rejected"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type DeliveryZone = "inside_dhaka" | "outside_dhaka";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string | null;
  customerName: string;
  phone: string;
  address: string;
  deliveryZone: DeliveryZone | null;
  deliveryCharge: number;
  total: number;
  notes: string;
  status: OrderStatus;
  courierTrackingId: string | null;
  createdAt: string;
  confirmedAt: string | null;
  items: OrderItem[];
}
