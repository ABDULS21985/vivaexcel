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

// ─── Digital Product Types ───────────────────────────────────────────────────

export interface DigitalProduct {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
    type:
        | "powerpoint"
        | "document"
        | "web_template"
        | "startup_kit"
        | "solution_template"
        | "design_system"
        | "code_template"
        | "other";
    status: "draft" | "published" | "archived" | "coming_soon";
    price: number;
    compareAtPrice?: number | null;
    currency: string;
    featuredImage?: string | null;
    galleryImages?: string[] | null;
    downloadCount: number;
    viewCount: number;
    averageRating: number;
    totalReviews: number;
    isFeatured: boolean;
    isBestseller: boolean;
    metadata?: Record<string, any> | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string[];
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    creator?: { id: string; name: string; avatar?: string } | null;
    category?: { id: string; name: string; slug: string } | null;
    tags?: { id: string; name: string; slug: string }[];
    variants?: {
        id: string;
        name: string;
        price: number;
        features?: string[];
        sortOrder: number;
    }[];
    previews?: {
        id: string;
        type: string;
        url: string;
        thumbnailUrl?: string;
        sortOrder: number;
    }[];
}

export interface DigitalProductCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive?: boolean;
    order?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DigitalProductTag {
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

interface DigitalProductsData {
    items: DigitalProduct[];
    meta: CursorMeta;
}

interface DigitalProductCategoriesData {
    categories: DigitalProductCategory[];
    total: number;
}

interface DigitalProductTagsData {
    tags: DigitalProductTag[];
    total: number;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const digitalProductKeys = {
    all: ["digital-products"] as const,
    products: () => [...digitalProductKeys.all, "products"] as const,
    productList: (filters: Record<string, unknown>) =>
        [...digitalProductKeys.products(), "list", filters] as const,
    productDetail: (id: string) =>
        [...digitalProductKeys.products(), "detail", id] as const,
    categories: () => [...digitalProductKeys.all, "categories"] as const,
    tags: () => [...digitalProductKeys.all, "tags"] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchDigitalProducts(
    filters?: Record<string, unknown>
): Promise<DigitalProductsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<
        ApiResponseWrapper<DigitalProductsData>
    >("/digital-products", { params });
    return response.data;
}

async function fetchDigitalProduct(id: string): Promise<DigitalProduct> {
    const response = await apiClient.get<ApiResponseWrapper<DigitalProduct>>(
        `/digital-products/${id}`
    );
    return response.data;
}

async function createDigitalProduct(
    data: Record<string, unknown>
): Promise<DigitalProduct> {
    const response = await apiClient.post<ApiResponseWrapper<DigitalProduct>>(
        "/digital-products",
        data
    );
    return response.data;
}

async function updateDigitalProduct({
    id,
    data,
}: {
    id: string;
    data: Record<string, unknown>;
}): Promise<DigitalProduct> {
    const response = await apiClient.patch<ApiResponseWrapper<DigitalProduct>>(
        `/digital-products/${id}`,
        data
    );
    return response.data;
}

async function deleteDigitalProduct(id: string): Promise<void> {
    await apiClient.delete(`/digital-products/${id}`);
}

async function publishDigitalProduct(id: string): Promise<DigitalProduct> {
    const response = await apiClient.post<ApiResponseWrapper<DigitalProduct>>(
        `/digital-products/${id}/publish`
    );
    return response.data;
}

async function archiveDigitalProduct(id: string): Promise<DigitalProduct> {
    const response = await apiClient.post<ApiResponseWrapper<DigitalProduct>>(
        `/digital-products/${id}/archive`
    );
    return response.data;
}

async function fetchDigitalProductCategories(): Promise<DigitalProductCategoriesData> {
    const response = await apiClient.get<
        ApiResponseWrapper<DigitalProductCategoriesData>
    >("/digital-products/categories");
    return response.data;
}

async function fetchDigitalProductTags(): Promise<DigitalProductTagsData> {
    const response = await apiClient.get<
        ApiResponseWrapper<DigitalProductTagsData>
    >("/digital-products/tags");
    return response.data;
}

async function createDigitalProductCategory(
    data: Record<string, unknown>
): Promise<DigitalProductCategory> {
    const response = await apiClient.post<
        ApiResponseWrapper<DigitalProductCategory>
    >("/digital-products/categories", data);
    return response.data;
}

async function updateDigitalProductCategory({
    id,
    data,
}: {
    id: string;
    data: Record<string, unknown>;
}): Promise<DigitalProductCategory> {
    const response = await apiClient.patch<
        ApiResponseWrapper<DigitalProductCategory>
    >(`/digital-products/categories/${id}`, data);
    return response.data;
}

async function deleteDigitalProductCategory(id: string): Promise<void> {
    await apiClient.delete(`/digital-products/categories/${id}`);
}

async function createDigitalProductTag(
    data: Record<string, unknown>
): Promise<DigitalProductTag> {
    const response = await apiClient.post<
        ApiResponseWrapper<DigitalProductTag>
    >("/digital-products/tags", data);
    return response.data;
}

async function updateDigitalProductTag({
    id,
    data,
}: {
    id: string;
    data: Record<string, unknown>;
}): Promise<DigitalProductTag> {
    const response = await apiClient.patch<
        ApiResponseWrapper<DigitalProductTag>
    >(`/digital-products/tags/${id}`, data);
    return response.data;
}

async function deleteDigitalProductTag(id: string): Promise<void> {
    await apiClient.delete(`/digital-products/tags/${id}`);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of digital products.
 */
export function useDigitalProducts(filters?: Record<string, unknown>) {
    return useQuery<DigitalProductsData, ApiError>({
        queryKey: digitalProductKeys.productList(filters ?? {}),
        queryFn: () => fetchDigitalProducts(filters),
    });
}

/**
 * Fetch a single digital product by ID.
 */
export function useDigitalProduct(id: string) {
    return useQuery<DigitalProduct, ApiError>({
        queryKey: digitalProductKeys.productDetail(id),
        queryFn: () => fetchDigitalProduct(id),
        enabled: !!id,
    });
}

/**
 * Create a new digital product.
 */
export function useCreateDigitalProduct() {
    const queryClient = useQueryClient();

    return useMutation<DigitalProduct, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createDigitalProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.products(),
            });
        },
    });
}

