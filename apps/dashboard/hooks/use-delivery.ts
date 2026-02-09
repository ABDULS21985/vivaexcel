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

// ─── Delivery Types ─────────────────────────────────────────────────────────

export interface DownloadLink {
    id: string;
    orderId: string;
    orderItemId: string;
    userId: string;
    digitalProductId: string;
    token: string;
    shortCode: string;
    status: "active" | "expired" | "revoked" | "exhausted";
    maxDownloads: number;
    downloadCount: number;
    expiresAt: string;
    lastDownloadedAt?: string;
    createdAt: string;
    product?: { id: string; title: string; slug: string; featuredImage?: string };
    user?: { id: string; email: string; name?: string };
}

export interface DownloadLog {
    id: string;
    downloadLinkId: string;
    userId: string;
    ipAddress: string;
    userAgent?: string;
    country?: string;
    fileVersion?: string;
    bytesTransferred: number;
    completedSuccessfully: boolean;
    downloadedAt: string;
}

export interface License {
    id: string;
    userId: string;
    digitalProductId: string;
    orderId: string;
    licenseKey: string;
    licenseType: "personal" | "commercial" | "extended" | "enterprise" | "unlimited";
    status: "active" | "suspended" | "revoked" | "expired";
    activationCount: number;
    maxActivations: number;
    activatedDomains: string[];
    expiresAt?: string;
    createdAt: string;
    product?: { id: string; title: string; slug: string };
    user?: { id: string; email: string; name?: string };
    activations?: LicenseActivation[];
}

export interface LicenseActivation {
    id: string;
    licenseId: string;
    domain?: string;
    machineId?: string;
    ipAddress: string;
    activatedAt: string;
    deactivatedAt?: string;
    isActive: boolean;
}

export interface ProductUpdate {
    id: string;
    digitalProductId: string;
    version: string;
    releaseNotes: string;
    fileId?: string;
    isBreaking: boolean;
    publishedAt: string;
    notifiedBuyers: boolean;
    product?: { id: string; title: string; slug: string };
}

export interface DownloadAnalytics {
    totalDownloads: number;
    totalBandwidth: number;
    activeLinks: number;
    totalLicenses: number;
    downloadsByProduct: { productId: string; productTitle: string; count: number }[];
    downloadsByCountry: { country: string; count: number }[];
    suspiciousPatterns: SuspiciousPattern[];
}

export interface SuspiciousPattern {
    id: string;
    userId: string;
    userEmail?: string;
    type: "rate_limit" | "geographic_anomaly" | "bulk_download";
    details: string;
    detectedAt: string;
    dismissed?: boolean;
}

export interface DownloadLinkFilters {
    search?: string;
    status?: string;
    cursor?: string;
    limit?: number;
    [key: string]: unknown;
}

export interface LicenseFilters {
    search?: string;
    licenseType?: string;
    status?: string;
    cursor?: string;
    limit?: number;
    [key: string]: unknown;
}

interface CursorMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

interface DownloadLinksData {
    items: DownloadLink[];
    meta: CursorMeta;
}

interface LicensesData {
    items: License[];
    meta: CursorMeta;
}

interface ProductUpdatesData {
    items: ProductUpdate[];
    meta: CursorMeta;
}

interface SuspiciousPatternsData {
    items: SuspiciousPattern[];
    total: number;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const deliveryKeys = {
    all: ["delivery"] as const,
    analytics: () => [...deliveryKeys.all, "analytics"] as const,
    downloadLinks: () => [...deliveryKeys.all, "download-links"] as const,
    downloadLinkList: (filters: Record<string, unknown>) =>
        [...deliveryKeys.downloadLinks(), "list", filters] as const,
    downloadLogs: (linkId: string) =>
        [...deliveryKeys.downloadLinks(), "logs", linkId] as const,
    licenses: () => [...deliveryKeys.all, "licenses"] as const,
    licenseList: (filters: Record<string, unknown>) =>
        [...deliveryKeys.licenses(), "list", filters] as const,
    licenseDetail: (id: string) =>
        [...deliveryKeys.licenses(), "detail", id] as const,
    productUpdates: () => [...deliveryKeys.all, "product-updates"] as const,
    productUpdateList: (filters: Record<string, unknown>) =>
        [...deliveryKeys.productUpdates(), "list", filters] as const,
    changelog: (productId: string) =>
        [...deliveryKeys.productUpdates(), "changelog", productId] as const,
    pendingNotifications: () =>
        [...deliveryKeys.productUpdates(), "pending-notifications"] as const,
    suspicious: () => [...deliveryKeys.all, "suspicious"] as const,
};

// ─── API Functions ───────────────────────────────────────────────────────────

async function fetchDownloadAnalytics(): Promise<DownloadAnalytics> {
    const response = await apiClient.get<ApiResponseWrapper<DownloadAnalytics>>(
        "/admin/downloads/analytics"
    );
    return response.data;
}

async function fetchDownloadLinks(
    filters?: DownloadLinkFilters
): Promise<DownloadLinksData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<DownloadLinksData>>(
        "/admin/downloads/links",
        { params }
    );
    return response.data;
}

