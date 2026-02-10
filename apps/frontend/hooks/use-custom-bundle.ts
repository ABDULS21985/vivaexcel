import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import type {
  CustomBundle,
  BundleSuggestion,
  BundleCheckoutResult,
} from "@/types/custom-bundle";

// =============================================================================
// Query Key Factory
// =============================================================================

export const bundleKeys = {
  all: ["bundles"] as const,
  bundle: (id: string) => [...bundleKeys.all, "detail", id] as const,
  shared: (token: string) => [...bundleKeys.all, "shared", token] as const,
  suggestions: (id: string) =>
    [...bundleKeys.all, "suggestions", id] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch a custom bundle with products and pricing.
 */
export function useCustomBundle(id: string | undefined) {
  return useQuery({
    queryKey: bundleKeys.bundle(id ?? ""),
    queryFn: () =>
      apiGet<CustomBundle>(`/bundles/custom/${id}`).then(
        (res) => (res as any)?.data ?? res,
      ),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch a shared bundle by share token (public).
 */
export function useSharedBundle(shareToken: string | undefined) {
  return useQuery({
    queryKey: bundleKeys.shared(shareToken ?? ""),
    queryFn: () =>
      apiGet<CustomBundle>(`/bundles/shared/${shareToken}`).then(
        (res) => (res as any)?.data ?? res,
      ),
    enabled: !!shareToken,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch AI-powered bundle addition suggestions.
 */
export function useBundleSuggestions(bundleId: string | undefined) {
  return useQuery({
    queryKey: bundleKeys.suggestions(bundleId ?? ""),
    queryFn: () =>
      apiGet<BundleSuggestion[]>(
        `/bundles/custom/${bundleId}/suggestions`,
      ).then((res) => (res as any)?.data ?? res),
    enabled: !!bundleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a custom bundle.
 */
export function useCreateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { productIds: string[]; sessionId?: string }) =>
      apiPost<CustomBundle>("/bundles/custom", data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bundleKeys.all });
    },
  });
}

/**
 * Update a custom bundle (add/remove product).
 */
export function useUpdateBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      action: "add" | "remove";
      productId: string;
      sessionId?: string;
    }) =>
      apiPatch<CustomBundle>(`/bundles/custom/${id}`, data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: bundleKeys.bundle(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: bundleKeys.suggestions(variables.id),
      });
    },
  });
}

/**
 * Checkout a custom bundle (convert to cart with coupon).
 */
export function useCheckoutBundle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bundleId: string) =>
      apiPost<BundleCheckoutResult>(
        `/bundles/custom/${bundleId}/checkout`,
      ).then((res) => (res as any)?.data ?? res),
    onSuccess: (_data, bundleId) => {
      queryClient.invalidateQueries({
        queryKey: bundleKeys.bundle(bundleId),
      });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
