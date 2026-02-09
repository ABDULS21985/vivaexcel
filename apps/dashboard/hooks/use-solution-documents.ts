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

// ─── Union Types ─────────────────────────────────────────────────────────────

export type DocumentType =
    | "architecture_design"
    | "system_design"
    | "api_specification"
    | "database_design"
    | "infrastructure"
    | "security_design"
    | "integration_design"
    | "migration_plan"
    | "disaster_recovery"
    | "network_design"
    | "data_flow"
    | "other";

export type Domain =
    | "fintech"
    | "healthtech"
    | "edtech"
    | "ecommerce"
    | "saas"
    | "iot"
    | "ai_ml"
    | "cybersecurity"
    | "cloud_infrastructure"
    | "devops"
    | "mobile"
    | "blockchain"
    | "other";

export type MaturityLevel = "starter" | "intermediate" | "enterprise";

export type DiagramTool =
    | "draw_io"
    | "lucidchart"
    | "miro"
    | "figma"
    | "visio"
    | "plantuml"
    | "other";

export type DocumentStatus = "draft" | "published" | "archived";

export type CloudPlatform = "aws" | "azure" | "gcp" | "multi_cloud" | "on_premise";

export type ComplianceFramework = "soc2" | "hipaa" | "gdpr" | "iso27001" | "pci_dss";

export type TemplateFormat = "docx" | "pdf" | "notion" | "confluence" | "markdown";

// ─── Solution Document Types ─────────────────────────────────────────────────

export interface TOCItem {
    id: string;
    title: string;
    level: number;
    sortOrder: number;
}

export interface SolutionDocument {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    shortDescription?: string | null;
    documentType: DocumentType;
    domain: Domain;
    maturityLevel: MaturityLevel;
    status: DocumentStatus;
    pageCount: number;
    wordCount: number;
    diagramCount: number;
    fileSize: number;
    originalFilename?: string | null;
    coverImageUrl?: string | null;
    previewUrl?: string | null;
    downloadUrl?: string | null;
    price: number;
    compareAtPrice?: number | null;
    currency: string;
    cloudPlatforms: CloudPlatform[];
    technologyStack: string[];
    complianceFrameworks: ComplianceFramework[];
    templateFormats: TemplateFormat[];
    hasEditableDiagrams: boolean;
    diagramTool?: DiagramTool | null;
    includes: {
        editableTemplates: boolean;
        diagramFiles: boolean;
        implementationChecklist: boolean;
        costEstimator: boolean;
    };
    tableOfContents: TOCItem[];
    downloadCount: number;
    viewCount: number;
    averageRating: number;
    totalReviews: number;
    isFeatured: boolean;
    isAiAnalyzed: boolean;
    aiAnalyzedAt?: string | null;
    aiDescription?: string | null;
    aiSuggestedTags?: string[];
    freshnessScore?: number | null;
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

export interface DocumentBundle {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    featuredImageUrl?: string | null;
    price: number;
    compareAtPrice?: number | null;
    currency: string;
    status: DocumentStatus;
    documents: SolutionDocument[];
    documentCount: number;
    savingsPercent: number;
    downloadCount: number;
    viewCount: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface DocumentUpdate {
    id: string;
    documentId: string;
    version: string;
    releaseNotes?: string | null;
    fileUrl?: string | null;
    createdAt?: string;
}

export interface SolutionDocumentFilters {
    search?: string;
    documentType?: DocumentType | "all";
    domain?: Domain | "all";
    maturityLevel?: MaturityLevel | "all";
    status?: DocumentStatus | "all";
    cloudPlatform?: CloudPlatform | "all";
    complianceFramework?: ComplianceFramework | "all";
    templateFormat?: TemplateFormat | "all";
    isAiAnalyzed?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    cursor?: string;
    limit?: number;
}

export interface SolutionDocumentStats {
    totalDocuments: number;
    totalBundles: number;
    averagePageCount: number;
    aiAnalyzedCount: number;
    totalDownloads: number;
    totalRevenue: number;
    byDocumentType: { documentType: string; count: number }[];
    byDomain: { domain: string; count: number }[];
    byMaturityLevel: { maturityLevel: string; count: number }[];
}

export interface DocumentBundleFilters {
    search?: string;
    status?: DocumentStatus | "all";
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    cursor?: string;
    limit?: number;
}

export interface CreateSolutionDocumentDto {
    title: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    documentType: DocumentType;
    domain: Domain;
    maturityLevel?: MaturityLevel;
    status?: DocumentStatus;
    price?: number;
    compareAtPrice?: number;
    currency?: string;
    cloudPlatforms?: CloudPlatform[];
    technologyStack?: string[];
    complianceFrameworks?: ComplianceFramework[];
    templateFormats?: TemplateFormat[];
    hasEditableDiagrams?: boolean;
    diagramTool?: DiagramTool;
    includes?: {
        editableTemplates?: boolean;
        diagramFiles?: boolean;
        implementationChecklist?: boolean;
        costEstimator?: boolean;
    };
    tableOfContents?: TOCItem[];
    digitalProductId?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    tags?: string[];
}

export interface UpdateSolutionDocumentDto extends Partial<CreateSolutionDocumentDto> {}

export interface CreateDocumentBundleDto {
    name: string;
    slug?: string;
    description?: string;
    featuredImageUrl?: string;
    price: number;
    compareAtPrice?: number;
    currency?: string;
    status?: DocumentStatus;
    documentIds: string[];
}

export interface UpdateDocumentBundleDto extends Partial<CreateDocumentBundleDto> {}

// ─── Cursor-Paginated Response ──────────────────────────────────────────────

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface DocumentsData {
    items: SolutionDocument[];
    meta: CursorMeta;
}

interface BundlesData {
    items: DocumentBundle[];
    meta: CursorMeta;
}

interface UpdatesData {
    items: DocumentUpdate[];
    total: number;
}

// ─── Query Keys ─────────────────────────────────────────────────────────────

export const solutionDocumentKeys = {
    all: ["solution-documents"] as const,
    documents: () => [...solutionDocumentKeys.all, "list"] as const,
    documentList: (filters: Record<string, unknown>) =>
        [...solutionDocumentKeys.documents(), filters] as const,
    documentDetail: (id: string) =>
        [...solutionDocumentKeys.all, "detail", id] as const,
    bundles: () => [...solutionDocumentKeys.all, "bundles"] as const,
    bundleList: (filters: Record<string, unknown>) =>
        [...solutionDocumentKeys.bundles(), filters] as const,
    bundleDetail: (id: string) =>
        [...solutionDocumentKeys.all, "bundle-detail", id] as const,
    updates: (documentId: string) =>
        [...solutionDocumentKeys.all, "updates", documentId] as const,
    stats: () => [...solutionDocumentKeys.all, "stats"] as const,
    analytics: (filters?: Record<string, unknown>) =>
        [...solutionDocumentKeys.all, "analytics", filters] as const,
};

// ─── API Functions ──────────────────────────────────────────────────────────

async function fetchDocuments(
    filters?: Record<string, unknown>
): Promise<DocumentsData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" && value !== "all") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<DocumentsData>>(
        "/solution-documents",
        { params }
    );
    return response.data;
}

