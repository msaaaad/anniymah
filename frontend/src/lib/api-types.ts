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
  stock: number | null;
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
  stock: number | null;
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

export interface HeroBanner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardAnalytics {
  revenue: {
    total: number;
    thisMonth: number;
  };
  ordersByStatus: Record<OrderStatus, number>;
  totalOrders: number;
  topProductsSource: "sales" | "latest";
  topProducts: Array<{
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  salesOverTime: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  stock: {
    lowStockThreshold: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

export interface ThemeColors {
  bg: string;
  surface: string;
  sage: string;
  sageDark: string;
  sageTint: string;
  rose: string;
  roseDark: string;
  roseTint: string;
  text: string;
  muted: string;
  border: string;
  mediaBg: string;
}

export interface ThemeColorDefault {
  key: keyof ThemeColors;
  defaultColor: string;
  usage: string;
}

export interface StoreSettings {
  id: number;
  defaultDeliveryChargeInsideDhaka: number;
  defaultDeliveryChargeOutsideDhaka: number;
  whatsappNumber: string;
  contactPhone: string;
  contactEmail: string;
  contactAddress: string;
  announcementText: string;
  announcementActive: boolean;
  lowStockThreshold: number;
  themeColors: ThemeColors;
  updatedAt: string;
}

export interface Customer {
  id: string;
  phone: string;
  email: string | null;
  name: string;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface LandingPageItem {
  [key: string]: unknown;
}

export interface LandingPageAdmin {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  regularPrice: number;
  phone: string;
  imageUrl: string;
  collectionEnabled: boolean;
  collectionTitle: string;
  collectionItems: LandingPageItem[];
  featuresEnabled: boolean;
  featuresTitle: string;
  featuresSubtitle: string;
  features: LandingPageItem[];
  shippingBarEnabled: boolean;
  shippingBarItems: LandingPageItem[];
  freeDelivery: boolean;
  deliveryChargeInsideDhaka: number;
  deliveryChargeOutsideDhaka: number;
  createdAt: string;
  updatedAt: string;
}

export interface LandingPagePayload {
  slug: string;
  title?: string;
  description?: string;
  price?: number;
  regularPrice?: number;
  phone?: string;
  imageUrl?: string;
  collectionEnabled?: boolean;
  collectionTitle?: string;
  collectionItems?: LandingPageItem[];
  featuresEnabled?: boolean;
  featuresTitle?: string;
  featuresSubtitle?: string;
  features?: LandingPageItem[];
  shippingBarEnabled?: boolean;
  shippingBarItems?: LandingPageItem[];
  freeDelivery?: boolean;
  deliveryChargeInsideDhaka?: number;
  deliveryChargeOutsideDhaka?: number;
}
