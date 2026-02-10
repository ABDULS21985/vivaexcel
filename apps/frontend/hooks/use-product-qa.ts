import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { apiGet, apiPost, type ApiResponse } from "@/lib/api-client";
import type {
  ProductQuestion,
  ProductAnswer,
  QuestionsResponse,
  QAQueryParams,
  CreateQuestionPayload,
  CreateAnswerPayload,
  QASortBy,
} from "@/types/product-qa";

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

export const qaKeys = {
  all: ["product-qa"] as const,
  questions: (productId: string, sortBy?: QASortBy) =>
    [...qaKeys.all, "questions", productId, sortBy] as const,
  question: (id: string) => [...qaKeys.all, "question", id] as const,
};

// =============================================================================
// Hooks
// =============================================================================

export function useProductQuestions(
  productId: string,
  sortBy?: QASortBy,
) {
  return useInfiniteQuery({
    queryKey: qaKeys.questions(productId, sortBy),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<QuestionsResponse>>(
        "/product-qa/questions",
        {
          productId,
          sortBy,
          page: pageParam ?? 1,
          limit: 10,
        },
      ).then((res) => res.data),
    initialPageParam: 1 as number | undefined,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useQuestionDetail(id: string) {
  return useQuery({
    queryKey: qaKeys.question(id),
    queryFn: () =>
      apiGet<
        ApiResponseWrapper<{ question: ProductQuestion; answers: ProductAnswer[] }>
      >(`/product-qa/questions/${id}`).then((res) => res.data),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuestionPayload) =>
      apiPost<ApiResponse<ProductQuestion>>(
        "/product-qa/questions",
        payload,
      ).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: qaKeys.questions(variables.productId),
      });
    },
  });
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, ...payload }: CreateAnswerPayload) =>
      apiPost<ApiResponse<ProductAnswer>>(
        `/product-qa/questions/${questionId}/answers`,
        payload,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaKeys.all });
    },
  });
}

export function useAcceptAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: string) =>
      apiPost<ApiResponse<ProductAnswer>>(
        `/product-qa/answers/${answerId}/accept`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaKeys.all });
    },
  });
}

export function useUpvoteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (questionId: string) =>
      apiPost<ApiResponse<{ upvoted: boolean; upvoteCount: number }>>(
        `/product-qa/questions/${questionId}/upvote`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaKeys.all });
    },
  });
}

export function useUpvoteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answerId: string) =>
      apiPost<ApiResponse<{ upvoted: boolean; upvoteCount: number }>>(
        `/product-qa/answers/${answerId}/upvote`,
      ).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qaKeys.all });
    },
  });
}
