// =============================================================================
// Analytics & Recommendations Types
// =============================================================================
// Frontend types for the Analytics, Reporting & Revenue Intelligence module.

// -----------------------------------------------------------------------------
// Product Badges
// -----------------------------------------------------------------------------

export type ProductBadge = "trending" | "bestseller" | "new" | "hot";

// -----------------------------------------------------------------------------
// Product Recommendation
// -----------------------------------------------------------------------------

export interface ProductRecommendation {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  featuredImage?: string;
  averageRating?: number;
  totalReviews?: number;
  category?: string;
  badges: ProductBadge[];
}

// -----------------------------------------------------------------------------
// Trending Product
// -----------------------------------------------------------------------------

export interface TrendingProduct extends ProductRecommendation {
  viewVelocity: number;
  rank: number;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface RecommendationsResponse {
  frequentlyBoughtTogether: ProductRecommendation[];
  customersAlsoViewed: ProductRecommendation[];
}

export interface TrendingResponse {
  items: TrendingProduct[];
}

export interface BadgesResponse {
  badges: ProductBadge[];
}

// -----------------------------------------------------------------------------
// View Tracking
// -----------------------------------------------------------------------------

export interface ViewEventPayload {
  digitalProductId: string;
  sessionId: string;
  source: string;
  referrer?: string;
  deviceType: string;
  browser: string;
}
