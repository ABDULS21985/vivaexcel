"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type ApiError } from "../lib/api-client";

// ─── Backend response wrapper ────────────────────────────────────────────────

interface ApiResponseWrapper<T> {
    status: string;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

// ─── Review Status ───────────────────────────────────────────────────────────

export type ReviewStatus =
    | "PENDING_MODERATION"
    | "APPROVED"
    | "REJECTED"
    | "FLAGGED";

export type ReportStatus = "PENDING" | "REVIEWED" | "DISMISSED";

// ─── Review Types ────────────────────────────────────────────────────────────

export interface Review {
    id: string;
    userId: string;
    digitalProductId: string;
    rating: number;
    title: string;
    body: string;
    pros?: string[] | null;
    cons?: string[] | null;
    status: ReviewStatus;
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    notHelpfulCount: number;
    sellerResponse?: string | null;
    sellerRespondedAt?: string | null;
    images?: string[] | null;
    editedAt?: string | null;
    metadata?: {
        browser?: string;
        os?: string;
        [key: string]: unknown;
    } | null;
    createdAt: string;
    updatedAt: string;
    // Joined relations
    user?: {
        id: string;
        name: string;
        email: string;
        avatar?: string | null;
    } | null;
    digitalProduct?: {
        id: string;
        title: string;
        slug: string;
    } | null;
    reports?: ReviewReport[];
    aiModeration?: AIModerationResult | null;
}

export interface ReviewReport {
    id: string;
    reviewId: string;
    reportedBy: string;
    reason: string;
    details?: string | null;
    status: ReportStatus;
    reporter?: {
        id: string;
        name: string;
        email: string;
    } | null;
    createdAt: string;
    updatedAt: string;
}

export interface AIModerationResult {
    qualityScore: number;
    flags: string[];
    recommendation: "APPROVE" | "REJECT" | "MANUAL_REVIEW";
    reasoning?: string;
    analyzedAt?: string;
}

export interface ReviewFilters {
    search?: string;
    status?: ReviewStatus | "all";
    rating?: number | "all";
    digitalProductId?: string;
    isVerifiedPurchase?: boolean;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    cursor?: string;
    limit?: number;
}

export interface ReviewStats {
    totalReviews: number;
    averageRating: number;
    pendingModeration: number;
    flaggedCount: number;
    approvedCount: number;
    rejectedCount: number;
    ratingDistribution: { rating: number; count: number }[];
    verifiedPurchaseCount: number;
    unverifiedCount: number;
    responseRate: number;
}

export interface TopReviewer {
    userId: string;
    name: string;
    avatar?: string | null;
    totalReviews: number;
    helpfulVotes: number;
    averageRating: number;
}

export interface ReviewAnalytics {
    averageByCategory: { category: string; averageRating: number; reviewCount: number }[];
    trends: { date: string; count: number; averageRating: number }[];
    topRatedProducts: { productId: string; productTitle: string; averageRating: number; reviewCount: number }[];
    lowestRatedProducts: { productId: string; productTitle: string; averageRating: number; reviewCount: number }[];
}

// ─── Cursor-Paginated Response ──────────────────────────────────────────────

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface ReviewsData {
    items: Review[];
    meta: CursorMeta;
}

interface TopReviewersData {
    items: TopReviewer[];
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const reviewKeys = {
    all: ["reviews"] as const,
    reviews: () => [...reviewKeys.all, "list"] as const,
    reviewList: (filters: Record<string, unknown>) =>
        [...reviewKeys.reviews(), filters] as const,
    reviewDetail: (id: string) =>
        [...reviewKeys.all, "detail", id] as const,
    stats: (productId?: string) =>
        [...reviewKeys.all, "stats", productId ?? "all"] as const,
    topReviewers: (limit?: number) =>
        [...reviewKeys.all, "top-reviewers", limit ?? 10] as const,
    flagged: (cursor?: string, limit?: number) =>
        [...reviewKeys.all, "flagged", cursor, limit] as const,
    moderationQueue: (cursor?: string, limit?: number) =>
        [...reviewKeys.all, "moderation-queue", cursor, limit] as const,
    analytics: () => [...reviewKeys.all, "analytics"] as const,
};

// ─── API Functions ──────────────────────────────────────────────────────────

async function fetchReviews(
    filters?: Record<string, unknown>
): Promise<ReviewsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" && value !== "all") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<ReviewsData>>(
        "/reviews",
        { params }
    );
    return response.data;
}

async function fetchReview(id: string): Promise<Review> {
    const response = await apiClient.get<ApiResponseWrapper<Review>>(
        `/reviews/${id}`
    );
    return response.data;
}

async function moderateReview({
    id,
    action,
    reason,
}: {
    id: string;
    action: "APPROVED" | "REJECTED";
    reason?: string;
}): Promise<Review> {
    const response = await apiClient.patch<ApiResponseWrapper<Review>>(
        `/reviews/${id}/moderate`,
        { action, reason }
    );
    return response.data;
}

