/**
 * API Client for Global Digitalbit Dashboard
 *
 * This module provides a configured API client with:
 * - Automatic Bearer token attachment
 * - Token refresh on 401 responses
 * - Error handling utilities
 */

import { getTokens, clearTokens, setTokens } from "../contexts/auth-context";

// Types
export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    status: number;
}

export interface ApiError {
    message: string;
    status: number;
    errors?: Record<string, string[]>;
}

export interface RequestConfig extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
}

// Constants
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// Token refresh state to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Refresh the authentication token
 */
async function refreshAuthToken(): Promise<boolean> {
    const { refreshToken } = getTokens();

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new Error("Token refresh failed");
        }

        const data = await response.json();
        const responseData = data.data;
        const rememberMe =
            typeof window !== "undefined" &&
            localStorage.getItem("remember_me") === "true";

        setTokens(responseData, rememberMe);
        return true;
    } catch (error) {
        console.error("Token refresh failed:", error);
        clearTokens();
        return false;
    }
}

/**
 * Handle token refresh with request queuing
 */
async function handleTokenRefresh(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = refreshAuthToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
    });

    return refreshPromise;
}

/**
 * Build URL with query parameters
 */
function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
): string {
    const url = new URL(
        endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`
    );

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
}

/**
 * Parse API error from response
 */
async function parseApiError(response: Response): Promise<ApiError> {
    try {
        const data = await response.json();
        return {
            message: data.message || data.error || "An error occurred",
            status: response.status,
            errors: data.errors,
        };
    } catch {
        return {
            message: response.statusText || "An error occurred",
            status: response.status,
        };
    }
}

/**
 * Create headers with authentication
 */
function createHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers(customHeaders);

    if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const { accessToken } = getTokens();
    if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
}

/**
 * Main API request function
 */
async function apiRequest<T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<T> {
    const { params, timeout = 30000, ...fetchConfig } = config;
    const url = buildUrl(endpoint, params);
    const headers = createHeaders(fetchConfig.headers);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchConfig,
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - attempt token refresh
        if (response.status === 401) {
            const refreshed = await handleTokenRefresh();

            if (refreshed) {
                // Retry the original request with new token
                const newHeaders = createHeaders(fetchConfig.headers);
                const retryResponse = await fetch(url, {
                    ...fetchConfig,
                    headers: newHeaders,
                });

                if (!retryResponse.ok) {
                    const error = await parseApiError(retryResponse);
                    throw error;
                }

                return retryResponse.json();
            } else {
                // Redirect to login if refresh fails
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                throw {
                    message: "Session expired. Please login again.",
                    status: 401,
                } as ApiError;
            }
        }

        // Handle other error responses
        if (!response.ok) {
            const error = await parseApiError(response);
            throw error;
        }

        // Handle empty responses
        const contentType = response.headers.get("content-type");
        if (
            contentType &&
            contentType.includes("application/json") &&
            response.status !== 204
        ) {
            return response.json();
        }

        return {} as T;
    } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort errors
        if (error instanceof Error && error.name === "AbortError") {
            throw {
                message: "Request timeout",
                status: 408,
            } as ApiError;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message === "Failed to fetch") {
            throw {
                message:
                    "Network error. Please check your internet connection.",
                status: 0,
            } as ApiError;
        }

        throw error;
    }
}

/**
 * API Client with convenience methods
 */
export const apiClient = {
    /**
     * GET request
     */
    get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return apiRequest<T>(endpoint, {
            ...config,
            method: "GET",
        });
    },

    /**
     * POST request
     */
    post<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<T> {
        return apiRequest<T>(endpoint, {
            ...config,
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    /**
     * PUT request
     */
    put<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<T> {
        return apiRequest<T>(endpoint, {
            ...config,
            method: "PUT",
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    /**
     * PATCH request
     */
    patch<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<T> {
        return apiRequest<T>(endpoint, {
            ...config,
            method: "PATCH",
            body: data ? JSON.stringify(data) : undefined,
        });
    },

    /**
     * DELETE request
     */
    delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
        return apiRequest<T>(endpoint, {
            ...config,
            method: "DELETE",
        });
    },

    /**
     * Upload file(s)
     */
    async upload<T>(
        endpoint: string,
        formData: FormData,
        config?: Omit<RequestConfig, "body">
    ): Promise<T> {
        const { params, timeout = 60000, ...fetchConfig } = config || {};
        const url = buildUrl(endpoint, params);

        // Don't set Content-Type for FormData - browser will set it with boundary
        const headers = new Headers(fetchConfig.headers);
        const { accessToken } = getTokens();
        if (accessToken) {
            headers.set("Authorization", `Bearer ${accessToken}`);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...fetchConfig,
                method: "POST",
                headers,
                body: formData,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const error = await parseApiError(response);
                throw error;
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },
};

/**
 * Error handling utilities
 */
export function isApiError(error: unknown): error is ApiError {
    return (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        "status" in error
    );
}

export function getErrorMessage(error: unknown): string {
    if (isApiError(error)) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "An unexpected error occurred";
}

export function getValidationErrors(
    error: unknown
): Record<string, string[]> | undefined {
    if (isApiError(error) && error.errors) {
        return error.errors;
    }

    return undefined;
}

export default apiClient;

/**
 * Query key factory for consistent cache key management with React Query
 */
export const queryKeys = {
    // Products
    products: {
        all: ["products"] as const,
        lists: () => [...queryKeys.products.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.products.lists(), filters] as const,
        details: () => [...queryKeys.products.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.products.details(), id] as const,
    },
    // Services
    services: {
        all: ["services"] as const,
        lists: () => [...queryKeys.services.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.services.lists(), filters] as const,
        details: () => [...queryKeys.services.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.services.details(), id] as const,
    },
    // Posts
    posts: {
        all: ["posts"] as const,
        lists: () => [...queryKeys.posts.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.posts.lists(), filters] as const,
        details: () => [...queryKeys.posts.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.posts.details(), id] as const,
    },
    // Contacts
    contacts: {
        all: ["contacts"] as const,
        lists: () => [...queryKeys.contacts.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.contacts.lists(), filters] as const,
        details: () => [...queryKeys.contacts.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
    },
    // Users
    users: {
        all: ["users"] as const,
        lists: () => [...queryKeys.users.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.users.lists(), filters] as const,
        details: () => [...queryKeys.users.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
        current: () => [...queryKeys.users.all, "current"] as const,
    },
    // Dashboard Stats
    stats: {
        all: ["stats"] as const,
        dashboard: () => [...queryKeys.stats.all, "dashboard"] as const,
        summary: () => [...queryKeys.stats.all, "summary"] as const,
    },
    // Media
    media: {
        all: ["media"] as const,
        lists: () => [...queryKeys.media.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.media.lists(), filters] as const,
        details: () => [...queryKeys.media.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.media.details(), id] as const,
    },
    // Reviews
    reviews: {
        all: ["reviews"] as const,
        lists: () => [...queryKeys.reviews.all, "list"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.reviews.lists(), filters] as const,
        details: () => [...queryKeys.reviews.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.reviews.details(), id] as const,
        stats: () => [...queryKeys.reviews.all, "stats"] as const,
        analytics: () => [...queryKeys.reviews.all, "analytics"] as const,
    },
    // AI
    ai: {
        all: ["ai"] as const,
        titles: () => [...queryKeys.ai.all, "titles"] as const,
        metaDescription: () => [...queryKeys.ai.all, "meta-description"] as const,
        excerpt: () => [...queryKeys.ai.all, "excerpt"] as const,
        outline: () => [...queryKeys.ai.all, "outline"] as const,
        analysis: () => [...queryKeys.ai.all, "analysis"] as const,
    },
};
