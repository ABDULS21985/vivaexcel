import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Reading History Types
// =============================================================================

export interface ReadingHistoryEntry {
  id: string;
  postId: string;
  userId: string;
  progress: number;
  readAt: string;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    readingTime?: number | null;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
}

export interface ReadingStatsData {
  totalArticlesRead: number;
  totalReadingTime: number;
  streakDays: number;
  thisWeek: number;
}

// The backend returns ApiResponse-wrapped data:
// { status, message, data: { history, total, page, pageSize, totalPages } }
interface ReadingHistoryApiResponse {
  status: string;
  message: string;
  data: {
    history: ReadingHistoryEntry[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  // Legacy fields for backward compat with dashboard overview
  history?: ReadingHistoryEntry[];
  total?: number;
}

interface ReadingStatsApiResponse {
  status: string;
  message: string;
  data: ReadingStatsData;
  // Legacy fallback
  totalArticlesRead?: number;
  totalReadingTime?: number;
  streakDays?: number;
  thisWeek?: number;
}

interface TrackReadApiResponse {
  status: string;
  message: string;
  data: { entry: ReadingHistoryEntry | null };
}

// =============================================================================
// Query Keys
// =============================================================================

export const readingHistoryKeys = {
  all: ["readingHistory"] as const,
  lists: () => [...readingHistoryKeys.all, "list"] as const,
  list: (page?: number) =>
    [...readingHistoryKeys.lists(), { page }] as const,
  stats: () => [...readingHistoryKeys.all, "stats"] as const,
};

// =============================================================================
// Helpers
// =============================================================================

export function extractHistory(
  data: ReadingHistoryApiResponse | undefined
): ReadingHistoryEntry[] {
  if (!data) return [];
  if (data.data?.history) return data.data.history;
  if (data.history) return data.history;
  return [];
}

export function extractHistoryTotal(
  data: ReadingHistoryApiResponse | undefined
): number {
  if (!data) return 0;
  return data.data?.total ?? data.total ?? 0;
}

export function extractHistoryPages(
  data: ReadingHistoryApiResponse | undefined
): number {
  if (!data) return 0;
  return data.data?.totalPages ?? 0;
}

export function extractStats(
  data: ReadingStatsApiResponse | undefined
): ReadingStatsData {
  if (!data)
    return { totalArticlesRead: 0, totalReadingTime: 0, streakDays: 0, thisWeek: 0 };
  if (data.data) return data.data;
  return {
    totalArticlesRead: data.totalArticlesRead ?? 0,
    totalReadingTime: data.totalReadingTime ?? 0,
    streakDays: data.streakDays ?? 0,
    thisWeek: data.thisWeek ?? 0,
  };
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch the current user's reading history with pagination.
 */
export function useReadingHistory(page = 1, pageSize = 20) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: readingHistoryKeys.list(page),
    queryFn: () =>
      apiGet<ReadingHistoryApiResponse>("/reading-history", { page, pageSize }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch reading stats for the current user.
 */
export function useReadingStats() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: readingHistoryKeys.stats(),
    queryFn: () => apiGet<ReadingStatsApiResponse>("/reading-history/stats"),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Track a post as read with a given progress percentage.
 */
export function useTrackRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      progress = 100,
    }: {
      postId: string;
      progress?: number;
    }) => {
      return apiPost<TrackReadApiResponse>(
        `/reading-history/${postId}`,
        { progress }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.stats(),
      });
    },
  });
}

/**
 * Remove a single reading history entry.
 */
export function useRemoveHistoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      return apiDelete<{ status: string; message: string }>(
        `/reading-history/${entryId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.stats(),
      });
    },
  });
}

/**
 * Clear all reading history for the current user.
 */
export function useClearReadingHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiDelete<{ status: string; message: string }>(
        "/reading-history"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: readingHistoryKeys.stats(),
      });
    },
  });
}
