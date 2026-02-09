// =============================================================================
// Server-Side Review API
// =============================================================================
// Utility for fetching review data from the backend in Next.js server
// components and ISR pages. Uses plain fetch() with `next.revalidate` caching
// — NOT the client-side apiClient which relies on localStorage for JWT tokens.
//
// Follows the same pattern established by `blog-api.ts`.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Types
// =============================================================================

export interface ReviewData {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  isVerified: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface ReviewStatsData {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>; // "1" .. "5" => count
  recommendPercentage: number;
}

export interface TopReviewer {
  id: string;
  name: string;
  avatar?: string;
  reviewCount: number;
  averageRating: number;
}

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Internal Helpers
// =============================================================================

/**
 * Generic fetcher that unwraps the standard API response wrapper
 * `{ status, data, meta }` and returns just the `data` portion.
 * Returns `null` on any failure so callers can render fallback UI.
 */
async function fetchApi<T>(
  endpoint: string,
  revalidate: number = 60,
): Promise<T | null> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[review-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return null;
    }

    const json: ApiResponseWrapper<T> = await response.json();
    return json.data ?? null;
  } catch (error) {
    console.error(`[review-api] GET ${endpoint} error:`, error);
    return null;
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch reviews for a specific product with optional query parameters
 * (pagination, sorting, filtering).
 *
 * @param productId - The product to fetch reviews for.
 * @param params    - Optional key-value query parameters (cursor, limit, sort, etc.).
 */
export async function fetchProductReviews(
  productId: string,
  params?: Record<string, string>,
): Promise<ReviewData[] | null> {
  const url = new URL(`${API_BASE_URL}/reviews/product/${productId}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return fetchApi<ReviewData[]>(url.toString(), 60);
}

/**
 * Fetch aggregate review statistics for a product (average rating,
 * distribution, recommendation percentage, etc.).
 */
export async function fetchReviewStats(
  productId: string,
): Promise<ReviewStatsData | null> {
  return fetchApi<ReviewStatsData>(
    `/reviews/product/${productId}/stats`,
    60,
  );
}

/**
 * Fetch the most active / top-rated reviewers across the platform.
 *
 * @param limit - Maximum number of reviewers to return (defaults to 10).
 */
export async function fetchTopReviewers(
  limit: number = 10,
): Promise<TopReviewer[] | null> {
  return fetchApi<TopReviewer[]>(
    `/reviews/top-reviewers?limit=${limit}`,
    300,
  );
}

/**
 * Fetch social proof data for a product — recent purchase count (last 24 h)
 * and other trust signals.  Used by the SocialProofBanner component.
 */
export async function fetchSocialProof(
  productId: string,
): Promise<{ recentPurchases: number } | null> {
  return fetchApi<{ recentPurchases: number }>(
    `/reviews/product/${productId}/social-proof`,
    30,
  );
}
