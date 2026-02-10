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
  threadList: (params?: ThreadQueryParams) =>
    [...discussionKeys.threads(), "list", params] as const,
  thread: (slug: string) =>
    [...discussionKeys.threads(), "detail", slug] as const,
};

// =============================================================================
// Hooks
// =============================================================================

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

export function useDiscussionThreads(params?: ThreadQueryParams) {
  return useInfiniteQuery({
    queryKey: discussionKeys.threadList(params),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<ThreadsResponse>>("/discussions/threads", {
        ...params,
        page: pageParam ?? params?.page ?? 1,
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

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, ...payload }: CreateReplyPayload) =>
      apiPost<ApiResponse<DiscussionReply>>(
        `/discussions/threads/${threadId}/replies`,
        payload,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}

export function useToggleReplyLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) =>
      apiPost<ApiResponse<{ liked: boolean }>>(
        `/discussions/replies/${replyId}/like`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}

export function useMarkAsAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (replyId: string) =>
      apiPost<ApiResponse<DiscussionReply>>(
        `/discussions/replies/${replyId}/mark-answer`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}
