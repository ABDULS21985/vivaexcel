import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from "@/lib/api-client";
import type {
  DiscussionCategory,
  DiscussionThread,
  DiscussionReply,
  ThreadsResponse,
  ThreadQueryParams,
  CreateThreadPayload,
  UpdateThreadPayload,
  CreateReplyPayload,
} from "@/types/discussion";

// =============================================================================
// Internal Helpers
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Query Keys
// =============================================================================

export const discussionKeys = {
  all: ["discussions"] as const,
  categories: () => [...discussionKeys.all, "categories"] as const,
  threads: () => [...discussionKeys.all, "threads"] as const,
  threadList: (query: ThreadQueryParams) =>
    [...discussionKeys.threads(), query] as const,
  thread: (slug: string) =>
    [...discussionKeys.all, "thread", slug] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch all discussion categories.
 */
export function useDiscussionCategories() {
  return useQuery({
    queryKey: discussionKeys.categories(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<DiscussionCategory[]>>(
        "/discussions/categories",
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch paginated discussion threads with infinite scrolling support.
 */
export function useDiscussionThreads(query?: ThreadQueryParams) {
  return useInfiniteQuery({
    queryKey: discussionKeys.threadList(query ?? {}),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<ThreadsResponse>>("/discussions/threads", {
        ...query,
        page: pageParam ?? query?.page ?? 1,
      }).then((res) => res.data),
    initialPageParam: 1 as number | undefined,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Fetch a single discussion thread by slug.
 */
export function useDiscussionThread(slug: string) {
  return useQuery({
    queryKey: discussionKeys.thread(slug),
    queryFn: () =>
      apiGet<
        ApiResponseWrapper<{ thread: DiscussionThread; replies: DiscussionReply[] }>
      >(`/discussions/threads/${slug}`).then((res) => res.data),
    enabled: !!slug,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Create a new discussion thread.
 */
export function useCreateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateThreadPayload) =>
      apiPost<ApiResponse<DiscussionThread>>(
        "/discussions/threads",
        payload,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.categories() });
    },
  });
}

/**
 * Update an existing discussion thread.
 */
export function useUpdateThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, ...payload }: UpdateThreadPayload) =>
      apiPatch<ApiResponse<DiscussionThread>>(
        `/discussions/threads/${threadId}`,
        payload,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}

/**
 * Delete a discussion thread.
 */
export function useDeleteThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) =>
      apiDelete<ApiResponse<void>>(`/discussions/threads/${threadId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.categories() });
    },
  });
}

/**
 * Create a reply to a discussion thread.
 */
export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, ...payload }: CreateReplyPayload) =>
      apiPost<ApiResponse<DiscussionReply>>(
        `/discussions/threads/${threadId}/replies`,
        payload,
      ).then((res) => res.data),
    onSuccess: (_data, variables) => {
      // Invalidate all thread detail queries to refresh replies
      queryClient.invalidateQueries({ queryKey: discussionKeys.all });
    },
  });
}

/**
 * Toggle like on a discussion reply.
 */
export function useToggleReplyLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) =>
      apiPost<ApiResponse<{ liked: boolean }>>(
        `/discussions/replies/${replyId}/like`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.all });
    },
  });
}

/**
 * Mark a reply as the accepted answer for a thread.
 */
export function useMarkAsAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) =>
      apiPost<ApiResponse<DiscussionReply>>(
        `/discussions/replies/${replyId}/mark-answer`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.all });
    },
  });
}
