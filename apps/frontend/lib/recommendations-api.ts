// =============================================================================
// Server-Side Recommendations API
// =============================================================================
// Utility for fetching recommendation data from the backend in Next.js server
// components. Uses plain fetch() with ISR caching -- NOT the client-side
// apiClient which relies on localStorage for JWT tokens.

import type {
  TrendingProduct,
  ProductRecommendation,
  ProductBadge,
  RecommendationsResponse,
} from "@/types/analytics";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Internal Helpers
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Generic fetcher that unwraps the standard API response wrapper
 * `{ status, message, data, meta }` and returns just the `data` portion.
 */
async function fetchApi<T>(
  endpoint: string,
  revalidate: number = 60,
): Promise<T | undefined> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[recommendations-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return undefined;
    }

    const json: ApiResponseWrapper<T> = await response.json();
    return json.data;
  } catch (error) {
    console.error(`[recommendations-api] GET ${endpoint} error:`, error);
    return undefined;
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch trending products with an optional limit.
 * Uses a short revalidation window (60s) since trending data changes frequently.
 */
export async function fetchTrending(
  limit: number = 10,
): Promise<TrendingProduct[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const data = await fetchApi<{ items: TrendingProduct[] }>(
    `/marketplace-analytics/trending?${params.toString()}`,
    60,
  );

  return data?.items ?? [];
}

/**
 * Fetch recommendations (FBT + also viewed) for a specific product.
 */
export async function fetchProductRecommendations(
  productId: string,
): Promise<RecommendationsResponse> {
  const data = await fetchApi<RecommendationsResponse>(
    `/marketplace-analytics/recommendations/${productId}`,
    120,
  );

  return data ?? {
    frequentlyBoughtTogether: [],
    customersAlsoViewed: [],
  };
}

/**
 * Fetch badges for a specific product.
 * Uses a longer revalidation window (300s) since badges change infrequently.
 */
export async function fetchProductBadges(
  productId: string,
): Promise<ProductBadge[]> {
  const data = await fetchApi<{ badges: ProductBadge[] }>(
    `/marketplace-analytics/products/${productId}/badges`,
    300,
  );

  return data?.badges ?? [];
}

/**
 * Fetch popular products within a specific category.
 */
export async function fetchPopularInCategory(
  categorySlug: string,
  limit: number = 8,
): Promise<ProductRecommendation[]> {
  const params = new URLSearchParams({
    category: categorySlug,
    limit: String(limit),
  });
  const data = await fetchApi<{ items: ProductRecommendation[] }>(
    `/marketplace-analytics/popular?${params.toString()}`,
    120,
  );

  return data?.items ?? [];
}
