// =============================================================================
// Blog System Types
// =============================================================================
// Frontend types for the blog system, based on backend blog entities

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum BlogPostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  SCHEDULED = 'scheduled',
  ARCHIVED = 'archived',
}

export enum BlogPostVisibility {
  PUBLIC = 'public',
  MEMBERS = 'members',
  PAID = 'paid',
}

// -----------------------------------------------------------------------------
// Core Blog Types
// -----------------------------------------------------------------------------

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
  slug?: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogCategory {
  id: string;
  parentId?: string | null;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
  parent?: BlogCategory | null;
  children?: BlogCategory[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  authorId: string;
  categoryId?: string | null;
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  content?: string | null;
  featuredImage?: string | null;
  status: BlogPostStatus;
  visibility?: BlogPostVisibility;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  viewsCount: number;
  readingTime?: number;
  wordCount?: number;
  isFeatured?: boolean;
  allowComments?: boolean;
  noIndex?: boolean;
  canonicalUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string[];
  author?: BlogAuthor;
  category?: BlogCategory | null;
  tags?: BlogTag[];
  // Content gating fields
  paywalled?: boolean;
  gated?: boolean;
  requiresSubscription?: boolean;
  minimumTier?: string;
  createdAt?: string;
  updatedAt?: string;
}

// -----------------------------------------------------------------------------
// Preview/List Types
// -----------------------------------------------------------------------------

export interface BlogPostPreview {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  featuredImage?: string | null;
  publishedAt?: string | null;
  readingTime?: number;
  viewsCount?: number;
  isFeatured?: boolean;
  author?: BlogAuthor;
  category?: BlogCategory | null;
  tags?: BlogTag[];
}

export interface BlogCategoryPreview {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

export interface BlogTagPreview {
  id: string;
  name: string;
  slug: string;
  postCount?: number;
}

// -----------------------------------------------------------------------------
// Component Props Types
// -----------------------------------------------------------------------------

export interface BlogPostCardProps {
  post: BlogPostPreview;
  showAuthor?: boolean;
  showCategory?: boolean;
  showTags?: boolean;
}

export interface BlogPostGridProps {
  posts: BlogPostPreview[];
  layout?: 'grid' | 'list';
  showPagination?: boolean;
}

export interface BlogCategoryListProps {
  categories: BlogCategoryPreview[];
  activeSlug?: string;
}

export interface BlogTagCloudProps {
  tags: BlogTagPreview[];
  maxTags?: number;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

/** Wraps all backend responses */
export interface ApiResponseWrapper<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  meta?: CursorMeta;
}

/** Cursor-based pagination metadata from the backend */
export interface CursorMeta {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

/** Paginated list response from the backend */
export interface PaginatedResponse<T> {
  items: T[];
  meta: CursorMeta;
}

/** Blog posts paginated response */
export interface BlogPostsResponse {
  items: BlogPost[];
  meta: CursorMeta;
}

export interface BlogCategoriesResponse {
  categories: BlogCategory[];
  total: number;
}

export interface BlogTagsResponse {
  tags: BlogTag[];
  total: number;
}

// -----------------------------------------------------------------------------
// Filter/Query Types
// -----------------------------------------------------------------------------

export interface BlogPostFilters {
  cursor?: string;
  limit?: number;
  categorySlug?: string;
  categoryId?: string;
  tagSlug?: string;
  tagId?: string;
  authorId?: string;
  status?: BlogPostStatus;
  search?: string;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// -----------------------------------------------------------------------------
// Search Types
// -----------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  headline?: string;
  featuredImage?: string;
  authorName?: string;
  categoryName?: string;
  categorySlug?: string;
  publishedAt?: string;
  rank?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchSuggestion {
  title: string;
  slug: string;
}

export interface PopularSearch {
  query: string;
  count: number;
}

// -----------------------------------------------------------------------------
// BlogGrid Component Types
// -----------------------------------------------------------------------------

export type BlogSortOption = 'latest' | 'popular' | 'trending';
export type BlogViewMode = 'grid' | 'list';

export interface BlogGridProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  showFilters?: boolean;
  showFeatured?: boolean;
  initialCategory?: string;
  className?: string;
}

export interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'compact' | 'featured' | 'list';
  showAuthor?: boolean;
  showCategory?: boolean;
  showReadingTime?: boolean;
  showViews?: boolean;
  className?: string;
}
