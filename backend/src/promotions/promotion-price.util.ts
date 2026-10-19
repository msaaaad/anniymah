export interface ActivePromotion {
  discountPercent: number;
}

// Rounds to the nearest whole taka — every price in this app is a plain
// integer, no decimals.
export function applyDiscount(price: number, promotion: ActivePromotion | null): number {
  if (!promotion) return price;
  return Math.round(price * (1 - promotion.discountPercent / 100));
}
