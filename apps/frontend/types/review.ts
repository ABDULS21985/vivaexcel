// =============================================================================
// Review & Rating Types
// =============================================================================
// Frontend types for the Reviews, Ratings & Social Proof module,
// based on backend entities.

// -----------------------------------------------------------------------------
// Enums (as const objects + derived types)
// -----------------------------------------------------------------------------

export const ReviewStatus = {
  PENDING_MODERATION: "PENDING_MODERATION",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  FLAGGED: "FLAGGED",
} as const;
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus];

export const VoteType = {
  HELPFUL: "HELPFUL",
  NOT_HELPFUL: "NOT_HELPFUL",
} as const;
export type VoteType = (typeof VoteType)[keyof typeof VoteType];

export const ReviewSortBy = {
  NEWEST: "newest",
  HIGHEST: "highest",
  LOWEST: "lowest",
  MOST_HELPFUL: "most_helpful",
} as const;
export type ReviewSortBy = (typeof ReviewSortBy)[keyof typeof ReviewSortBy];

// -----------------------------------------------------------------------------
// Core Interfaces
// -----------------------------------------------------------------------------

export interface ReviewUser {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Review {
  id: string;
  userId: string;
  digitalProductId: string;
  orderId?: string;
  rating: number;
  title: string;
  body: string;
  pros: string[];
  cons: string[];
  status: ReviewStatus;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  sellerResponse?: string;
  sellerRespondedAt?: string;
  metadata?: Record<string, any>;
  images: string[];
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: ReviewUser;
  userVote?: VoteType | null;
}

// -----------------------------------------------------------------------------
// Aggregate / Stats
// -----------------------------------------------------------------------------

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
  verifiedPurchasePercent: number;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface ReviewCursorMeta {
  hasMore: boolean;
  nextCursor?: string;
  total: number;
}

export interface ReviewsResponse {
  items: Review[];
  meta: ReviewCursorMeta;
}

// -----------------------------------------------------------------------------
// Mutation Payloads
// -----------------------------------------------------------------------------

export interface CreateReviewPayload {
  digitalProductId: string;
  rating: number;
  title: string;
  body: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

export interface UpdateReviewPayload {
  reviewId: string;
  rating?: number;
  title?: string;
  body?: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
}

export interface VoteOnReviewPayload {
  reviewId: string;
  vote: VoteType;
}

export interface ReportReviewPayload {
  reviewId: string;
  reason: string;
}

// -----------------------------------------------------------------------------
// Query Params
// -----------------------------------------------------------------------------

export interface ReviewQueryParams {
  productId: string;
  sortBy?: ReviewSortBy;
  ratingFilter?: number;
  cursor?: string;
  limit?: number;
}

// -----------------------------------------------------------------------------
// Top Reviewers
// -----------------------------------------------------------------------------

export interface TopReviewer {
  userId: string;
  name: string;
  avatar?: string;
  totalReviews: number;
  helpfulVotes: number;
  averageRating: number;
}

// -----------------------------------------------------------------------------
// Seller Response
// -----------------------------------------------------------------------------

export interface SellerResponsePayload {
  reviewId: string;
  response: string;
}

// -----------------------------------------------------------------------------
// Social Proof
// -----------------------------------------------------------------------------

export interface RecentPurchasesData {
  count: number;
  recentBuyerNames: string[];
}

// -----------------------------------------------------------------------------
// Display Helper Maps
// -----------------------------------------------------------------------------

export const REVIEW_SORT_LABELS: Record<ReviewSortBy, string> = {
  [ReviewSortBy.MOST_HELPFUL]: "Most Helpful",
  [ReviewSortBy.NEWEST]: "Newest",
  [ReviewSortBy.HIGHEST]: "Highest Rating",
  [ReviewSortBy.LOWEST]: "Lowest Rating",
};
