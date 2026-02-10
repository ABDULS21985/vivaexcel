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
  questions: (productId: string) =>
    [...qaKeys.all, "questions", productId] as const,
  questionList: (query: QAQueryParams) =>
    [...qaKeys.all, "list", query] as const,
  question: (id: string) => [...qaKeys.all, "question", id] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch paginated questions for a product with infinite scrolling support.
 */
export function useProductQuestions(query: QAQueryParams) {
  return useInfiniteQuery({
    queryKey: qaKeys.questionList(query),
    queryFn: ({ pageParam }: { pageParam: number | undefined }) =>
      apiGet<ApiResponseWrapper<QuestionsResponse>>(
        "/product-qa/questions",
        {
          productId: query.productId,
          sortBy: query.sortBy,
          page: pageParam ?? query.page ?? 1,
          limit: query.limit ?? 10,
        },
      ).then((res) => res.data),
    initialPageParam: 1 as number | undefined,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      if (meta.page < meta.totalPages) return meta.page + 1;
      return undefined;
    },
    enabled: !!query.productId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Fetch a single question with its answers.
 */
export function useProductQuestion(id: string) {
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

/**
 * Create a new question for a product.
 */
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
      queryClient.invalidateQueries({
        queryKey: qaKeys.all,
      });
    },
  });
}

/**
 * Create an answer to a question.
 */
export function useCreateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, ...payload }: CreateAnswerPayload) =>
      apiPost<ApiResponse<ProductAnswer>>(
        `/product-qa/questions/${questionId}/answers`,
        payload,
      ).then((res) => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: qaKeys.question(variables.questionId),
      });
      queryClient.invalidateQueries({ queryKey: qaKeys.all });
    },
  });
}

/**
 * Accept an answer as the best answer for a question.
 */
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

/**
 * Upvote a question.
 */
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

/**
 * Upvote an answer.
 */
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