async function fetchDownloadLogs(linkId: string): Promise<DownloadLog[]> {
    const response = await apiClient.get<ApiResponseWrapper<DownloadLog[]>>(
        `/admin/downloads/links/${linkId}/logs`
    );
    return response.data;
}

async function revokeDownloadLink(id: string): Promise<DownloadLink> {
    const response = await apiClient.post<ApiResponseWrapper<DownloadLink>>(
        `/admin/downloads/links/${id}/revoke`
    );
    return response.data;
}

async function fetchLicenses(
    filters?: LicenseFilters
): Promise<LicensesData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<LicensesData>>(
        "/admin/licenses",
        { params }
    );
    return response.data;
}

async function fetchLicense(id: string): Promise<License> {
    const response = await apiClient.get<ApiResponseWrapper<License>>(
        `/admin/licenses/${id}`
    );
    return response.data;
}

async function revokeLicense({
    id,
    reason,
}: {
    id: string;
    reason: string;
}): Promise<License> {
    const response = await apiClient.post<ApiResponseWrapper<License>>(
        `/admin/licenses/${id}/revoke`,
        { reason }
    );
    return response.data;
}

async function suspendLicense(id: string): Promise<License> {
    const response = await apiClient.post<ApiResponseWrapper<License>>(
        `/admin/licenses/${id}/suspend`
    );
    return response.data;
}

async function reactivateLicense(id: string): Promise<License> {
    const response = await apiClient.post<ApiResponseWrapper<License>>(
        `/admin/licenses/${id}/reactivate`
    );
    return response.data;
}

async function fetchProductUpdates(
    filters?: Record<string, unknown>
): Promise<ProductUpdatesData> {
    const params: Record<string, string | number | boolean | undefined> = {};
    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                params[key] = value as string | number | boolean;
            }
        });
    }
    const response = await apiClient.get<ApiResponseWrapper<ProductUpdatesData>>(
        "/admin/product-updates",
        { params }
    );
    return response.data;
}

async function fetchProductChangelog(
    productId: string
): Promise<ProductUpdate[]> {
    const response = await apiClient.get<ApiResponseWrapper<ProductUpdate[]>>(
        `/admin/digital-products/${productId}/changelog`
    );
    return response.data;
}

async function publishProductUpdate(data: {
    digitalProductId: string;
    version: string;
    releaseNotes: string;
    isBreaking: boolean;
    fileId?: string;
}): Promise<ProductUpdate> {
    const response = await apiClient.post<ApiResponseWrapper<ProductUpdate>>(
        "/admin/product-updates",
        data
    );
    return response.data;
}

async function sendUpdateNotifications(updateId: string): Promise<void> {
    await apiClient.post(`/admin/product-updates/${updateId}/notify`);
}

async function fetchPendingNotifications(): Promise<ProductUpdate[]> {
    const response = await apiClient.get<ApiResponseWrapper<ProductUpdate[]>>(
        "/admin/product-updates/pending-notifications"
    );
    return response.data;
}

async function fetchSuspiciousDownloads(): Promise<SuspiciousPatternsData> {
    const response = await apiClient.get<
        ApiResponseWrapper<SuspiciousPatternsData>
    >("/admin/downloads/suspicious");
    return response.data;
}

