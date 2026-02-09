// =============================================================================
// Server-Side Blog API
// =============================================================================
// Utility for fetching blog data from the backend in Next.js server components.
// Uses plain fetch() with ISR caching — NOT the client-side apiClient which
// relies on localStorage for JWT tokens.

import type {
  BlogPost,
  BlogCategory,
  BlogTag,
  BlogAuthor,
  BlogPostFilters,
  BlogPostsResponse,
  CursorMeta,
  ApiResponseWrapper,
  PaginatedResponse,
} from "@/types/blog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// =============================================================================
// Internal Helpers — Data Transform
// =============================================================================

/**
 * Transform a backend user/author object into the frontend BlogAuthor shape.
 * Backend sends { id, firstName, lastName, avatar } but the frontend expects
 * { id, name, avatar } with firstName + lastName concatenated.
 */
function transformAuthor(user: any): BlogAuthor {
  if (!user) return user;
  return {
    id: user.id,
    name:
      user.name ||
      [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      "Unknown",
    avatar: user.avatar,
    bio: user.bio,
    role: user.role,
    slug: user.slug,
  };
}

/**
 * Transform a single backend post into the frontend BlogPost shape.
 * - Maps `views` (backend) to `viewsCount` (frontend)
 * - Transforms the nested author object
 */
function transformPost(post: any): BlogPost {
  if (!post) return post;
  return {
    ...post,
    viewsCount: post.viewsCount ?? post.views ?? 0,
    author: post.author ? transformAuthor(post.author) : undefined,
  };
}

/**
 * Transform an array of backend posts.
 */
function transformPosts(posts: any[]): BlogPost[] {
  if (!Array.isArray(posts)) return [];
  return posts.map(transformPost);
}

// =============================================================================
// Internal Helpers — Fetch
// =============================================================================

/**
 * Generic fetcher that unwraps the standard API response wrapper
 * `{ status, message, data, meta }` and returns just the `data` portion.
 */
async function fetchApi<T>(
  endpoint: string,
  revalidate: number = 60,
): Promise<{ data: T | undefined; meta?: CursorMeta }> {
  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: { revalidate },
    });

    if (!response.ok) {
      console.error(
        `[blog-api] GET ${endpoint} failed with status ${response.status}`,
      );
      return { data: undefined };
    }

    const json: ApiResponseWrapper<T> = await response.json();

    return {
      data: json.data,
      meta: json.meta,
    };
  } catch (error) {
    console.error(`[blog-api] GET ${endpoint} error:`, error);
    return { data: undefined };
  }
}

// =============================================================================
// Public API
// =============================================================================

/**
 * Fetch a paginated list of blog posts with optional cursor-based filters.
 */
export async function fetchPosts(
  filters?: BlogPostFilters,
): Promise<BlogPostsResponse> {
  const params = new URLSearchParams();

  if (filters) {
    const mappings: Record<string, string | number | boolean | undefined> = {
      cursor: filters.cursor,
      limit: filters.limit,
      search: filters.search,
      status: filters.status,
      authorId: filters.authorId,
      categoryId: filters.categoryId,
      categorySlug: filters.categorySlug,
      tagId: filters.tagId,
      tagSlug: filters.tagSlug,
      isFeatured: filters.isFeatured,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    Object.entries(mappings).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const qs = params.toString();
  const endpoint = `/blog/posts${qs ? `?${qs}` : ""}`;

  const { data, meta } = await fetchApi<PaginatedResponse<any>>(endpoint, 60);

  if (!data) {
    return { items: [], meta: { hasNextPage: false, hasPreviousPage: false } };
  }

  return {
    items: transformPosts(data.items),
    meta: meta || data.meta || { hasNextPage: false, hasPreviousPage: false },
  };
}

/**
 * Fetch a single blog post by its URL slug.
 * Returns null if the post is not found or an error occurs.
 */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await fetchApi<any>(`/blog/posts/slug/${slug}`, 60);

  if (!data) return null;

  return transformPost(data);
}

/**
 * Fetch all blog categories.
 * Uses a longer revalidation window (300s) since categories change infrequently.
 */
export async function fetchCategories(): Promise<BlogCategory[]> {
  const { data } = await fetchApi<BlogCategory[]>("/blog/categories", 300);

  return data || [];
}

/**
 * Fetch all blog tags.
 * Uses a longer revalidation window (300s) since tags change infrequently.
 */
export async function fetchTags(): Promise<BlogTag[]> {
  const { data } = await fetchApi<BlogTag[]>("/blog/tags", 300);

  return data || [];
}

/**
 * Fetch featured blog posts with an optional limit.
 */
export async function fetchFeaturedPosts(
  limit: number = 5,
): Promise<BlogPost[]> {
  const result = await fetchPosts({ isFeatured: true, limit });
  return result.items;
}

/**
 * Full-text search for blog posts.
 */
export async function searchPosts(
  query: string,
  options?: {
    category?: string;
    tag?: string;
    page?: number;
    limit?: number;
  },
): Promise<{ results: any[]; total: number }> {
  const params = new URLSearchParams();
  params.append("q", query);

  if (options?.category) params.append("category", options.category);
  if (options?.tag) params.append("tag", options.tag);
  if (options?.page !== undefined) params.append("page", String(options.page));
  if (options?.limit !== undefined)
    params.append("limit", String(options.limit));

  const qs = params.toString();
  const endpoint = `/search${qs ? `?${qs}` : ""}`;

  const { data } = await fetchApi<{ results: any[]; total: number }>(
    endpoint,
    60,
  );

  if (!data) {
    return { results: [], total: 0 };
  }

  return {
    results: data.results || [],
    total: data.total || 0,
  };
}
