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

// ─── Coupon Types ────────────────────────────────────────────────────────────

export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";
export type CouponStatus = "active" | "expired" | "depleted" | "disabled";

export interface Coupon {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number | null;
    maximumDiscountAmount?: number | null;
    usageLimit?: number | null;
    usageCount: number;
    perUserLimit?: number | null;
    startsAt: string;
    expiresAt?: string | null;
    status: CouponStatus;
    applicableProductIds?: string[] | null;
    applicableCategoryIds?: string[] | null;
    isStackable?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CouponFilters {
    search?: string;
    status?: string;
    discountType?: string;
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    [key: string]: unknown;
}

// ─── Flash Sale Types ────────────────────────────────────────────────────────

export type FlashSaleStatus = "upcoming" | "active" | "ended" | "cancelled";

export interface FlashSaleProduct {
    id: string;
    productId: string;
    productTitle: string;
    originalPrice: number;
    salePrice: number;
    stockLimit?: number | null;
    soldCount: number;
}

export interface FlashSale {
    id: string;
    name: string;
    description?: string | null;
    discountPercentage: number;
    startsAt: string;
    endsAt: string;
    status: FlashSaleStatus;
    products: FlashSaleProduct[];
    createdAt: string;
    updatedAt: string;
}

export interface FlashSaleFilters {
    search?: string;
    status?: string;
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    [key: string]: unknown;
}

// ─── Bundle Types ────────────────────────────────────────────────────────────

export type BundleStatus = "active" | "inactive" | "expired";

export interface BundleProduct {
    id: string;
    productId: string;
    productTitle: string;
    productImage?: string | null;
    originalPrice: number;
}

export interface BundleDiscount {
    id: string;
    name: string;
    description?: string | null;
    bundlePrice: number;
    originalTotalPrice: number;
    savingsAmount: number;
    savingsPercentage: number;
    status: BundleStatus;
    products: BundleProduct[];
    createdAt: string;
    updatedAt: string;
}

export interface BundleFilters {
    search?: string;
    status?: string;
    cursor?: string;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    [key: string]: unknown;
}

// ─── Loyalty Types ───────────────────────────────────────────────────────────

export interface LoyaltyTier {
    id: string;
    name: string;
    description?: string | null;
    minimumPoints: number;
    discountPercentage: number;
    pointsMultiplier: number;
    perks: string[];
    color?: string | null;
    icon?: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface PromotionAnalytics {
    totalRedemptions: number;
    revenueImpact: number;
    conversionRate: number;
    averageDiscount: number;
    topCoupons: {
        code: string;
        name: string;
        redemptions: number;
        revenue: number;
    }[];
    flashSalePerformance: {
        name: string;
        totalSales: number;
        revenue: number;
        conversionRate: number;
    }[];
    redemptionsByDay: {
        date: string;
        count: number;
    }[];
    couponTypeDistribution: {
        type: string;
        count: number;
    }[];
}

// ─── Paginated Response Types ────────────────────────────────────────────────

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface CouponsData {
    items: Coupon[];
    meta: CursorMeta;
}

interface FlashSalesData {
    items: FlashSale[];
    meta: CursorMeta;
}

interface BundlesData {
    items: BundleDiscount[];
    meta: CursorMeta;
}

interface LoyaltyTiersData {
    items: LoyaltyTier[];
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const promotionKeys = {
    all: ["promotions"] as const,
    coupons: () => [...promotionKeys.all, "coupons"] as const,
    couponList: (filters: Record<string, unknown>) =>
        [...promotionKeys.coupons(), "list", filters] as const,
    couponDetail: (id: string) =>
        [...promotionKeys.coupons(), "detail", id] as const,
    flashSales: () => [...promotionKeys.all, "flash-sales"] as const,
    flashSaleList: (filters: Record<string, unknown>) =>
        [...promotionKeys.flashSales(), "list", filters] as const,
    flashSaleDetail: (id: string) =>
        [...promotionKeys.flashSales(), "detail", id] as const,
    bundles: () => [...promotionKeys.all, "bundles"] as const,
    bundleList: (filters: Record<string, unknown>) =>
        [...promotionKeys.bundles(), "list", filters] as const,
    bundleDetail: (id: string) =>
        [...promotionKeys.bundles(), "detail", id] as const,
    loyalty: () => [...promotionKeys.all, "loyalty"] as const,
    loyaltyTiers: () => [...promotionKeys.loyalty(), "tiers"] as const,
    analytics: () => [...promotionKeys.all, "analytics"] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchCoupons(filters?: CouponFilters): Promise<CouponsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<CouponsData>>(
        "/admin/coupons",
        { params },
    );
    return response.data;
}

async function fetchCoupon(id: string): Promise<Coupon> {
    const response = await apiClient.get<ApiResponseWrapper<Coupon>>(
        `/admin/coupons/${id}`,
    );
    return response.data;
}

async function createCoupon(data: Record<string, unknown>): Promise<Coupon> {
    const response = await apiClient.post<ApiResponseWrapper<Coupon>>(
        "/admin/coupons",
        data,
    );
    return response.data;
}

async function updateCoupon({
    id,
    data,
}: {
    id: string;
    data: Record<string, unknown>;
}): Promise<Coupon> {
    const response = await apiClient.patch<ApiResponseWrapper<Coupon>>(
        `/admin/coupons/${id}`,
        data,
    );
    return response.data;
}

async function deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`/admin/coupons/${id}`);
}

async function bulkCreateCoupons(
    data: Record<string, unknown>,
): Promise<Coupon[]> {
    const response = await apiClient.post<ApiResponseWrapper<Coupon[]>>(
        "/admin/coupons/bulk",
        data,
    );
    return response.data;
}

async function fetchFlashSales(
    filters?: FlashSaleFilters,
): Promise<FlashSalesData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<FlashSalesData>>(
        "/admin/flash-sales",
        { params },
    );
    return response.data;
}

