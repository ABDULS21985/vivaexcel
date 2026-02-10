// =============================================================================
// Product Q&A Types
// =============================================================================
// Frontend types for the Product Questions & Answers feature.

import type { User } from "@/providers/auth-provider";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const QASortBy = {
  NEWEST: "newest",
  POPULAR: "popular",
  UNANSWERED: "unanswered",
} as const;
export type QASortBy = (typeof QASortBy)[keyof typeof QASortBy];

// -----------------------------------------------------------------------------
// Core Interfaces
// -----------------------------------------------------------------------------

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  user: User;
  content: string;
  answerCount: number;
  upvoteCount: number;
  answers?: ProductAnswer[];
  createdAt: string;
  updatedAt: string;
  topAnswer?: ProductAnswer;
}

export interface ProductAnswer {
  id: string;
  questionId: string;
  userId: string;
  user: User;
  content: string;
  isSellerAnswer: boolean;
  isAccepted: boolean;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface QAPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuestionsResponse {
  items: ProductQuestion[];
  meta: QAPaginationMeta;
}

export interface QuestionDetailResponse {
  question: ProductQuestion;
  answers: ProductAnswer[];
}

// -----------------------------------------------------------------------------
// Mutation Payloads
// -----------------------------------------------------------------------------

export interface CreateQuestionPayload {
  productId: string;
  content: string;
}

export interface CreateAnswerPayload {
  questionId: string;
  content: string;
}

// -----------------------------------------------------------------------------
// Query Params
// -----------------------------------------------------------------------------

export interface QAQueryParams {
  productId: string;
  page?: number;
  limit?: number;
  sortBy?: QASortBy;
}
