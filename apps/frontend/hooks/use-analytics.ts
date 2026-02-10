import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Analytics Types
// =============================================================================

export interface SellerOverviewData {
  mode: "seller";
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  views: number;
  viewsChange: number;
  conversionRate: number;
  conversionRateChange: number;
  sparklines: {
    revenue: number[];
    orders: number[];
  };
}

export interface BuyerOverviewData {
  mode: "buyer";
  totalSpent: number;
  totalSpentChange: number;
  orders: number;
  ordersChange: number;
  downloads: number;
  productsOwned: number;
  sparklines: {
    spending: number[];
    orders: number[];
  };
}

export type MyOverviewData = SellerOverviewData | BuyerOverviewData;

export interface MyRevenueSeriesData {
  mode: "seller" | "buyer";
  timeSeries: {
    period: string;
    amount: number;
    orderCount: number;
  }[];
  total: number;
}

export interface MyTopProductsData {
  products: {
    digitalProductId: string;
    title: string;
    views: number;
    conversions: number;
    revenue: number;
    conversionRate: number;
  }[];
}

export interface MyFunnelData {
  stages: {
    stage: string;
    label: string;
    count: number;
    rate: number;
    dropoffRate: number;
  }[];
  overallConversionRate: number;
}

export interface MyTrafficData {
  sources: {
    source: string;
    count: number;
    percentage: number;
  }[];
}

export interface MyPurchasesData {
  categories: {
    categoryId: string;
    categoryName: string;
    totalSpent: number;
    itemCount: number;
    percentage: number;
  }[];
  recentOrders: {
    orderId: string;
    orderNumber: string;
    total: number;
    currency: string;
    status: string;
    completedAt: string | null;
    createdAt: string;
    items: { productTitle: string; productSlug: string; price: number }[];
  }[];
}

// =============================================================================
// Query Keys
// =============================================================================

export const analyticsKeys = {
  all: ["analytics"] as const,
  overview: (period: string) =>
    [...analyticsKeys.all, "overview", period] as const,
  revenue: (period: string, groupBy: string) =>
    [...analyticsKeys.all, "revenue", period, groupBy] as const,
  topProducts: (period: string) =>
    [...analyticsKeys.all, "top-products", period] as const,
  funnel: (period: string) =>
    [...analyticsKeys.all, "funnel", period] as const,
  traffic: (period: string) =>
    [...analyticsKeys.all, "traffic", period] as const,
  purchases: (period: string) =>
    [...analyticsKeys.all, "purchases", period] as const,
};

// =============================================================================
// Hooks
// =============================================================================

interface ApiResponse<T> {
  status: string;
  data: T;
}

export function useMyAnalyticsOverview(period: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.overview(period),
    queryFn: () =>
      apiGet<ApiResponse<MyOverviewData>>("/marketplace-analytics/my/overview", {
        period,
      }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useMyRevenueSeries(period: string, groupBy: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.revenue(period, groupBy),
    queryFn: () =>
      apiGet<ApiResponse<MyRevenueSeriesData>>(
        "/marketplace-analytics/my/revenue",
        { period, groupBy },
      ),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useMyTopProducts(period: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.topProducts(period),
    queryFn: () =>
      apiGet<ApiResponse<MyTopProductsData>>(
        "/marketplace-analytics/my/top-products",
        { period, limit: 5 },
      ),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useMyConversionFunnel(period: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.funnel(period),
    queryFn: () =>
      apiGet<ApiResponse<MyFunnelData>>("/marketplace-analytics/my/funnel", {
        period,
      }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useMyTrafficSources(period: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.traffic(period),
    queryFn: () =>
      apiGet<ApiResponse<MyTrafficData>>("/marketplace-analytics/my/traffic", {
        period,
      }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useMyPurchaseBreakdown(period: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: analyticsKeys.purchases(period),
    queryFn: () =>
      apiGet<ApiResponse<MyPurchasesData>>(
        "/marketplace-analytics/my/purchases",
        { period },
      ),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}
