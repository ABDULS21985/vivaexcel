"use client";

// =============================================================================
// Smart Search Hooks
// =============================================================================
// React Query hooks for the AI-powered smart search system.
// Provides hooks for full search results and autocomplete suggestions.

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import type {
  SmartSearchResponse,
  AutocompleteItem,
} from "@/components/search/types";

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
}

// =============================================================================
// Query Keys
// =============================================================================

export const smartSearchKeys = {
  all: ["smart-search"] as const,
  search: (q: string, page?: number, limit?: number) =>
    [...smartSearchKeys.all, "results", q, page, limit] as const,
  autocomplete: (q: string) =>
    [...smartSearchKeys.all, "autocomplete", q] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch AI-powered smart search results with intent extraction.
 * Only fires when the query is at least 2 characters.
 */
export function useSmartSearch(
  query: string,
  page: number = 1,
  limit: number = 12,
) {
  return useQuery({
    queryKey: smartSearchKeys.search(query, page, limit),
    queryFn: () =>
      apiGet<ApiResponseWrapper<SmartSearchResponse>>("/search/smart", {
        q: query,
        page,
        limit,
      }).then((res) => res.data),
    enabled: !!query && query.length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch autocomplete suggestions for the search bar dropdown.
 * Only fires when the query is at least 2 characters.
 */
export function useAutocomplete(query: string, limit: number = 8) {
  return useQuery({
    queryKey: smartSearchKeys.autocomplete(query),
    queryFn: () =>
      apiGet<ApiResponseWrapper<AutocompleteItem[]>>(
        "/search/smart/autocomplete",
        { q: query, limit },
      ).then((res) => res.data ?? []),
    enabled: !!query && query.length >= 2,
    staleTime: 30 * 1000,
  });
}
