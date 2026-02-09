import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, type ApiResponse } from "@/lib/api-client";
import type {
  Review,
  ReviewStats,
  ReviewsResponse,
  ReviewSortBy,
  CreateReviewPayload,
  UpdateReviewPayload,
  VoteOnReviewPayload,
  ReportReviewPayload,
  RecentPurchasesData,
  TopReviewer,
  SellerResponsePayload,
} from "@/types/review";

// =============================================================================
// Internal Helpers -- Data Transform
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Transform a single backend review into the frontend shape.
 */
function transformReview(data: any): Review {
  if (!data) return data;
  return {
    ...data,
    pros: data.pros ?? [],
    cons: data.cons ?? [],
    images: data.images ?? [],
    helpfulCount: data.helpfulCount ?? 0,
    notHelpfulCount: data.notHelpfulCount ?? 0,
    isVerifiedPurchase: data.isVerifiedPurchase ?? false,
    userVote: data.userVote ?? null,
  };
}

/**
 * Transform a paginated reviews response from the API wrapper format.
 */
function transformReviewsResponse(
  res: ApiResponseWrapper<{ items: any[]; meta: any }>,
): ReviewsResponse {
  const items = res.data?.items ?? [];
  return {
    items: items.map(transformReview),
    meta: res.data?.meta ?? { hasMore: false, total: 0 },
  };
}

/**
 * Transform review stats from the API wrapper format.
 */
function transformReviewStats(
  res: ApiResponseWrapper<any>,
): ReviewStats {
  const data = res.data ?? {};
  return {
    averageRating: data.averageRating ?? 0,
    totalReviews: data.totalReviews ?? 0,
    ratingDistribution: data.ratingDistribution ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    verifiedPurchasePercent: data.verifiedPurchasePercent ?? 0,
  };
}

// =============================================================================
// Query Keys
// =============================================================================

export const reviewKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewKeys.all, "list"] as const,
  list: (productId: string, sortBy?: ReviewSortBy, ratingFilter?: number) =>
    [...reviewKeys.lists(), productId, sortBy, ratingFilter] as const,
  stats: (productId: string) =>
    [...reviewKeys.all, "stats", productId] as const,
  recentPurchases: (productId: string) =>
    [...reviewKeys.all, "recent-purchases", productId] as const,
  topReviewers: (limit?: number) =>
    [...reviewKeys.all, "top-reviewers", limit] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch paginated reviews for a product with infinite scrolling support.
 */
export function useProductReviews(
  productId: string,
  sortBy?: ReviewSortBy,
  ratingFilter?: number,
) {
  return useInfiniteQuery({
    queryKey: reviewKeys.list(productId, sortBy, ratingFilter),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) =>
      apiGet<ApiResponseWrapper<{ items: any[]; meta: any }>>(
        `/reviews/product/${productId}`,
        {
          sortBy,
          rating: ratingFilter,
          cursor: pageParam,
          limit: 10,
        },
      ).then(transformReviewsResponse),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasMore ? lastPage.meta.nextCursor : undefined,
    enabled: !!productId,
  });
}

/**
 * Fetch aggregate review stats for a product.
 */
export function useReviewStats(productId: string) {
  return useQuery({
    queryKey: reviewKeys.stats(productId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<any>>(
        `/reviews/product/${productId}/stats`,
      ).then(transformReviewStats),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Create a new review for a product.
 */
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) =>
      apiPost<ApiResponse<Review>>("/reviews", payload).then(
        (res) => transformReview(res.data),
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.stats(variables.digitalProductId),
      });
    },
  });
}

/**
 * Update an existing review.
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, ...payload }: UpdateReviewPayload) =>
      apiPatch<ApiResponse<Review>>(`/reviews/${reviewId}`, payload).then(
        (res) => transformReview(res.data),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.all,
      });
    },
  });
}

/**
 * Vote on a review as helpful or not helpful.
 */
export function useVoteOnReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, vote }: VoteOnReviewPayload) =>
      apiPost<ApiResponse<Review>>(`/reviews/${reviewId}/vote`, { vote }).then(
        (res) => transformReview(res.data),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
    },
  });
}

/**
 * Report a review for moderation.
 */
export function useReportReview() {
  return useMutation({
    mutationFn: ({ reviewId, reason }: ReportReviewPayload) =>
      apiPost<ApiResponse<void>>(`/reviews/${reviewId}/report`, { reason }),
  });
}

/**
 * Fetch recent purchase count for social proof.
 */
export function useRecentPurchases(productId: string) {
  return useQuery({
    queryKey: reviewKeys.recentPurchases(productId),
    queryFn: () =>
      apiGet<ApiResponseWrapper<RecentPurchasesData>>(
        `/reviews/recent-purchases/${productId}`,
      ).then((res) => res.data),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch the top reviewers leaderboard.
 */
export function useTopReviewers(limit?: number) {
  return useQuery({
    queryKey: reviewKeys.topReviewers(limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ items: TopReviewer[] }>>(
        "/reviews/top-reviewers",
        { limit },
      ).then((res) => res.data?.items ?? []),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Submit a seller response to a review (product owner only).
 */
export function useSellerResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, response }: SellerResponsePayload) =>
      apiPost<ApiResponse<Review>>(`/reviews/${reviewId}/respond`, {
        response,
      }).then((res) => transformReview(res.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
      });
    },
  });
}
