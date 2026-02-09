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

// ─── Presentation Types ─────────────────────────────────────────────────────

export interface Presentation {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
    industry: PresentationIndustry;
    type: PresentationType;
    status: "draft" | "published" | "archived";
    fileFormat: PresentationFileFormat;
    aspectRatio: PresentationAspectRatio;
    slideCount: number;
    fileSize: number;
    originalFilename?: string | null;
    thumbnailUrl?: string | null;
    previewUrl?: string | null;
    downloadUrl?: string | null;
    price: number;
    compareAtPrice?: number | null;
    currency: string;
    softwareCompatibility: string[];
    colorSchemes: ColorScheme[];
    fontFamilies: string[];
    hasAnimations: boolean;
    hasTransitions: boolean;
    hasSpeakerNotes: boolean;
    hasCharts: boolean;
    hasImages: boolean;
    isFullyEditable: boolean;
    includesDocumentation: boolean;
    downloadCount: number;
    viewCount: number;
    averageRating: number;
    totalReviews: number;
    isFeatured: boolean;
    isAiAnalyzed: boolean;
    aiAnalyzedAt?: string | null;
    aiDescription?: string | null;
    aiSuggestedTags?: string[];
    aiSuggestedPrice?: number | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoKeywords?: string[];
    digitalProductId?: string | null;
    digitalProduct?: {
        id: string;
        title: string;
        slug: string;
    } | null;
    tags?: { id: string; name: string; slug: string }[];
    creator?: { id: string; name: string; avatar?: string } | null;
    publishedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface SlidePreview {
    id: string;
    presentationId: string;
    slideNumber: number;
    title?: string | null;
    contentType: SlideContentType;
    thumbnailUrl?: string | null;
    isVisible: boolean;
    notes?: string | null;
    sortOrder: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface ColorScheme {
    name: string;
    colors: string[];
}

export type PresentationIndustry =
    | "technology"
    | "healthcare"
    | "finance"
    | "education"
    | "marketing"
    | "real_estate"
    | "consulting"
    | "manufacturing"
    | "retail"
    | "nonprofit"
    | "government"
    | "creative"
    | "legal"
    | "startup"
    | "general"
    | "other";

export type PresentationType =
    | "pitch_deck"
    | "business_plan"
    | "sales_deck"
    | "company_profile"
    | "project_proposal"
    | "training"
    | "webinar"
    | "case_study"
    | "report"
    | "infographic"
    | "portfolio"
    | "keynote_speech"
    | "product_launch"
    | "investor_update"
    | "other";

export type PresentationFileFormat =
    | "pptx"
    | "ppt"
    | "key"
    | "odp"
    | "pdf";

export type PresentationAspectRatio =
    | "16:9"
    | "4:3"
    | "16:10"
    | "a4"
    | "letter"
    | "custom";

export type SlideContentType =
    | "title"
    | "content"
    | "image"
    | "chart"
    | "table"
    | "comparison"
    | "timeline"
    | "team"
    | "pricing"
    | "contact"
    | "thank_you"
    | "section_break"
    | "blank"
    | "other";

export interface PresentationFilters {
    search?: string;
    industry?: PresentationIndustry | "all";
    type?: PresentationType | "all";
    fileFormat?: PresentationFileFormat | "all";
    aspectRatio?: PresentationAspectRatio | "all";
    status?: "draft" | "published" | "archived" | "all";
    isAiAnalyzed?: boolean;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    cursor?: string;
    limit?: number;
}

export interface PresentationStats {
    totalPresentations: number;
    totalSlides: number;
    averageSlidesPerPresentation: number;
    aiAnalyzedCount: number;
    totalDownloads: number;
    totalRevenue: number;
    byIndustry: { industry: string; count: number }[];
    byType: { type: string; count: number }[];
    byFormat: { format: string; count: number }[];
}

export interface CreatePresentationDto {
    title: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    industry: PresentationIndustry;
    type: PresentationType;
    status?: "draft" | "published" | "archived";
    fileFormat?: PresentationFileFormat;
    aspectRatio?: PresentationAspectRatio;
    price?: number;
    compareAtPrice?: number;
    currency?: string;
    softwareCompatibility?: string[];
    colorSchemes?: ColorScheme[];
    fontFamilies?: string[];
    hasAnimations?: boolean;
    hasTransitions?: boolean;
    hasSpeakerNotes?: boolean;
    hasCharts?: boolean;
    hasImages?: boolean;
    isFullyEditable?: boolean;
    includesDocumentation?: boolean;
    digitalProductId?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    tags?: string[];
}

export interface UpdatePresentationDto extends Partial<CreatePresentationDto> {}

// ─── Cursor-Paginated Response ──────────────────────────────────────────────

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface PresentationsData {
    items: Presentation[];
    meta: CursorMeta;
}

interface SlidesData {
    slides: SlidePreview[];
    total: number;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const presentationKeys = {
    all: ["presentations"] as const,
    presentations: () => [...presentationKeys.all, "list"] as const,
    presentationList: (filters: Record<string, unknown>) =>
        [...presentationKeys.presentations(), filters] as const,
    presentationDetail: (id: string) =>
        [...presentationKeys.all, "detail", id] as const,
    slides: (presentationId: string) =>
        [...presentationKeys.all, "slides", presentationId] as const,
    stats: () => [...presentationKeys.all, "stats"] as const,
    analytics: (filters?: Record<string, unknown>) =>
        [...presentationKeys.all, "analytics", filters] as const,
};

// ─── API Functions ──────────────────────────────────────────────────────────

async function fetchPresentations(
    filters?: Record<string, unknown>
): Promise<PresentationsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" && value !== "all") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<PresentationsData>>(
        "/presentations",
        { params }
    );
    return response.data;
}

async function fetchPresentation(id: string): Promise<Presentation> {
    const response = await apiClient.get<ApiResponseWrapper<Presentation>>(
        `/presentations/${id}`
    );
    return response.data;
}

async function createPresentation(
    data: CreatePresentationDto
): Promise<Presentation> {
    const response = await apiClient.post<ApiResponseWrapper<Presentation>>(
        "/presentations",
        data
    );
    return response.data;
}

async function updatePresentation({
    id,
    data,
}: {
    id: string;
    data: UpdatePresentationDto;
}): Promise<Presentation> {
    const response = await apiClient.patch<ApiResponseWrapper<Presentation>>(
        `/presentations/${id}`,
        data
    );
    return response.data;
}

async function deletePresentation(id: string): Promise<void> {
    await apiClient.delete(`/presentations/${id}`);
}

async function fetchPresentationSlides(
    presentationId: string
): Promise<SlidesData> {
    const response = await apiClient.get<ApiResponseWrapper<SlidesData>>(
        `/presentations/${presentationId}/slides`
    );
    return response.data;
}

async function uploadPresentation(formData: FormData): Promise<Presentation> {
    const response = await apiClient.upload<ApiResponseWrapper<Presentation>>(
        "/presentations/upload",
        formData,
        { timeout: 300000 }
    );
    return response.data;
}

async function reprocessPresentation(id: string): Promise<Presentation> {
    const response = await apiClient.post<ApiResponseWrapper<Presentation>>(
        `/presentations/${id}/reprocess`
    );
    return response.data;
}

async function analyzePresentation(id: string): Promise<Presentation> {
    const response = await apiClient.post<ApiResponseWrapper<Presentation>>(
        `/presentations/${id}/analyze`
    );
    return response.data;
}

async function generateDescription(id: string): Promise<{ description: string }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ description: string }>
    >(`/presentations/${id}/generate-description`);
    return response.data;
}

