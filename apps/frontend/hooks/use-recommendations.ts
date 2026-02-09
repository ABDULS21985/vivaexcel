import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  TrendingProduct,
  ProductRecommendation,
  ProductBadge,
  RecommendationsResponse,
} from "@/types/analytics";

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Query Keys
// =============================================================================

export const recommendationKeys = {
  all: ["recommendations"] as const,
  trending: (limit?: number) =>
    [...recommendationKeys.all, "trending", limit] as const,
  product: (productId: string) =>
    [...recommendationKeys.all, "product", productId] as const,
  badges: (productId: string) =>
    [...recommendationKeys.all, "badges", productId] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch recommendations (FBT + also viewed) for a specific product.
 */
export function useProductRecommendations(productId: string) {
  return useQuery({
    queryKey: recommendationKeys.product(productId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<RecommendationsResponse>>(
        `/marketplace-analytics/recommendations/${productId}`,
      ).then((res) => res.data),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    select: (data) => ({
      frequentlyBoughtTogether: data?.frequentlyBoughtTogether ?? [],
      customersAlsoViewed: data?.customersAlsoViewed ?? [],
    }),
  });
}

/**
 * Fetch trending products with an optional limit.
 */
export function useTrending(limit: number = 10) {
  return useQuery({
    queryKey: recommendationKeys.trending(limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ items: TrendingProduct[] }>>(
        `/marketplace-analytics/trending`,
        { limit },
      ).then((res) => res.data?.items ?? []),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch badges for a specific product.
 */
export function useProductBadges(productId: string) {
  return useQuery({
    queryKey: recommendationKeys.badges(productId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ badges: ProductBadge[] }>>(
        `/marketplace-analytics/products/${productId}/badges`,
      ).then((res) => res.data?.badges ?? []),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });
}
