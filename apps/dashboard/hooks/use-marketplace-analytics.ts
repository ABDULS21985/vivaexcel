"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient, type ApiError } from "../lib/api-client";

// ─── Backend response wrapper ────────────────────────────────────────────────

interface ApiResponseWrapper<T> {
    status: string;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export type Period = "7d" | "30d" | "90d" | "1y";
export type GroupBy = "day" | "week" | "month";

export interface PlatformOverview {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    revenueChange: number;
    ordersChange: number;
    aovChange: number;
    conversionChange: number;
    revenueSparkline: number[];
    ordersSparkline: number[];
    aovSparkline: number[];
    conversionSparkline: number[];
}

export interface RevenueDataPoint {
    date: string;
    revenue: number;
    orders: number;
    grossRevenue: number;
    platformFee: number;
    netRevenue: number;
    averageOrderValue: number;
}

export interface TopProduct {
    id: string;
    name: string;
    views: number;
    revenue: number;
    conversionRate: number;
    sparkline: number[];
}

export interface FunnelStage {
    stage: string;
    count: number;
    percentage: number;
    dropOff: number;
    dropOffPercentage: number;
}

export interface CategoryRevenue {
    category: string;
    revenue: number;
    percentage: number;
}

export interface TrafficSourceData {
    source: string;
    visits: number;
    percentage: number;
}

export interface DeviceBreakdown {
    device: string;
    count: number;
    percentage: number;
}

export interface SellerOverview {
    sellerId: string;
    sellerName: string;
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    conversionRate: number;
    totalProducts: number;
    revenueChange: number;
}

export interface SellerRevenuePoint {
    date: string;
    revenue: number;
    orders: number;
}

export interface ProductAnalyticsData {
    productId: string;
    productName: string;
    views: number;
    uniqueVisitors: number;
    addToCarts: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
    viewsOverTime: { date: string; views: number; revenue: number }[];
    trafficSources: TrafficSourceData[];
    deviceBreakdown: DeviceBreakdown[];
}

export interface ProductTrafficData {
    date: string;
    views: number;
    uniqueVisitors: number;
}

export interface MarketplaceOverviewData {
    overview: PlatformOverview;
    revenueChart: RevenueDataPoint[];
    topProducts: TopProduct[];
    categoryRevenue: CategoryRevenue[];
    trafficSources: TrafficSourceData[];
    deviceBreakdown: DeviceBreakdown[];
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const marketplaceAnalyticsKeys = {
    all: ["marketplace-analytics"] as const,
    overview: (period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "overview", period] as const,
    revenue: (period?: Period, groupBy?: GroupBy) =>
        [...marketplaceAnalyticsKeys.all, "revenue", period, groupBy] as const,
    topProducts: (period?: Period, limit?: number) =>
        [...marketplaceAnalyticsKeys.all, "top-products", period, limit] as const,
    funnel: (period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "funnel", period] as const,
    categoryRevenue: (period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "category-revenue", period] as const,
    trafficSources: (period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "traffic-sources", period] as const,
    deviceBreakdown: (period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "device-breakdown", period] as const,
    sellerOverview: (sellerId: string, period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "seller-overview", sellerId, period] as const,
    sellerRevenue: (sellerId: string, period?: Period, groupBy?: GroupBy) =>
        [...marketplaceAnalyticsKeys.all, "seller-revenue", sellerId, period, groupBy] as const,
    productAnalytics: (productId: string, period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "product-analytics", productId, period] as const,
    productTraffic: (productId: string, period?: Period) =>
        [...marketplaceAnalyticsKeys.all, "product-traffic", productId, period] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchPlatformOverview(period?: Period): Promise<PlatformOverview> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<PlatformOverview>>(
        "/marketplace/analytics/overview",
        { params },
    );
    return response.data;
}

async function fetchPlatformRevenue(
    period?: Period,
    groupBy?: GroupBy,
): Promise<RevenueDataPoint[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    if (groupBy) params.groupBy = groupBy;
    const response = await apiClient.get<ApiResponseWrapper<RevenueDataPoint[]>>(
        "/marketplace/analytics/revenue",
        { params },
    );
    return response.data;
}

async function fetchTopProducts(
    period?: Period,
    limit?: number,
): Promise<TopProduct[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    if (limit) params.limit = limit;
    const response = await apiClient.get<ApiResponseWrapper<TopProduct[]>>(
        "/marketplace/analytics/top-products",
        { params },
    );
    return response.data;
}

async function fetchConversionFunnel(period?: Period): Promise<FunnelStage[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<FunnelStage[]>>(
        "/marketplace/analytics/funnel",
        { params },
    );
    return response.data;
}

async function fetchCategoryRevenue(period?: Period): Promise<CategoryRevenue[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<CategoryRevenue[]>>(
        "/marketplace/analytics/category-revenue",
        { params },
    );
    return response.data;
}

async function fetchTrafficSources(period?: Period): Promise<TrafficSourceData[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<TrafficSourceData[]>>(
        "/marketplace/analytics/traffic-sources",
        { params },
    );
    return response.data;
}

async function fetchDeviceBreakdown(period?: Period): Promise<DeviceBreakdown[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<DeviceBreakdown[]>>(
        "/marketplace/analytics/device-breakdown",
        { params },
    );
    return response.data;
}

async function fetchSellerOverview(
    sellerId: string,
    period?: Period,
): Promise<SellerOverview> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<SellerOverview>>(
        `/marketplace/analytics/sellers/${sellerId}/overview`,
        { params },
    );
    return response.data;
}

async function fetchSellerRevenue(
    sellerId: string,
    period?: Period,
    groupBy?: GroupBy,
): Promise<SellerRevenuePoint[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    if (groupBy) params.groupBy = groupBy;
    const response = await apiClient.get<ApiResponseWrapper<SellerRevenuePoint[]>>(
        `/marketplace/analytics/sellers/${sellerId}/revenue`,
        { params },
    );
    return response.data;
}

async function fetchProductAnalytics(
    productId: string,
    period?: Period,
): Promise<ProductAnalyticsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<ProductAnalyticsData>>(
        `/marketplace/analytics/products/${productId}`,
        { params },
    );
    return response.data;
}

