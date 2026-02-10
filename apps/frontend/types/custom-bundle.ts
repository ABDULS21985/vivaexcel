import type { DigitalProduct } from "./digital-product";

// =============================================================================
// Custom Bundle Types
// =============================================================================

export interface CustomBundle {
  id: string;
  productIds: string[];
  products?: DigitalProduct[];
  totalRetailPrice: number;
  bundlePrice: number;
  savings: number;
  discountPercentage: number;
  discountTier: number;
  status: "draft" | "active" | "purchased";
  shareToken?: string;
  couponCode?: string;
  name?: string;
  nextTier?: BundleNextTier | null;
  createdAt?: string;
}

export interface BundleNextTier {
  productsNeeded: number;
  discountPercent: number;
}

export interface BundleSuggestion {
  product: DigitalProduct;
  reason: string;
}

export interface BundleCheckoutResult {
  cartReady: boolean;
  couponCode: string;
  bundlePrice: number;
  savings: number;
}

// =============================================================================
// Tiered Pricing Constants (client-side preview)
// =============================================================================

export const BUNDLE_TIERS = [
  { minProducts: 2, discountPercent: 10 },
  { minProducts: 3, discountPercent: 15 },
  { minProducts: 4, discountPercent: 20 },
  { minProducts: 5, discountPercent: 25 },
] as const;

export function getBundleDiscountPercent(productCount: number): number {
  for (let i = BUNDLE_TIERS.length - 1; i >= 0; i--) {
    if (productCount >= BUNDLE_TIERS[i].minProducts) {
      return BUNDLE_TIERS[i].discountPercent;
    }
  }
  return 0;
}