async function createFlashSale(
    data: Record<string, unknown>,
): Promise<FlashSale> {
    const response = await apiClient.post<ApiResponseWrapper<FlashSale>>(
        "/admin/flash-sales",
        data,
    );
    return response.data;
}

async function fetchBundleDiscounts(
    filters?: BundleFilters,
): Promise<BundlesData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<BundlesData>>(
        "/admin/promotions/bundles",
        { params },
    );
    return response.data;
}

async function createBundleDiscount(
    data: Record<string, unknown>,
): Promise<BundleDiscount> {
    const response = await apiClient.post<ApiResponseWrapper<BundleDiscount>>(
        "/admin/promotions/bundles",
        data,
    );
    return response.data;
}

async function fetchLoyaltyTiers(): Promise<LoyaltyTiersData> {
    const response = await apiClient.get<ApiResponseWrapper<LoyaltyTiersData>>(
        "/admin/loyalty/tiers",
    );
    return response.data;
}

async function createLoyaltyTier(
    data: Record<string, unknown>,
): Promise<LoyaltyTier> {
    const response = await apiClient.post<ApiResponseWrapper<LoyaltyTier>>(
        "/admin/loyalty/tiers",
        data,
    );
    return response.data;
}

async function updateLoyaltyTier({
    id,
    data,
}: {
    id: string;
    data: Record<string, unknown>;
}): Promise<LoyaltyTier> {
    const response = await apiClient.patch<ApiResponseWrapper<LoyaltyTier>>(
        `/admin/loyalty/tiers/${id}`,
        data,
    );
    return response.data;
}

async function deleteLoyaltyTier(id: string): Promise<void> {
    await apiClient.delete(`/admin/loyalty/tiers/${id}`);
}