async function suggestPricing(id: string): Promise<{ suggestedPrice: number; reasoning: string }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ suggestedPrice: number; reasoning: string }>
    >(`/presentations/${id}/suggest-pricing`);
    return response.data;
}

async function fetchPresentationStats(): Promise<PresentationStats> {
    const response = await apiClient.get<ApiResponseWrapper<PresentationStats>>(
        "/presentations/stats"
    );
    return response.data;
}

async function bulkDeletePresentations(ids: string[]): Promise<void> {
    await apiClient.post("/presentations/bulk-delete", { ids });
}

async function bulkAnalyzePresentations(ids: string[]): Promise<{ analyzed: number }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ analyzed: number }>
    >("/presentations/bulk-analyze", { ids });
    return response.data;
}

async function updateSlide({
    presentationId,
    slideId,
    data,
}: {
    presentationId: string;
    slideId: string;
    data: Record<string, unknown>;
}): Promise<SlidePreview> {
    const response = await apiClient.patch<ApiResponseWrapper<SlidePreview>>(
        `/presentations/${presentationId}/slides/${slideId}`,
        data
    );
    return response.data;
}

async function reorderSlides({
    presentationId,
    slideIds,
}: {
    presentationId: string;
    slideIds: string[];
}): Promise<void> {
    await apiClient.post(`/presentations/${presentationId}/slides/reorder`, {
        slideIds,
    });
}

