import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";

// =============================================================================
// Types
// =============================================================================

export interface FlashSaleProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency?: string;
}

export interface FlashSale {
  id: string;
  name: string;
  description?: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  productCount?: number;
  bannerColor?: string;
  imageUrl?: string;
  products?: FlashSaleProduct[];
  isActive?: boolean;
}

export interface FlashSalesResponse {
  items: FlashSale[];
  meta: {
    total: number;
    hasMore?: boolean;
  };
}

export interface BundleProduct {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
}

export interface BundleDeal {
  id: string;
  name: string;
  description?: string;
  discountPercent: number;
  originalTotal: number;
  bundlePrice: number;
  currency?: string;
  products: BundleProduct[];
  badgeText?: string;
}

export interface BundlesResponse {
  items: BundleDeal[];
  meta: {
    total: number;
  };
}

export interface LoyaltyTier {
  id: string;
  name: string;
  requiredSpend: number;
  discountPercent: number;
  color: string;
  icon?: string;
  benefits?: string[];
}

export interface UserLoyaltyTier {
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  currentSpend: number;
  lifetimeSpend: number;
  pointsBalance: number;
  memberSince: string;
  spendingHistory?: Array<{
    month: string;
    amount: number;
  }>;
}

export interface CouponValidationResult {
  valid: boolean;
  discount?: number;
  discountType?: "percentage" | "fixed";
  message?: string;
  code?: string;
  minPurchase?: number;
  expiresAt?: string;
}

export interface CouponApplyResult {
  applied: boolean;
  discount: number;
  discountType: "percentage" | "fixed";
  code: string;
  message?: string;
}

export interface BestDealResult {
  dealType: "flash-sale" | "bundle" | "loyalty" | "coupon";
  dealId?: string;
  name: string;
  discountPercent: number;
  discountAmount: number;
  originalPrice: number;
  finalPrice: number;
  expiresAt?: string;
}

// =============================================================================
// Query Key Factory
// =============================================================================

export const promotionKeys = {
  all: ["promotions"] as const,
  flashSales: () => [...promotionKeys.all, "flash-sales"] as const,
  activeFlashSales: () => [...promotionKeys.flashSales(), "active"] as const,
  flashSaleDetail: (id: string) =>
    [...promotionKeys.flashSales(), "detail", id] as const,
  bundles: () => [...promotionKeys.all, "bundles"] as const,
  bundleDetail: (id: string) =>
    [...promotionKeys.bundles(), "detail", id] as const,
  loyalty: () => [...promotionKeys.all, "loyalty"] as const,
  loyaltyTiers: () => [...promotionKeys.loyalty(), "tiers"] as const,
  userTier: () => [...promotionKeys.loyalty(), "user-tier"] as const,
  bestDeal: (filters: Record<string, unknown>) =>
    [...promotionKeys.all, "best-deal", filters] as const,
  coupons: () => [...promotionKeys.all, "coupons"] as const,
};

// =============================================================================
// Flash Sale Hooks
// =============================================================================

/**
 * Fetch all currently active flash sales.
 */
export function useActiveFlashSales() {
  return useQuery({
    queryKey: promotionKeys.activeFlashSales(),
    queryFn: () => apiGet<FlashSalesResponse>("/flash-sales/active"),
    staleTime: 30 * 1000, // 30 seconds - flash sales change quickly
  });
}

/**
 * Fetch a single flash sale by ID, including its products.
 */
export function useFlashSale(id: string) {
  return useQuery({
    queryKey: promotionKeys.flashSaleDetail(id),
    queryFn: () => apiGet<FlashSale>(`/flash-sales/${id}`),
    enabled: !!id,
    staleTime: 30 * 1000,
  });
}

// =============================================================================
// Bundle Hooks
// =============================================================================

/**
 * Fetch all available bundle discounts.
 */
export function useBundleDiscounts() {
  return useQuery({
    queryKey: promotionKeys.bundles(),
    queryFn: () => apiGet<BundlesResponse>("/promotions/bundles"),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single bundle discount by ID.
 */
export function useBundleDiscount(id: string) {
  return useQuery({
    queryKey: promotionKeys.bundleDetail(id),
    queryFn: () => apiGet<BundleDeal>(`/promotions/bundles/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Loyalty Hooks
// =============================================================================

/**
 * Fetch all available loyalty tiers.
 */
export function useLoyaltyTiers() {
  return useQuery({
    queryKey: promotionKeys.loyaltyTiers(),
    queryFn: () => apiGet<LoyaltyTier[]>("/loyalty/tiers"),
    staleTime: 30 * 60 * 1000, // 30 minutes - tiers don't change often
  });
}

/**
 * Fetch the authenticated user's current loyalty tier and progress.
 */
export function useUserLoyaltyTier() {
  return useQuery({
    queryKey: promotionKeys.userTier(),
    queryFn: () => apiGet<UserLoyaltyTier>("/loyalty/tier"),
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// Coupon Hooks
// =============================================================================

/**
 * Mutation to validate a coupon code without applying it.
 */
export function useValidateCoupon() {
  return useMutation({
    mutationFn: (code: string) =>
      apiPost<CouponValidationResult>("/coupons/validate", { code }),
  });
}

/**
 * Mutation to apply a validated coupon code to the current cart.
 */
export function useApplyCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) =>
      apiPost<CouponApplyResult>("/coupons/apply", { code }),
    onSuccess: () => {
      // Invalidate cart and promotion queries since the applied coupon
      // may change pricing throughout the app
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: promotionKeys.coupons() });
    },
  });
}

// =============================================================================
// Best Deal Hook
// =============================================================================

/**
 * Fetch the best available deal for the authenticated user based on their
 * cart contents, loyalty tier, and available promotions.
 */
export function useBestDeal(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: promotionKeys.bestDeal(filters),
    queryFn: () =>
      apiGet<BestDealResult>("/promotions/best-deal", {
        ...(filters as Record<string, string | number | boolean | undefined>),
      }),
    staleTime: 60 * 1000, // 1 minute
  });
}
