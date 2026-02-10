// =============================================================================
// Discussion Types
// =============================================================================
// Frontend types for the Discussion Forums feature.

import type { User } from "@/providers/auth-provider";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const ThreadSortBy = {
  NEWEST: "newest",
  ACTIVE: "active",
  POPULAR: "popular",
} as const;
export type ThreadSortBy = (typeof ThreadSortBy)[keyof typeof ThreadSortBy];

// -----------------------------------------------------------------------------
// Core Interfaces
// -----------------------------------------------------------------------------

export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  threadCount: number;
}

export interface DiscussionThread {
  id: string;
  categoryId: string;
  category: DiscussionCategory;
  userId: string;
  user: User;
  title: string;
  content: string;
  slug: string;
  isPinned: boolean;
  isLocked: boolean;
  isClosed: boolean;
  viewCount: number;
  replyCount: number;
  lastReplyAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionReply {
  id: string;
  threadId: string;
  userId: string;
  user: User;
  content: string;
  isAnswer: boolean;
  likesCount: number;
  parentId?: string;
  children?: DiscussionReply[];
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ThreadPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ThreadsResponse {
  items: DiscussionThread[];
  meta: ThreadPaginationMeta;
}

export interface ThreadDetailResponse {
  thread: DiscussionThread;
  replies: DiscussionReply[];
}

// -----------------------------------------------------------------------------
// Mutation Payloads
// -----------------------------------------------------------------------------

export interface CreateThreadPayload {
  title: string;
  content: string;
  categoryId: string;
  tags?: string[];
}

export interface UpdateThreadPayload {
  threadId: string;
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateReplyPayload {
  threadId: string;
  content: string;
  parentId?: string;
}

// -----------------------------------------------------------------------------
// Query Params
// -----------------------------------------------------------------------------

export interface ThreadQueryParams {
  page?: number;
  limit?: number;
  categorySlug?: string;
  sortBy?: ThreadSortBy;
  search?: string;
}