async function dismissSuspiciousPattern(id: string): Promise<void> {
    await apiClient.post(`/admin/downloads/suspicious/${id}/dismiss`);
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

/**
 * Fetch download analytics for the delivery dashboard.
 */
export function useDownloadAnalytics() {
    return useQuery<DownloadAnalytics, ApiError>({
        queryKey: deliveryKeys.analytics(),
        queryFn: fetchDownloadAnalytics,
        staleTime: 60 * 1000,
    });
}

/**
 * Fetch a paginated/filtered list of download links.
 */
export function useDownloadLinks(filters?: DownloadLinkFilters) {
    return useQuery<DownloadLinksData, ApiError>({
        queryKey: deliveryKeys.downloadLinkList(filters ?? {}),
        queryFn: () => fetchDownloadLinks(filters),
    });
}

/**
 * Fetch download logs for a specific download link.
 */
export function useDownloadLogs(linkId: string) {
    return useQuery<DownloadLog[], ApiError>({
        queryKey: deliveryKeys.downloadLogs(linkId),
        queryFn: () => fetchDownloadLogs(linkId),
        enabled: !!linkId,
    });
}

/**
 * Revoke a download link.
 */
export function useRevokeDownloadLink() {
    const queryClient = useQueryClient();

    return useMutation<DownloadLink, ApiError, string>({
        mutationFn: (id) => revokeDownloadLink(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.downloadLinks(),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.analytics(),
            });
        },
    });
}

/**
 * Fetch a paginated/filtered list of licenses.
 */
export function useAdminLicenses(filters?: LicenseFilters) {
    return useQuery<LicensesData, ApiError>({
        queryKey: deliveryKeys.licenseList(filters ?? {}),
        queryFn: () => fetchLicenses(filters),
    });
}

/**
 * Fetch a single license by ID.
 */
export function useAdminLicense(id: string) {
    return useQuery<License, ApiError>({
        queryKey: deliveryKeys.licenseDetail(id),
        queryFn: () => fetchLicense(id),
        enabled: !!id,
    });
}

/**
 * Revoke a license with a reason.
 */
export function useRevokeLicense() {
    const queryClient = useQueryClient();

    return useMutation<License, ApiError, { id: string; reason: string }>({
        mutationFn: (variables) => revokeLicense(variables),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.licenses(),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.licenseDetail(variables.id),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.analytics(),
            });
        },
    });
}

/**
 * Suspend a license.
 */
export function useSuspendLicense() {
    const queryClient = useQueryClient();

    return useMutation<License, ApiError, string>({
        mutationFn: (id) => suspendLicense(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.licenses(),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.licenseDetail(id),
            });
        },
    });
}

/**
 * Reactivate a suspended license.
 */
export function useReactivateLicense() {
    const queryClient = useQueryClient();

    return useMutation<License, ApiError, string>({
        mutationFn: (id) => reactivateLicense(id),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.licenses(),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.licenseDetail(id),
            });
        },
    });
}

/**
 * Fetch a paginated list of product updates.
 */
export function useProductUpdates(filters?: Record<string, unknown>) {
    return useQuery<ProductUpdatesData, ApiError>({
        queryKey: deliveryKeys.productUpdateList(filters ?? {}),
        queryFn: () => fetchProductUpdates(filters),
    });
}

/**
 * Fetch the changelog for a specific product.
 */
export function useProductChangelog(productId: string) {
    return useQuery<ProductUpdate[], ApiError>({
        queryKey: deliveryKeys.changelog(productId),
        queryFn: () => fetchProductChangelog(productId),
        enabled: !!productId,
    });
}

/**
 * Publish a new product update.
 */
export function usePublishProductUpdate() {
    const queryClient = useQueryClient();

    return useMutation<
        ProductUpdate,
        ApiError,
        {
            digitalProductId: string;
            version: string;
            releaseNotes: string;
            isBreaking: boolean;
            fileId?: string;
        }
    >({
        mutationFn: (data) => publishProductUpdate(data),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.productUpdates(),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.pendingNotifications(),
            });
        },
    });
}

/**
 * Send notifications for a product update to all buyers.
 */
export function useSendUpdateNotifications() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (updateId) => sendUpdateNotifications(updateId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.productUpdates(),
            });
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.pendingNotifications(),
            });
        },
    });
}

/**
 * Fetch product updates that have not yet notified buyers.
 */
export function usePendingNotifications() {
    return useQuery<ProductUpdate[], ApiError>({
        queryKey: deliveryKeys.pendingNotifications(),
        queryFn: fetchPendingNotifications,
        staleTime: 30 * 1000,
    });
}

/**
 * Fetch suspicious download patterns flagged by the system.
 */
export function useSuspiciousDownloads() {
    return useQuery<SuspiciousPatternsData, ApiError>({
        queryKey: deliveryKeys.suspicious(),
        queryFn: fetchSuspiciousDownloads,
        staleTime: 60 * 1000,
    });
}

/**
 * Dismiss a flagged suspicious download pattern.
 */
export function useDismissSuspiciousPattern() {
    const queryClient = useQueryClient();

    return useMutation<void, ApiError, string>({
        mutationFn: (id) => dismissSuspiciousPattern(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: deliveryKeys.suspicious(),
            });
        },
    });
}
