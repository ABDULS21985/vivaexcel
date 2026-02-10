import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Bookmark Types
// =============================================================================

export interface BookmarkPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  readingTime?: number;
  views?: number;
  author?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  post: BookmarkPost;
  createdAt: string;
}

// The backend returns ApiResponse<PaginatedResponse<Bookmark>>:
// { status, message, data: { items: Bookmark[], meta }, meta }
interface BookmarksPaginatedResponse {
  status: string;
  message: string;
  data: {
    items: Bookmark[];
    meta: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      nextCursor?: string;
      previousCursor?: string;
    };
  };
  meta?: {
    hasNextPage?: boolean;
    nextCursor?: string;
  };
  // Legacy fields for backward compat with dashboard overview
  bookmarks?: Bookmark[];
  total?: number;
}

interface BookmarkStatusResponse {
  isBookmarked?: boolean;
  // Backend returns { status, data: { bookmarked } }
  data?: { bookmarked: boolean };
  bookmarked?: boolean;
}

// =============================================================================
// Query Keys
// =============================================================================

export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  lists: () => [...bookmarkKeys.all, "list"] as const,
  list: (page?: number) => [...bookmarkKeys.lists(), { page }] as const,
  infinite: () => [...bookmarkKeys.all, "infinite"] as const,
  status: (postId: string) => [...bookmarkKeys.all, "status", postId] as const,
};

// =============================================================================
// Helpers
// =============================================================================

/**
 * Extract bookmark items from the API response, handling multiple response shapes.
 */
export function extractBookmarks(
  data: BookmarksPaginatedResponse | undefined
): Bookmark[] {
  if (!data) return [];
  // Shape 1: { data: { items: [...] } }
  if (data.data?.items) return data.data.items;
  // Shape 2: { bookmarks: [...] }
  if (data.bookmarks) return data.bookmarks;
  return [];
}

/**
 * Extract hasNextPage from the API response.
 */
export function extractHasNextPage(
  data: BookmarksPaginatedResponse | undefined
): boolean {
  if (!data) return false;
  return data.data?.meta?.hasNextPage ?? data.meta?.hasNextPage ?? false;
}

/**
 * Extract nextCursor from the API response.
 */
export function extractNextCursor(
  data: BookmarksPaginatedResponse | undefined
): string | undefined {
  if (!data) return undefined;
  return data.data?.meta?.nextCursor ?? data.meta?.nextCursor;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch the current user's bookmarks with pagination.
 */
export function useBookmarks(page = 1, pageSize = 20) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: bookmarkKeys.list(page),
    queryFn: () =>
      apiGet<BookmarksPaginatedResponse>("/bookmarks", {
        limit: pageSize,
      }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch bookmarks with infinite scroll / cursor pagination.
 */
export function useInfiniteBookmarks(pageSize = 12) {
  const { isAuthenticated } = useAuth();

  return useInfiniteQuery({
    queryKey: bookmarkKeys.infinite(),
    queryFn: ({ pageParam }) =>
      apiGet<BookmarksPaginatedResponse>("/bookmarks", {
        limit: pageSize,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => extractNextCursor(lastPage),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Check if a specific post is bookmarked by the current user.
 */
export function useBookmarkStatus(postId: string) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: bookmarkKeys.status(postId),
    queryFn: () =>
      apiGet<BookmarkStatusResponse>(`/bookmarks/${postId}/status`),
    enabled: isAuthenticated && !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Toggle bookmark for a post (add or remove).
 * Uses optimistic updates for instant UI feedback.
 */
export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      isCurrentlyBookmarked,
    }: {
      postId: string;
      isCurrentlyBookmarked: boolean;
    }) => {
      if (isCurrentlyBookmarked) {
        return apiDelete<{ message: string }>(`/bookmarks/${postId}`);
      } else {
        return apiPost<{ bookmark: Bookmark }>(`/bookmarks/${postId}`);
      }
    },

    // Optimistic update: toggle status immediately
    onMutate: async ({ postId, isCurrentlyBookmarked }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey: bookmarkKeys.status(postId),
      });
      await queryClient.cancelQueries({
        queryKey: bookmarkKeys.lists(),
      });

      // Snapshot previous values
      const previousStatus = queryClient.getQueryData<BookmarkStatusResponse>(
        bookmarkKeys.status(postId)
      );

      // Optimistically set new status
      queryClient.setQueryData<BookmarkStatusResponse>(
        bookmarkKeys.status(postId),
        { isBookmarked: !isCurrentlyBookmarked }
      );

      return { previousStatus, postId };
    },

    // Revert on error
    onError: (_err, { postId }, context) => {
      if (context?.previousStatus) {
        queryClient.setQueryData(
          bookmarkKeys.status(postId),
          context.previousStatus
        );
      }
    },

    // Refetch after success or error
    onSettled: (_data, _error, { postId }) => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.status(postId) });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.infinite() });
    },
  });
}

/**
 * Remove a bookmark by post ID (used in dashboard).
 */
export function useRemoveBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      return apiDelete<{ message: string }>(`/bookmarks/${postId}`);
    },
    onSuccess: (_data, postId) => {
      // Update status cache
      queryClient.setQueryData<BookmarkStatusResponse>(
        bookmarkKeys.status(postId),
        { isBookmarked: false }
      );
      // Refetch bookmark list
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.infinite() });
    },
  });
}