async function fetchPromotionAnalytics(): Promise<PromotionAnalytics> {
    const response =
        await apiClient.get<ApiResponseWrapper<PromotionAnalytics>>(
            "/admin/promotions/analytics",
        );
    return response.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of coupons.
 */
export function useCoupons(filters?: CouponFilters) {
    return useQuery<CouponsData, ApiError>({
        queryKey: promotionKeys.couponList(filters ?? {}),
        queryFn: () => fetchCoupons(filters),
    });
}

/**
 * Fetch a single coupon by ID.
 */
export function useCoupon(id: string) {
    return useQuery<Coupon, ApiError>({
        queryKey: promotionKeys.couponDetail(id),
        queryFn: () => fetchCoupon(id),
        enabled: !!id,
    });
}

/**
 * Create a new coupon.
 */
export function useCreateCoupon() {
    const queryClient = useQueryClient();

    return useMutation<Coupon, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createCoupon(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.coupons(),
            });
        },
    });
}

/**
 * Update an existing coupon.
 */
export function useUpdateCoupon() {
    const queryClient = useQueryClient();

    return useMutation<
        Coupon,
        ApiError,
        { id: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateCoupon(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.coupons(),
            });
            queryClient.invalidateQueries({
                queryKey: promotionKeys.couponDetail(variables.id),
            });
        },
    });
}

/**
 * Delete a coupon.
 */
export function useDeleteCoupon() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteCoupon(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.coupons(),
            });
        },
    });
}

/**
 * Bulk create coupons.
 */
export function useBulkCreateCoupons() {
    const queryClient = useQueryClient();

    return useMutation<Coupon[], ApiError, Record<string, unknown>>({
        mutationFn: (data) => bulkCreateCoupons(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.coupons(),
            });
        },
    });
}

/**
 * Fetch a paginated/filtered list of flash sales.
 */
export function useFlashSales(filters?: FlashSaleFilters) {
    return useQuery<FlashSalesData, ApiError>({
        queryKey: promotionKeys.flashSaleList(filters ?? {}),
        queryFn: () => fetchFlashSales(filters),
    });
}

/**
 * Create a new flash sale.
 */
export function useCreateFlashSale() {
    const queryClient = useQueryClient();

    return useMutation<FlashSale, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createFlashSale(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.flashSales(),
            });
        },
    });
}

/**
 * Fetch a paginated/filtered list of bundle discounts.
 */
export function useBundleDiscounts(filters?: BundleFilters) {
    return useQuery<BundlesData, ApiError>({
        queryKey: promotionKeys.bundleList(filters ?? {}),
        queryFn: () => fetchBundleDiscounts(filters),
    });
}

/**
 * Create a new bundle discount.
 */
export function useCreateBundleDiscount() {
    const queryClient = useQueryClient();

    return useMutation<BundleDiscount, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createBundleDiscount(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.bundles(),
            });
        },
    });
}

/**
 * Fetch loyalty tiers.
 */
export function useLoyaltyTiers() {
    return useQuery<LoyaltyTiersData, ApiError>({
        queryKey: promotionKeys.loyaltyTiers(),
        queryFn: fetchLoyaltyTiers,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Create a new loyalty tier.
 */
export function useCreateLoyaltyTier() {
    const queryClient = useQueryClient();

    return useMutation<LoyaltyTier, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createLoyaltyTier(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.loyaltyTiers(),
            });
        },
    });
}

/**
 * Update a loyalty tier.
 */
export function useUpdateLoyaltyTier() {
    const queryClient = useQueryClient();

    return useMutation<
        LoyaltyTier,
        ApiError,
        { id: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateLoyaltyTier(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.loyaltyTiers(),
            });
        },
    });
}

/**
 * Delete a loyalty tier.
 */
export function useDeleteLoyaltyTier() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteLoyaltyTier(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: promotionKeys.loyaltyTiers(),
            });
        },
    });
}

/**
 * Fetch promotion analytics.
 */
export function usePromotionAnalytics() {
    return useQuery<PromotionAnalytics, ApiError>({
        queryKey: promotionKeys.analytics(),
        queryFn: fetchPromotionAnalytics,
        staleTime: 60 * 1000,
    });
}
