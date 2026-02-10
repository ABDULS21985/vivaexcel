import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import type {
  MarketplacePlan,
  MarketplaceSubscription,
  CreditBalance,
  CreditTransaction,
  SubscriptionDownload,
  UsageAnalytics,
  BillingPeriod,
} from "@/types/marketplace-subscription";

// Query Keys
export const marketplaceSubKeys = {
  all: ["marketplace-subscription"] as const,
  plans: () => [...marketplaceSubKeys.all, "plans"] as const,
  subscription: () => [...marketplaceSubKeys.all, "subscription"] as const,
  credits: () => [...marketplaceSubKeys.all, "credits"] as const,
  creditHistory: (cursor?: string) =>
    [...marketplaceSubKeys.all, "credit-history", cursor] as const,
  downloads: (cursor?: string) =>
    [...marketplaceSubKeys.all, "downloads", cursor] as const,
  analytics: () => [...marketplaceSubKeys.all, "analytics"] as const,
};

interface PaginatedResponse<T> {
  items: T[];
  meta: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor?: string;
    previousCursor?: string;
  };
}

// Hooks
export function useMarketplacePlans() {
  return useQuery({
    queryKey: marketplaceSubKeys.plans(),
    queryFn: () =>
      apiGet<MarketplacePlan[]>(
        "/marketplace-subscriptions/plans",
        undefined,
        { skipAuth: true },
      ),
    staleTime: 30 * 60 * 1000,
  });
}

export function useMySubscription() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: marketplaceSubKeys.subscription(),
    queryFn: () =>
      apiGet<MarketplaceSubscription>(
        "/marketplace-subscriptions/my-subscription",
      ),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMyCreditBalance() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: marketplaceSubKeys.credits(),
    queryFn: () =>
      apiGet<CreditBalance>("/marketplace-subscriptions/credits"),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useCreditHistory(cursor?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: marketplaceSubKeys.creditHistory(cursor),
    queryFn: () =>
      apiGet<PaginatedResponse<CreditTransaction>>(
        `/marketplace-subscriptions/credits/history${cursor ? `?cursor=${cursor}` : ""}`,
      ),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useSubscriptionDownloads(cursor?: string) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: marketplaceSubKeys.downloads(cursor),
    queryFn: () =>
      apiGet<PaginatedResponse<SubscriptionDownload>>(
        `/marketplace-subscriptions/downloads${cursor ? `?cursor=${cursor}` : ""}`,
      ),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUsageAnalytics() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: marketplaceSubKeys.analytics(),
    queryFn: () =>
      apiGet<UsageAnalytics>(
        "/marketplace-subscriptions/credits/analytics",
      ),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubscribe() {
  return useMutation({
    mutationFn: async ({
      planId,
      billingPeriod,
    }: {
      planId: string;
      billingPeriod: BillingPeriod;
    }) => {
      const response = await apiPost<{ url: string }>(
        "/marketplace-subscriptions/subscribe",
        {
          planId,
          billingPeriod,
          successUrl: `${window.location.origin}/account/subscription?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        },
      );
      return response;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
  });
}

export function useDownloadWithCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      return apiPost<{
        downloadUrl: string;
        creditsUsed: number;
        creditsRemaining: number;
      }>(`/marketplace-subscriptions/downloads/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketplaceSubKeys.credits(),
      });
      queryClient.invalidateQueries({
        queryKey: marketplaceSubKeys.downloads(),
      });
    },
  });
}

export function useCancelMarketplaceSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ immediate }: { immediate?: boolean } = {}) => {
      return apiPost<{ message: string }>(
        "/marketplace-subscriptions/cancel",
        { immediate },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketplaceSubKeys.subscription(),
      });
    },
  });
}

export function useChangeMarketplacePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      newPlanId,
      billingPeriod,
    }: {
      newPlanId: string;
      billingPeriod?: BillingPeriod;
    }) => {
      return apiPost<{ message: string }>(
        "/marketplace-subscriptions/change-plan",
        { newPlanId, billingPeriod },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketplaceSubKeys.subscription(),
      });
      queryClient.invalidateQueries({
        queryKey: marketplaceSubKeys.credits(),
      });
    },
  });
}

export function usePauseSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (action: "pause" | "resume") => {
      return apiPost<{ message: string }>(
        `/marketplace-subscriptions/${action}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: marketplaceSubKeys.subscription(),
      });
    },
  });
}
