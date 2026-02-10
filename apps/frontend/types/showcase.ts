// =============================================================================
// Showcase Types
// =============================================================================
// Frontend types for the User Showcases feature.

import type { DigitalProduct } from "./digital-product";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export const ShowcaseStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FEATURED: "featured",
} as const;
export type ShowcaseStatus =
  (typeof ShowcaseStatus)[keyof typeof ShowcaseStatus];

export const ShowcaseSortBy = {
  NEWEST: "newest",
  POPULAR: "popular",
  FEATURED: "featured",
} as const;
export type ShowcaseSortBy =
  (typeof ShowcaseSortBy)[keyof typeof ShowcaseSortBy];

// -----------------------------------------------------------------------------
// Core Interfaces
// -----------------------------------------------------------------------------

export interface ShowcaseUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  username?: string;
}

export interface Showcase {
  id: string;
  userId: string;
  user?: ShowcaseUser;
  productId: string;
  product?: DigitalProduct;
  title: string;
  description: string;
  images: string[];
  projectUrl?: string;
  tags: string[];
  status: ShowcaseStatus;
  likesCount: number;
  commentsCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShowcaseComment {
  id: string;
  showcaseId: string;
  userId: string;
  user?: ShowcaseUser;
  content: string;
  parentId?: string;
  createdAt: string;
  replies?: ShowcaseComment[];
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ShowcasePaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShowcasesResponse {
  items: Showcase[];
  meta: ShowcasePaginationMeta;
}

export interface ShowcaseCommentsResponse {
  items: ShowcaseComment[];
  meta: ShowcasePaginationMeta;
}

// -----------------------------------------------------------------------------
// Mutation Payloads
// -----------------------------------------------------------------------------

export interface CreateShowcasePayload {
  productId: string;
  title: string;
  description: string;
  images?: string[];
  projectUrl?: string;
  tags?: string[];
}

export interface UpdateShowcasePayload {
  showcaseId: string;
  title?: string;
  description?: string;
  images?: string[];
  projectUrl?: string;
  tags?: string[];
}

export interface CreateShowcaseCommentPayload {
  showcaseId: string;
  content: string;
  parentId?: string;
}

// -----------------------------------------------------------------------------
// Query Params
// -----------------------------------------------------------------------------

export interface ShowcaseQueryParams {
  page?: number;
  limit?: number;
  sortBy?: ShowcaseSortBy;
  status?: ShowcaseStatus;
  userId?: string;
  productId?: string;
}
