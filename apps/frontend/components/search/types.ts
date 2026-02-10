// =============================================================================
// Smart Search Types
// =============================================================================
// Type definitions for the AI-powered smart search system including
// search intent extraction, autocomplete items, and search results.

export interface SearchIntent {
  originalQuery: string;
  normalizedQuery: string;
  category?: string;
  productType?: string;
  priceRange?: { min?: number; max?: number };
  sortPreference?: string;
  features?: string[];
  correctedQuery?: string;
  isNaturalLanguage: boolean;
}

export interface SmartSearchResult {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
  type: string;
  relevanceScore: number;
}

export interface AutocompleteItem {
  text: string;
  type: "product" | "category" | "suggestion" | "recent";
  productId?: string;
  slug?: string;
  featuredImage?: string;
  price?: number;
}

export interface SmartSearchResponse {
  items: SmartSearchResult[];
  intent: SearchIntent;
  total: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  didYouMean?: string;
  relatedSearches: string[];
}