async function fetchProductTraffic(
    productId: string,
    period?: Period,
): Promise<ProductTrafficData[]> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (period) params.period = period;
    const response = await apiClient.get<ApiResponseWrapper<ProductTrafficData[]>>(
        `/marketplace/analytics/products/${productId}/traffic`,
        { params },
    );
    return response.data;
}

async function exportRevenueCSV(params: {
    startDate?: string;
    endDate?: string;
    groupBy?: GroupBy;
}): Promise<Blob> {
    const queryParams: Record<string, string | number | boolean | undefined> = {};
    if (params.startDate) queryParams.startDate = params.startDate;
    if (params.endDate) queryParams.endDate = params.endDate;
    if (params.groupBy) queryParams.groupBy = params.groupBy;

    const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1"}/marketplace/analytics/revenue/export`,
    );
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
    });

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            Accept: "text/csv",
        },
    });

    if (!response.ok) {
        throw { message: "Failed to export revenue data", status: response.status };
    }

    return response.blob();
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch platform-wide overview metrics.
 */
export function usePlatformOverview(period?: Period) {
    return useQuery<PlatformOverview, ApiError>({
        queryKey: marketplaceAnalyticsKeys.overview(period),
        queryFn: () => fetchPlatformOverview(period),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch time-series revenue data for charts.
 */
export function usePlatformRevenue(period?: Period, groupBy?: GroupBy) {
    return useQuery<RevenueDataPoint[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.revenue(period, groupBy),
        queryFn: () => fetchPlatformRevenue(period, groupBy),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch top products by revenue.
 */
export function useTopProducts(period?: Period, limit?: number) {
    return useQuery<TopProduct[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.topProducts(period, limit),
        queryFn: () => fetchTopProducts(period, limit),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch conversion funnel data.
 */
export function useConversionFunnel(period?: Period) {
    return useQuery<FunnelStage[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.funnel(period),
        queryFn: () => fetchConversionFunnel(period),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch revenue breakdown by category.
 */
export function useCategoryRevenue(period?: Period) {
    return useQuery<CategoryRevenue[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.categoryRevenue(period),
        queryFn: () => fetchCategoryRevenue(period),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch traffic sources breakdown.
 */
export function useMarketplaceTrafficSources(period?: Period) {
    return useQuery<TrafficSourceData[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.trafficSources(period),
        queryFn: () => fetchTrafficSources(period),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch device breakdown data.
 */
export function useDeviceBreakdown(period?: Period) {
    return useQuery<DeviceBreakdown[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.deviceBreakdown(period),
        queryFn: () => fetchDeviceBreakdown(period),
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch seller-specific overview data.
 */
export function useSellerOverview(sellerId: string, period?: Period) {
    return useQuery<SellerOverview, ApiError>({
        queryKey: marketplaceAnalyticsKeys.sellerOverview(sellerId, period),
        queryFn: () => fetchSellerOverview(sellerId, period),
        enabled: !!sellerId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch seller-specific revenue time-series.
 */
export function useSellerRevenue(sellerId: string, period?: Period, groupBy?: GroupBy) {
    return useQuery<SellerRevenuePoint[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.sellerRevenue(sellerId, period, groupBy),
        queryFn: () => fetchSellerRevenue(sellerId, period, groupBy),
        enabled: !!sellerId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch product-specific analytics.
 */
export function useProductAnalytics(productId: string, period?: Period) {
    return useQuery<ProductAnalyticsData, ApiError>({
        queryKey: marketplaceAnalyticsKeys.productAnalytics(productId, period),
        queryFn: () => fetchProductAnalytics(productId, period),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch product-specific traffic data.
 */
export function useProductTraffic(productId: string, period?: Period) {
    return useQuery<ProductTrafficData[], ApiError>({
        queryKey: marketplaceAnalyticsKeys.productTraffic(productId, period),
        queryFn: () => fetchProductTraffic(productId, period),
        enabled: !!productId,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Export revenue data as CSV (mutation that triggers download).
 */
export function useExportRevenue() {
    return useMutation<
        Blob,
        ApiError,
        { startDate?: string; endDate?: string; groupBy?: GroupBy }
    >({
        mutationFn: (params) => exportRevenueCSV(params),
        onSuccess: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        },
    });
}