async function regenerateThumbnails(presentationId: string): Promise<void> {
    await apiClient.post(
        `/presentations/${presentationId}/slides/regenerate-thumbnails`
    );
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of presentations.
 */
export function usePresentations(filters?: Record<string, unknown>) {
    return useQuery<PresentationsData, ApiError>({
        queryKey: presentationKeys.presentationList(filters ?? {}),
        queryFn: () => fetchPresentations(filters),
    });
}

/**
 * Fetch a single presentation by ID.
 */
export function usePresentation(id: string) {
    return useQuery<Presentation, ApiError>({
        queryKey: presentationKeys.presentationDetail(id),
        queryFn: () => fetchPresentation(id),
        enabled: !!id,
    });
}

/**
 * Create a new presentation.
 */
export function useCreatePresentation() {
    const queryClient = useQueryClient();

    return useMutation<Presentation, ApiError, CreatePresentationDto>({
        mutationFn: (data) => createPresentation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Update an existing presentation.
 */
export function useUpdatePresentation() {
    const queryClient = useQueryClient();

    return useMutation<
        Presentation,
        ApiError,
        { id: string; data: UpdatePresentationDto }
    >({
        mutationFn: (variables) => updatePresentation(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentationDetail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Delete a presentation.
 */
export function useDeletePresentation() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deletePresentation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Fetch slide previews for a presentation.
 */
export function usePresentationSlides(presentationId: string) {
    return useQuery<SlidesData, ApiError>({
        queryKey: presentationKeys.slides(presentationId),
        queryFn: () => fetchPresentationSlides(presentationId),
        enabled: !!presentationId,
    });
}

/**
 * Upload a new presentation file.
 */
export function useUploadPresentation() {
    const queryClient = useQueryClient();

    return useMutation<Presentation, ApiError, FormData>({
        mutationFn: (formData) => uploadPresentation(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Trigger reprocessing of a presentation (re-extract metadata, thumbnails, etc.).
 */
export function useReprocessPresentation() {
    const queryClient = useQueryClient();

    return useMutation<Presentation, ApiError, string>({
        mutationFn: (id) => reprocessPresentation(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentationDetail(id),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.slides(id),
            });
        },
    });
}

/**
 * Trigger AI analysis of a presentation.
 */
export function useAnalyzePresentation() {
    const queryClient = useQueryClient();

    return useMutation<Presentation, ApiError, string>({
        mutationFn: (id) => analyzePresentation(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentationDetail(id),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Generate an AI description for a presentation.
 */
export function useGenerateDescription() {
    return useMutation<{ description: string }, ApiError, string>({
        mutationFn: (id) => generateDescription(id),
    });
}

/**
 * Get AI-suggested pricing for a presentation.
 */
export function useSuggestPricing() {
    return useMutation<
        { suggestedPrice: number; reasoning: string },
        ApiError,
        string
    >({
        mutationFn: (id) => suggestPricing(id),
    });
}

/**
 * Fetch presentation stats.
 */
export function usePresentationStats() {
    return useQuery<PresentationStats, ApiError>({
        queryKey: presentationKeys.stats(),
        queryFn: fetchPresentationStats,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Bulk delete presentations.
 */
export function useBulkDeletePresentations() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string[]>({
        mutationFn: (ids) => bulkDeletePresentations(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Bulk AI-analyze presentations.
 */
export function useBulkAnalyzePresentations() {
    const queryClient = useQueryClient();

    return useMutation<{ analyzed: number }, ApiError, string[]>({
        mutationFn: (ids) => bulkAnalyzePresentations(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentations(),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.stats(),
            });
        },
    });
}

/**
 * Update a single slide's metadata.
 */
export function useUpdateSlide() {
    const queryClient = useQueryClient();

    return useMutation<
        SlidePreview,
        ApiError,
        { presentationId: string; slideId: string; data: Record<string, unknown> }
    >({
        mutationFn: (variables) => updateSlide(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.slides(variables.presentationId),
            });
        },
    });
}

/**
 * Reorder slides within a presentation.
 */
export function useReorderSlides() {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        ApiError,
        { presentationId: string; slideIds: string[] }
    >({
        mutationFn: (variables) => reorderSlides(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.slides(variables.presentationId),
            });
        },
    });
}

/**
 * Regenerate all slide thumbnails for a presentation.
 */
export function useRegenerateThumbnails() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (presentationId) => regenerateThumbnails(presentationId),
        onSuccess: (_data, presentationId) => {
            queryClient.invalidateQueries({
                queryKey: presentationKeys.slides(presentationId),
            });
            queryClient.invalidateQueries({
                queryKey: presentationKeys.presentationDetail(presentationId),
            });
        },
    });
}