/**
 * Update an existing digital product.
 */
export function useUpdateDigitalProduct() {
    const queryClient = useQueryClient();

    return useMutation<
        DigitalProduct,
        ApiError,
        { id: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateDigitalProduct(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.products(),
            });
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.productDetail(variables.id),
            });
        },
    });
}

/**
 * Delete a digital product.
 */
export function useDeleteDigitalProduct() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteDigitalProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.products(),
            });
        },
    });
}

/**
 * Publish a digital product.
 */
export function usePublishDigitalProduct() {
    const queryClient = useQueryClient();

    return useMutation<DigitalProduct, ApiError, string>({
        mutationFn: (id) => publishDigitalProduct(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.products(),
            });
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.productDetail(id),
            });
        },
    });
}

/**
 * Archive a digital product.
 */
export function useArchiveDigitalProduct() {
    const queryClient = useQueryClient();

    return useMutation<DigitalProduct, ApiError, string>({
        mutationFn: (id) => archiveDigitalProduct(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.products(),
            });
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.productDetail(id),
            });
        },
    });
}

/**
 * Fetch all digital product categories.
 */
export function useDigitalProductCategories() {
    return useQuery<DigitalProductCategoriesData, ApiError>({
        queryKey: digitalProductKeys.categories(),
        queryFn: fetchDigitalProductCategories,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Fetch all digital product tags.
 */
export function useDigitalProductTags() {
    return useQuery<DigitalProductTagsData, ApiError>({
        queryKey: digitalProductKeys.tags(),
        queryFn: fetchDigitalProductTags,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Create a new digital product category.
 */
export function useCreateDigitalProductCategory() {
    const queryClient = useQueryClient();

    return useMutation<
        DigitalProductCategory,
        ApiError,
        Record<string, unknown>
    >({
        mutationFn: (data) => createDigitalProductCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.categories(),
            });
        },
    });
}

/**
 * Update a digital product category.
 */
export function useUpdateDigitalProductCategory() {
    const queryClient = useQueryClient();

    return useMutation<
        DigitalProductCategory,
        ApiError,
        { id: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateDigitalProductCategory(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.categories(),
            });
        },
    });
}

/**
 * Delete a digital product category.
 */
export function useDeleteDigitalProductCategory() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteDigitalProductCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.categories(),
            });
        },
    });
}

/**
 * Create a new digital product tag.
 */
export function useCreateDigitalProductTag() {
    const queryClient = useQueryClient();

    return useMutation<DigitalProductTag, ApiError, Record<string, unknown>>({
        mutationFn: (data) => createDigitalProductTag(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.tags(),
            });
        },
    });
}

/**
 * Update a digital product tag.
 */
export function useUpdateDigitalProductTag() {
    const queryClient = useQueryClient();

    return useMutation<
        DigitalProductTag,
        ApiError,
        { id: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateDigitalProductTag(variables),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.tags(),
            });
        },
    });
}

/**
 * Delete a digital product tag.
 */
export function useDeleteDigitalProductTag() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteDigitalProductTag(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: digitalProductKeys.tags(),
            });
        },
    });
}
