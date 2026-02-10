export interface BundleTier {
  minItems: number;
  discountPercent: number;
  name: string;
}

export const BUNDLE_TIERS: BundleTier[] = [
  { minItems: 2, discountPercent: 10, name: 'Starter' },
  { minItems: 3, discountPercent: 15, name: 'Value' },
  { minItems: 4, discountPercent: 20, name: 'Pro' },
  { minItems: 5, discountPercent: 25, name: 'Ultimate' },
];

export interface BundlePricingResult {
  totalRetailPrice: number;
  bundlePrice: number;
  savings: number;
  discountPercentage: number;
  tierApplied: BundleTier;
  nextTier: BundleTier | null;
  itemsToNextTier: number;
}

export interface BundleSuggestion {
  productId: string;
  reason: string;
  source: 'ai' | 'collaborative';
  projectedBundlePrice?: number;
  projectedSavings?: number;
}