async function fetchDocument(id: string): Promise<SolutionDocument> {
    const response = await apiClient.get<ApiResponseWrapper<SolutionDocument>>(
        `/solution-documents/${id}`
    );
    return response.data;
}

async function createDocument(
    data: CreateSolutionDocumentDto
): Promise<SolutionDocument> {
    const response = await apiClient.post<ApiResponseWrapper<SolutionDocument>>(
        "/solution-documents",
        data
    );
    return response.data;
}

async function updateDocument({
    id,
    data,
}: {
    id: string;
    data: UpdateSolutionDocumentDto;
}): Promise<SolutionDocument> {
    const response = await apiClient.patch<ApiResponseWrapper<SolutionDocument>>(
        `/solution-documents/${id}`,
        data
    );
    return response.data;
}

async function deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/solution-documents/${id}`);
}

async function fetchBundles(
    filters?: Record<string, unknown>
): Promise<BundlesData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "" && value !== "all") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<BundlesData>>(
        "/solution-documents/bundles",
        { params }
    );
    return response.data;
}

async function fetchBundle(id: string): Promise<DocumentBundle> {
    const response = await apiClient.get<ApiResponseWrapper<DocumentBundle>>(
        `/solution-documents/bundles/${id}`
    );
    return response.data;
}

async function createBundle(
    data: CreateDocumentBundleDto
): Promise<DocumentBundle> {
    const response = await apiClient.post<ApiResponseWrapper<DocumentBundle>>(
        "/solution-documents/bundles",
        data
    );
    return response.data;
}

async function updateBundle({
    id,
    data,
}: {
    id: string;
    data: UpdateDocumentBundleDto;
}): Promise<DocumentBundle> {
    const response = await apiClient.patch<ApiResponseWrapper<DocumentBundle>>(
        `/solution-documents/bundles/${id}`,
        data
    );
    return response.data;
}

async function deleteBundle(id: string): Promise<void> {
    await apiClient.delete(`/solution-documents/bundles/${id}`);
}

async function addToBundle({
    bundleId,
    documentId,
}: {
    bundleId: string;
    documentId: string;
}): Promise<DocumentBundle> {
    const response = await apiClient.post<ApiResponseWrapper<DocumentBundle>>(
        `/solution-documents/bundles/${bundleId}/documents`,
        { documentId }
    );
    return response.data;
}

async function removeFromBundle({
    bundleId,
    documentId,
}: {
    bundleId: string;
    documentId: string;
}): Promise<void> {
    await apiClient.delete(
        `/solution-documents/bundles/${bundleId}/documents/${documentId}`
    );
}

async function fetchUpdates(documentId: string): Promise<UpdatesData> {
    const response = await apiClient.get<ApiResponseWrapper<UpdatesData>>(
        `/solution-documents/${documentId}/updates`
    );
    return response.data;
}

async function publishUpdate({
    documentId,
    data,
}: {
    documentId: string;
    data: { version: string; releaseNotes?: string; file?: FormData };
}): Promise<DocumentUpdate> {
    const response = await apiClient.post<ApiResponseWrapper<DocumentUpdate>>(
        `/solution-documents/${documentId}/updates`,
        data
    );
    return response.data;
}

async function uploadDocument(formData: FormData): Promise<SolutionDocument> {
    const response = await apiClient.upload<ApiResponseWrapper<SolutionDocument>>(
        "/solution-documents/upload",
        formData,
        { timeout: 300000 }
    );
    return response.data;
}

async function analyzeDocument(id: string): Promise<SolutionDocument> {
    const response = await apiClient.post<ApiResponseWrapper<SolutionDocument>>(
        `/solution-documents/${id}/analyze`
    );
    return response.data;
}

async function generateDescription(id: string): Promise<{ description: string }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ description: string }>
    >(`/solution-documents/${id}/generate-description`);
    return response.data;
}

async function generateSeo(id: string): Promise<{
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
}> {
    const response = await apiClient.post<
        ApiResponseWrapper<{
            seoTitle: string;
            seoDescription: string;
            seoKeywords: string[];
        }>
    >(`/solution-documents/${id}/generate-seo`);
    return response.data;
}

async function generateToc(id: string): Promise<{ tableOfContents: TOCItem[] }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ tableOfContents: TOCItem[] }>
    >(`/solution-documents/${id}/generate-toc`);
    return response.data;
}

async function extractTechStack(id: string): Promise<{ technologyStack: string[] }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ technologyStack: string[] }>
    >(`/solution-documents/${id}/extract-tech-stack`);
    return response.data;
}

async function fetchStats(): Promise<SolutionDocumentStats> {
    const response = await apiClient.get<ApiResponseWrapper<SolutionDocumentStats>>(
        "/solution-documents/stats"
    );
    return response.data;
}

async function bulkDelete(ids: string[]): Promise<void> {
    await apiClient.post("/solution-documents/bulk-delete", { ids });
}

async function bulkAnalyze(ids: string[]): Promise<{ analyzed: number }> {
    const response = await apiClient.post<
        ApiResponseWrapper<{ analyzed: number }>
    >("/solution-documents/bulk-analyze", { ids });
    return response.data;
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated/filtered list of solution documents.
 */
export function useSolutionDocuments(filters?: Record<string, unknown>) {
    return useQuery<DocumentsData, ApiError>({
        queryKey: solutionDocumentKeys.documentList(filters ?? {}),
        queryFn: () => fetchDocuments(filters),
    });
}

/**
 * Fetch a single solution document by ID.
 */
export function useSolutionDocument(id: string) {
    return useQuery<SolutionDocument, ApiError>({
        queryKey: solutionDocumentKeys.documentDetail(id),
        queryFn: () => fetchDocument(id),
        enabled: !!id,
    });
}

/**
 * Create a new solution document.
 */
export function useCreateSolutionDocument() {
    const queryClient = useQueryClient();

    return useMutation<SolutionDocument, ApiError, CreateSolutionDocumentDto>({
        mutationFn: (data) => createDocument(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Update an existing solution document.
 */
export function useUpdateSolutionDocument() {
    const queryClient = useQueryClient();

    return useMutation<
        SolutionDocument,
        ApiError,
        { id: string; data: UpdateSolutionDocumentDto }
    >({
        mutationFn: (variables) => updateDocument(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documentDetail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Delete a solution document.
 */
export function useDeleteSolutionDocument() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteDocument(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Fetch a paginated/filtered list of document bundles.
 */
export function useDocumentBundles(filters?: Record<string, unknown>) {
    return useQuery<BundlesData, ApiError>({
        queryKey: solutionDocumentKeys.bundleList(filters ?? {}),
        queryFn: () => fetchBundles(filters),
    });
}

/**
 * Fetch a single document bundle by ID.
 */
export function useDocumentBundle(id: string) {
    return useQuery<DocumentBundle, ApiError>({
        queryKey: solutionDocumentKeys.bundleDetail(id),
        queryFn: () => fetchBundle(id),
        enabled: !!id,
    });
}

/**
 * Create a new document bundle.
 */
export function useCreateBundle() {
    const queryClient = useQueryClient();

    return useMutation<DocumentBundle, ApiError, CreateDocumentBundleDto>({
        mutationFn: (data) => createBundle(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundles(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Update an existing document bundle.
 */
export function useUpdateBundle() {
    const queryClient = useQueryClient();

    return useMutation<
        DocumentBundle,
        ApiError,
        { id: string; data: UpdateDocumentBundleDto }
    >({
        mutationFn: (variables) => updateBundle(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundles(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundleDetail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Delete a document bundle.
 */
export function useDeleteBundle() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => deleteBundle(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundles(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Add a document to a bundle.
 */
export function useAddToBundle() {
    const queryClient = useQueryClient();

    return useMutation<
        DocumentBundle,
        ApiError,
        { bundleId: string; documentId: string }
    >({
        mutationFn: (variables) => addToBundle(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundleDetail(variables.bundleId),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundles(),
            });
        },
    });
}

/**
 * Remove a document from a bundle.
 */
export function useRemoveFromBundle() {
    const queryClient = useQueryClient();

    return useMutation<
        void,
        ApiError,
        { bundleId: string; documentId: string }
    >({
        mutationFn: (variables) => removeFromBundle(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundleDetail(variables.bundleId),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.bundles(),
            });
        },
    });
}

/**
 * Fetch version updates for a document.
 */
export function useDocumentUpdates(documentId: string) {
    return useQuery<UpdatesData, ApiError>({
        queryKey: solutionDocumentKeys.updates(documentId),
        queryFn: () => fetchUpdates(documentId),
        enabled: !!documentId,
    });
}

/**
 * Publish a new version update for a document.
 */
export function usePublishUpdate() {
    const queryClient = useQueryClient();

    return useMutation<
        DocumentUpdate,
        ApiError,
        { documentId: string; data: { version: string; releaseNotes?: string } }
    >({
        mutationFn: (variables) => publishUpdate(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.updates(variables.documentId),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documentDetail(variables.documentId),
            });
        },
    });
}

/**
 * Upload a new solution document file.
 */
export function useUploadDocument() {
    const queryClient = useQueryClient();

    return useMutation<SolutionDocument, ApiError, FormData>({
        mutationFn: (formData) => uploadDocument(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Trigger AI analysis of a solution document.
 */
export function useAnalyzeDocument() {
    const queryClient = useQueryClient();

    return useMutation<SolutionDocument, ApiError, string>({
        mutationFn: (id) => analyzeDocument(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documentDetail(id),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Generate an AI description for a solution document.
 */
export function useGenerateDocumentDescription() {
    return useMutation<{ description: string }, ApiError, string>({
        mutationFn: (id) => generateDescription(id),
    });
}

/**
 * Generate SEO metadata for a solution document.
 */
export function useGenerateSeo() {
    return useMutation<
        { seoTitle: string; seoDescription: string; seoKeywords: string[] },
        ApiError,
        string
    >({
        mutationFn: (id) => generateSeo(id),
    });
}

/**
 * Generate a table of contents for a solution document.
 */
export function useGenerateToc() {
    const queryClient = useQueryClient();

    return useMutation<{ tableOfContents: TOCItem[] }, ApiError, string>({
        mutationFn: (id) => generateToc(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documentDetail(id),
            });
        },
    });
}

/**
 * Extract technology stack from a solution document.
 */
export function useExtractTechStack() {
    return useMutation<{ technologyStack: string[] }, ApiError, string>({
        mutationFn: (id) => extractTechStack(id),
    });
}

/**
 * Fetch solution document stats.
 */
export function useSolutionDocumentStats() {
    return useQuery<SolutionDocumentStats, ApiError>({
        queryKey: solutionDocumentKeys.stats(),
        queryFn: fetchStats,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Bulk delete solution documents.
 */
export function useBulkDeleteDocuments() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string[]>({
        mutationFn: (ids) => bulkDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}

/**
 * Bulk AI-analyze solution documents.
 */
export function useBulkAnalyzeDocuments() {
    const queryClient = useQueryClient();

    return useMutation<{ analyzed: number }, ApiError, string[]>({
        mutationFn: (ids) => bulkAnalyze(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.documents(),
            });
            queryClient.invalidateQueries({
                queryKey: solutionDocumentKeys.stats(),
            });
        },
    });
}
