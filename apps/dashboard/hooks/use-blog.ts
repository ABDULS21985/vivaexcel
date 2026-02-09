"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, type ApiError } from "../lib/api-client";

// ─── Backend response wrapper ────────────────────────────────────────────────

interface ApiResponseWrapper<T> {
    status: string;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

// ─── Blog Types ──────────────────────────────────────────────────────────────

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
    status: "draft" | "published" | "scheduled" | "archived";
    visibility?: "public" | "members" | "paid";
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
    author?: {
        id: string;
        name: string;
        avatar?: string;
    };
    category?: {
        id: string;
        name: string;
        slug: string;
        color?: string;
    } | null;
    tags?: {
        id: string;
        name: string;
        slug: string;
    }[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    sortOrder?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BlogTag {
    id: string;
    name: string;
    slug: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface BlogPostsData {
    items: BlogPost[];
    meta: CursorMeta;
}

interface BlogCategoriesData {
    categories: BlogCategory[];
    total: number;
}

interface BlogTagsData {
    tags: BlogTag[];
    total: number;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const blogKeys = {
    all: ["blog"] as const,
    posts: () => [...blogKeys.all, "posts"] as const,
    postList: (filters: Record<string, unknown>) => [...blogKeys.posts(), "list", filters] as const,
    postDetail: (id: string) => [...blogKeys.posts(), "detail", id] as const,
    categories: () => [...blogKeys.all, "categories"] as const,
    tags: () => [...blogKeys.all, "tags"] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchBlogPosts(filters?: Record<string, unknown>): Promise<BlogPostsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<BlogPostsData>>(
        "/blog/posts",
        { params },
    );
    return response.data;
}

async function fetchBlogPost(id: string): Promise<BlogPost> {
    const response = await apiClient.get<ApiResponseWrapper<BlogPost>>(
        `/blog/posts/${id}`,
    );
    return response.data;
}

async function createPost(data: Record<string, unknown>): Promise<BlogPost> {
    const response = await apiClient.post<ApiResponseWrapper<BlogPost>>(
        "/blog/posts",
        data,
    );
    return response.data;
}

async function updatePost({ id, data }: { id: string; data: Record<string, unknown> }): Promise<BlogPost> {
    const response = await apiClient.patch<ApiResponseWrapper<BlogPost>>(
        `/blog/posts/${id}`,
        data,
    );
    return response.data;
}

async function deletePost(id: string): Promise<void> {
    await apiClient.delete(`/blog/posts/${id}`);
}

async function publishPost(id: string): Promise<BlogPost> {
    const response = await apiClient.post<ApiResponseWrapper<BlogPost>>(
        `/blog/posts/${id}/publish`,
    );
    return response.data;
}

async function unpublishPost(id: string): Promise<BlogPost> {
    const response = await apiClient.post<ApiResponseWrapper<BlogPost>>(
        `/blog/posts/${id}/unpublish`,
    );
    return response.data;
}

async function createTag(data: Record<string, unknown>): Promise<BlogTag> {
    const response = await apiClient.post<ApiResponseWrapper<BlogTag>>(
        "/blog/tags",
        data,
    );
    return response.data;
}

async function updateTag({ id, data }: { id: string; data: Record<string, unknown> }): Promise<BlogTag> {
    const response = await apiClient.patch<ApiResponseWrapper<BlogTag>>(
        `/blog/tags/${id}`,
        data,
    );
    return response.data;
}

async function deleteTag(id: string): Promise<void> {
    await apiClient.delete(`/blog/tags/${id}`);
}

async function createCategory(data: Record<string, unknown>): Promise<BlogCategory> {
    const response = await apiClient.post<ApiResponseWrapper<BlogCategory>>(
        "/blog/categories",
        data,
    );
    return response.data;
}

async function updateCategory({ id, data }: { id: string; data: Record<string, unknown> }): Promise<BlogCategory> {
    const response = await apiClient.patch<ApiResponseWrapper<BlogCategory>>(
        `/blog/categories/${id}`,
        data,
    );
    return response.data;
}

async function deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/blog/categories/${id}`);
}

async function fetchBlogCategories(): Promise<BlogCategoriesData> {
    const response = await apiClient.get<ApiResponseWrapper<BlogCategoriesData>>(
        "/blog/categories",
    );
    return response.data;
}

async function fetchBlogTags(): Promise<BlogTagsData> {
    const response = await apiClient.get<ApiResponseWrapper<BlogTagsData>>(
        "/blog/tags",
    );
    return response.data;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of blog posts.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useBlogPosts({ status: "published", limit: 10 });
 * const posts = data?.items ?? [];
 * ```
 */
export function useBlogPosts(filters?: Record<string, unknown>) {
    return useQuery<BlogPostsData, ApiError>({
        queryKey: blogKeys.postList(filters ?? {}),
        queryFn: () => fetchBlogPosts(filters),
    });
}

/**
 * Fetch a single blog post by ID.
 *
 * @example
 * ```tsx
 * const { data: post, isLoading } = useBlogPost("some-uuid");
 * ```
 */
export function useBlogPost(id: string) {
    return useQuery<BlogPost, ApiError>({
        queryKey: blogKeys.postDetail(id),
        queryFn: () => fetchBlogPost(id),
        enabled: !!id,
    });
}

/**
 * Create a new blog post.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreatePost();
 * mutate({ title: "My Post", content: "..." });
 * ```
 */
export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation<BlogPost, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createPost(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
        },
    });
}

/**
 * Update an existing blog post.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdatePost();
 * mutate({ id: "some-uuid", data: { title: "Updated Title" } });
 * ```
 */
export function useUpdatePost() {
    const queryClient = useQueryClient();

    return useMutation<BlogPost, ApiError, { id: string; data: Record<string, unknown> }>({
        mutationFn: (variables) => updatePost(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
            queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(variables.id) });
        },
    });
}

