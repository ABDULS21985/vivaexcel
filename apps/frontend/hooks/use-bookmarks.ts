import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Bookmark Types
// =============================================================================

export interface Bookmark {
  id: string;
  postId: string;
  userId: string;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    readingTime?: number;
    category?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  createdAt: string;
}

interface BookmarksResponse {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface BookmarkStatusResponse {
  isBookmarked: boolean;
}

// =============================================================================
// Query Keys
// =============================================================================

export const bookmarkKeys = {
  all: ["bookmarks"] as const,
  lists: () => [...bookmarkKeys.all, "list"] as const,
  list: (page?: number) => [...bookmarkKeys.lists(), { page }] as const,
  status: (postId: string) => [...bookmarkKeys.all, "status", postId] as const,
};

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
      apiGet<BookmarksResponse>("/bookmarks", { page, pageSize }),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000, // 2 minutes
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
    },
  });
}
