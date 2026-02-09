"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Types
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
}

export interface RecommendedProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  featuredImage?: string;
  averageRating: number;
  totalReviews: number;
  type: string;
  reason?: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const aiRecKeys = {
  all: ["ai-recommendations"] as const,
  similar: (productId: string, limit?: number) =>
    [...aiRecKeys.all, "similar", productId, limit] as const,
  forYou: (limit?: number) =>
    [...aiRecKeys.all, "for-you", limit] as const,
  aiPowered: (context?: string) =>
    [...aiRecKeys.all, "ai", context] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch similar products for a given product (content-based filtering).
 */
export function useSimilarProducts(productId: string, limit: number = 8) {
  return useQuery({
    queryKey: aiRecKeys.similar(productId, limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<RecommendedProduct[]>>(
        `/recommendations/similar/${productId}`,
        { limit },
      ).then((res) => res.data ?? []),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch personalized "For You" feed (requires authentication).
 */
export function useForYouFeed(limit: number = 12) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: aiRecKeys.forYou(limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<RecommendedProduct[]>>(
        `/recommendations/for-you`,
        { limit },
      ).then((res) => res.data ?? []),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch AI-powered recommendations with optional context (requires authentication).
 */
export function useAIRecommendations(context?: string, limit: number = 6) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: aiRecKeys.aiPowered(context),
    queryFn: () =>
      apiGet<ApiResponseWrapper<RecommendedProduct[]>>(
        `/recommendations/ai`,
        { limit, context },
      ).then((res) => res.data ?? []),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
  });
}