/**
 * Delete a blog post.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useDeletePost();
 * mutate("some-uuid");
 * ```
 */
export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
        },
    });
}

/**
 * Publish a blog post.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = usePublishPost();
 * mutate("some-uuid");
 * ```
 */
export function usePublishPost() {
    const queryClient = useQueryClient();

    return useMutation<BlogPost, ApiError, string>({
        mutationFn: (id) => publishPost(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
            queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(id) });
        },
    });
}

/**
 * Unpublish a blog post.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useUnpublishPost();
 * mutate("some-uuid");
 * ```
 */
export function useUnpublishPost() {
    const queryClient = useQueryClient();

    return useMutation<BlogPost, ApiError, string>({
        mutationFn: (id) => unpublishPost(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
            queryClient.invalidateQueries({ queryKey: blogKeys.postDetail(id) });
        },
    });
}

/**
 * Fetch all blog categories.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBlogCategories();
 * const categories = data?.categories ?? [];
 * ```
 */
export function useBlogCategories() {
    return useQuery<BlogCategoriesData, ApiError>({
        queryKey: blogKeys.categories(),
        queryFn: fetchBlogCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch all blog tags.
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useBlogTags();
 * const tags = data?.tags ?? [];
 * ```
 */
export function useBlogTags() {
    return useQuery<BlogTagsData, ApiError>({
        queryKey: blogKeys.tags(),
        queryFn: fetchBlogTags,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useCreateTag() {
    const queryClient = useQueryClient();

    return useMutation<BlogTag, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createTag(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
        },
    });
}

export function useUpdateTag() {
    const queryClient = useQueryClient();

    return useMutation<BlogTag, ApiError, { id: string; data: Record<string, unknown> }>({
        mutationFn: (variables) => updateTag(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
        },
    });
}

export function useDeleteTag() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteTag(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.tags() });
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation<BlogCategory, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();

    return useMutation<BlogCategory, ApiError, { id: string; data: Record<string, unknown> }>({
        mutationFn: (variables) => updateCategory(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: blogKeys.categories() });
        },
    });
}