async function respondToReview({
    id,
    response: responseText,
}: {
    id: string;
    response: string;
}): Promise<Review> {
    const res = await apiClient.post<ApiResponseWrapper<Review>>(
        `/reviews/${id}/respond`,
        { response: responseText }
    );
    return res.data;
}

async function fetchReviewStats(productId?: string): Promise<ReviewStats> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (productId) params.digitalProductId = productId;
    const response = await apiClient.get<ApiResponseWrapper<ReviewStats>>(
        "/reviews/stats",
        { params }
    );
    return response.data;
}

async function fetchTopReviewers(limit?: number): Promise<TopReviewersData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (limit) params.limit = limit;
    const response = await apiClient.get<ApiResponseWrapper<TopReviewersData>>(
        "/reviews/top-reviewers",
        { params }
    );
    return response.data;
}

async function fetchFlaggedReviews(
    cursor?: string,
    limit?: number
): Promise<ReviewsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;
    const response = await apiClient.get<ApiResponseWrapper<ReviewsData>>(
        "/reviews/flagged",
        { params }
    );
    return response.data;
}

async function fetchModerationQueue(
    cursor?: string,
    limit?: number
): Promise<ReviewsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;
    const response = await apiClient.get<ApiResponseWrapper<ReviewsData>>(
        "/reviews/moderation-queue",
        { params }
    );
    return response.data;
}

async function fetchReviewAnalytics(): Promise<ReviewAnalytics> {
    const response = await apiClient.get<ApiResponseWrapper<ReviewAnalytics>>(
        "/reviews/analytics"
    );
    return response.data;
}

async function dismissReports(reviewId: string): Promise<void> {
    await apiClient.post(`/reviews/${reviewId}/dismiss-reports`);
}

async function removeReview(id: string): Promise<void> {
    await apiClient.delete(`/reviews/${id}`);
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of reviews.
 */
export function useReviews(filters?: Record<string, unknown>) {
    return useQuery<ReviewsData, ApiError>({
        queryKey: reviewKeys.reviewList(filters ?? {}),
        queryFn: () => fetchReviews(filters),
    });
}

/**
 * Fetch a single review by ID.
 */
export function useReview(id: string) {
    return useQuery<Review, ApiError>({
        queryKey: reviewKeys.reviewDetail(id),
        queryFn: () => fetchReview(id),
        enabled: !!id,
    });
}

/**
 * Moderate a review (approve/reject).
 */
export function useModerateReview() {
    const queryClient = useQueryClient();

    return useMutation<
        Review,
        ApiError,
        { id: string; action: "APPROVED" | "REJECTED"; reason?: string }
    >({
        mutationFn: (variables) => moderateReview(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: reviewKeys.reviews(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.reviewDetail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.stats(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.moderationQueue(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.flagged(),
            });
        },
    });
}

/**
 * Submit a seller response to a review.
 */
export function useRespondToReview() {
    const queryClient = useQueryClient();

    return useMutation<
        Review,
        ApiError,
        { id: string; response: string }
    >({
        mutationFn: (variables) => respondToReview(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: reviewKeys.reviewDetail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.reviews(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.analytics(),
            });
        },
    });
}

/**
 * Fetch aggregate review stats, optionally scoped to a product.
 */
export function useReviewStats(productId?: string) {
    return useQuery<ReviewStats, ApiError>({
        queryKey: reviewKeys.stats(productId),
        queryFn: () => fetchReviewStats(productId),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch top reviewers leaderboard.
 */
export function useTopReviewers(limit?: number) {
    return useQuery<TopReviewersData, ApiError>({
        queryKey: reviewKeys.topReviewers(limit),
        queryFn: () => fetchTopReviewers(limit),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch flagged reviews list.
 */
export function useFlaggedReviews(cursor?: string, limit?: number) {
    return useQuery<ReviewsData, ApiError>({
        queryKey: reviewKeys.flagged(cursor, limit),
        queryFn: () => fetchFlaggedReviews(cursor, limit),
    });
}

/**
 * Fetch moderation queue (pending reviews).
 */
export function useModerationQueue(cursor?: string, limit?: number) {
    return useQuery<ReviewsData, ApiError>({
        queryKey: reviewKeys.moderationQueue(cursor, limit),
        queryFn: () => fetchModerationQueue(cursor, limit),
    });
}

/**
 * Fetch review analytics data.
 */
export function useReviewAnalytics() {
    return useQuery<ReviewAnalytics, ApiError>({
        queryKey: reviewKeys.analytics(),
        queryFn: fetchReviewAnalytics,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Dismiss all reports for a review (keep the review).
 */
export function useDismissReports() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (reviewId) => dismissReports(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reviewKeys.reviews(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.flagged(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.stats(),
            });
        },
    });
}

/**
 * Remove/delete a review entirely.
 */
export function useRemoveReview() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => removeReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: reviewKeys.reviews(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.stats(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.flagged(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.moderationQueue(),
            });
            queryClient.invalidateQueries({
                queryKey: reviewKeys.analytics(),
            });
        },
    });
}
