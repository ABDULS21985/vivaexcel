'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface SellerInsight {
  id: string;
  sellerId: string;
  insightType: 'pricing' | 'listing_quality' | 'marketing' | 'performance' | 'opportunity';
  title: string;
  description: string;
  actionItems: Array<{ label: string; action: string; url?: string }>;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'viewed' | 'acted_on' | 'dismissed';
  metadata?: Record<string, any>;
  generatedAt: string;
  createdAt: string;
}

export interface SellerGoal {
  id: string;
  sellerId: string;
  type: 'revenue' | 'sales' | 'products' | 'rating';
  title?: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'active' | 'achieved' | 'missed' | 'canceled';
  createdAt: string;
}

export interface MarketBenchmark {
  id: string;
  productType: string;
  categoryId?: string;
  averagePrice: number;
  medianPrice: number;
  priceRange: { min: number; max: number };
  averageRating: number;
  averageSalesPerMonth: number;
  topSellerMetrics: { avgPrice: number; avgRating: number; avgMonthlySales: number };
  sampleSize: number;
  calculatedAt: string;
}

export interface MarketOpportunity {
  term: string;
  searchVolume: number;
  existingProducts: number;
  potential: 'HIGH' | 'MEDIUM' | 'LOW';
  suggestedProductType: string;
  reasoning: string;
}

export interface SalesForecast {
  forecastDays: number;
  projectedRevenue: number;
  projectedSales: number;
  confidenceInterval: { low: number; high: number };
  dailyProjections: Array<{ date: string; revenue: number }>;
  assumptions: string[];
}

export interface PricingAnalysis {
  productId: string;
  productTitle: string;
  currentPrice: number;
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  reasoning: string;
  competitivePosition: 'underpriced' | 'competitive' | 'overpriced';
  confidenceScore: number;
}

export interface ListingScore {
  productId: string;
  overallScore: number;
  dimensions: {
    titleQuality: number;
    descriptionCompleteness: number;
    imageQuality: number;
    seoOptimization: number;
    pricingCompetitiveness: number;
    tagRelevance: number;
  };
  suggestions: Array<{ dimension: string; suggestion: string; impact: 'high' | 'medium' | 'low' }>;
}

export interface SellerResource {
  id: string;
  title: string;
  slug: string;
  type: 'tutorial' | 'guide' | 'video' | 'best_practice' | 'success_story';
  content: string;
  excerpt?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  category?: string;
  tags?: string[];
  order: number;
  isPublished: boolean;
  publishedAt?: string;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const sellerGrowthKeys = {
  all: ['seller-growth'] as const,
  insights: (params?: Record<string, any>) => [...sellerGrowthKeys.all, 'insights', params] as const,
  goals: (params?: Record<string, any>) => [...sellerGrowthKeys.all, 'goals', params] as const,
  resources: (params?: Record<string, any>) => [...sellerGrowthKeys.all, 'resources', params] as const,
  resourceDetail: (slug: string) => [...sellerGrowthKeys.all, 'resources', 'detail', slug] as const,
  benchmarks: (params?: Record<string, any>) => [...sellerGrowthKeys.all, 'benchmarks', params] as const,
  opportunities: () => [...sellerGrowthKeys.all, 'opportunities'] as const,
  forecast: (days: number) => [...sellerGrowthKeys.all, 'forecast', days] as const,
};

// ─── Insight Hooks ───────────────────────────────────────────────────────────

export function useSellerInsights(params?: { status?: string; insightType?: string; page?: number }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sellerGrowthKeys.insights(params),
    queryFn: () => apiGet<ApiResponse<SellerInsight[]>>('/seller-growth/insights', params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => ({ data: res.data, meta: res.meta }),
  });
}

export function useGenerateInsights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiPost<ApiResponse<SellerInsight[]>>('/seller-growth/insights/generate'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerGrowthKeys.insights() });
    },
  });
}

export function useUpdateInsightStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiPatch<ApiResponse<SellerInsight>>(`/seller-growth/insights/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerGrowthKeys.insights() });
    },
  });
}

// ─── Goal Hooks ──────────────────────────────────────────────────────────────

export function useSellerGoals(params?: { status?: string }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sellerGrowthKeys.goals(params),
    queryFn: () => apiGet<ApiResponse<SellerGoal[]>>('/seller-growth/goals', params),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; targetValue: number; deadline: string; title?: string }) =>
      apiPost<ApiResponse<SellerGoal>>('/seller-growth/goals', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerGrowthKeys.goals() });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; currentValue?: number; status?: string; title?: string }) =>
      apiPatch<ApiResponse<SellerGoal>>(`/seller-growth/goals/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerGrowthKeys.goals() });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiDelete<ApiResponse<null>>(`/seller-growth/goals/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerGrowthKeys.goals() });
    },
  });
}

// ─── Resource Hooks ──────────────────────────────────────────────────────────

export function useSellerResources(params?: { type?: string; category?: string; page?: number }) {
  return useQuery({
    queryKey: sellerGrowthKeys.resources(params),
    queryFn: () => apiGet<ApiResponse<SellerResource[]>>('/seller-growth/resources', params),
    staleTime: 5 * 60 * 1000,
    select: (res) => ({ data: res.data, meta: res.meta }),
  });
}

export function useSellerResource(slug: string) {
  return useQuery({
    queryKey: sellerGrowthKeys.resourceDetail(slug),
    queryFn: () => apiGet<ApiResponse<SellerResource>>(`/seller-growth/resources/slug/${slug}`),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });
}

// ─── Market Hooks ────────────────────────────────────────────────────────────

export function useMarketBenchmarks(params?: { productType?: string; categoryId?: string }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sellerGrowthKeys.benchmarks(params),
    queryFn: () => apiGet<ApiResponse<MarketBenchmark[]>>('/seller-growth/market/benchmarks', params),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useMarketOpportunities() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sellerGrowthKeys.opportunities(),
    queryFn: () => apiGet<ApiResponse<MarketOpportunity[]>>('/seller-growth/market/opportunities'),
    enabled: isAuthenticated,
    staleTime: 30 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useSalesForecast(days: number = 30) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: sellerGrowthKeys.forecast(days),
    queryFn: () => apiGet<ApiResponse<SalesForecast>>('/seller-growth/market/forecast', { days }),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    select: (res) => res.data,
  });
}
