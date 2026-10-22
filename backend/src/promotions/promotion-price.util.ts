export interface ActivePromotion {
  discountPercent: number;
}

export function applyDiscount(price: number, promotion: ActivePromotion | null): number {
  if (!promotion) return price;
  return Math.round(price * (1 - promotion.discountPercent / 100));
}
