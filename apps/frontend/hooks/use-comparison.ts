import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import type { ComparisonData, ComparisonSet } from "@/types/comparison";

// =============================================================================
// Query Key Factory
// =============================================================================

export const comparisonKeys = {
  all: ["comparisons"] as const,
  set: (id: string) => [...comparisonKeys.all, "set", id] as const,
  quickCompare: (ids: string[]) =>
    [...comparisonKeys.all, "quick", ids.sort().join(",")] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch a persisted comparison set with full comparison data.
 */
export function useComparisonSet(id: string) {
  return useQuery({
    queryKey: comparisonKeys.set(id),
    queryFn: () =>
      apiGet<ComparisonData>(`/comparisons/${id}`).then(
        (res) => (res as any)?.data ?? res,
      ),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Quick compare products by IDs (no persistence).
 */
export function useQuickCompare(ids: string[]) {
  return useQuery({
    queryKey: comparisonKeys.quickCompare(ids),
    queryFn: () =>
      apiGet<ComparisonData>("/comparisons/quick", {
        ids: ids.join(","),
      }).then((res) => (res as any)?.data ?? res),
    enabled: ids.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Create a persisted comparison set.
 */
export function useCreateComparison() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { productIds: string[]; sessionId?: string }) =>
      apiPost<ComparisonSet>("/comparisons", data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comparisonKeys.all });
    },
  });
}

/**
 * Update a comparison set (add/remove product).
 */
export function useUpdateComparison() {
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
      apiPatch<ComparisonSet>(`/comparisons/${id}`, data).then(
        (res) => (res as any)?.data ?? res,
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: comparisonKeys.set(variables.id),
      });
    },
  });
}
