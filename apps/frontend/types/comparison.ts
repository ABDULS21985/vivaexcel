import type { DigitalProduct } from "./digital-product";

// =============================================================================
// Comparison Types
// =============================================================================

export interface ComparisonAttribute {
  name: string;
  key: string;
  values: (string | number | boolean | null)[];
  type: "price" | "rating" | "number" | "boolean" | "text";
}

export interface ComparisonHighlights {
  bestValue?: string;
  bestRated?: string;
  mostPopular?: string;
  recommendation?: string;
}

export interface ComparisonData {
  products: DigitalProduct[];
  attributes: ComparisonAttribute[];
  highlights: ComparisonHighlights;
  aiInsight?: string;
}

export interface ComparisonSet {
  id: string;
  productIds: string[];
  name?: string;
  createdAt: string;
  lastViewedAt?: string;
}
