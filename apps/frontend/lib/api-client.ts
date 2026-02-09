// =============================================================================
// API Client Utility
// =============================================================================
// Centralized API client for making HTTP requests to the backend.
// Handles JWT token attachment, token refresh on 401, and typed responses.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

const TOKEN_KEY = "ktblog_token";
const REFRESH_TOKEN_KEY = "ktblog_refresh_token";

// =============================================================================
// Token Helpers
// =============================================================================

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasToken(): boolean {
  return !!getToken();
}

// =============================================================================
// Typed API Response
// =============================================================================

export interface ApiResponse<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Custom Error Class
// =============================================================================

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: Record<string, unknown>;

  constructor(
    status: number,
    statusText: string,
    message?: string,
    data?: Record<string, unknown>
  ) {
    super(message || `API Error: ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// =============================================================================
// Token Refresh Logic
// =============================================================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void): void {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(newToken: string): void {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    throw new ApiError(401, "Unauthorized", "No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    throw new ApiError(401, "Unauthorized", "Token refresh failed");
  }

  const data = await response.json();
  const newAccessToken = data.accessToken || data.token || data.data?.accessToken || data.data?.token;
  const newRefreshToken = data.refreshToken || data.data?.refreshToken;

  if (!newAccessToken) {
    clearTokens();
    throw new ApiError(401, "Unauthorized", "No token in refresh response");
  }

  setTokens(newAccessToken, newRefreshToken);
  return newAccessToken;
}

// =============================================================================
// Core API Client
// =============================================================================

/**
 * Generic API client for making HTTP requests.
 * Automatically attaches JWT token and handles 401 token refresh.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  // Attach JWT token if available and not skipping auth
  if (token && !options?.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  let response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  // Handle 401 - attempt token refresh
  if (response.status === 401 && !options?.skipAuth && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);

        // Retry original request with new token
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          credentials: "include",
          headers,
        });
      } catch {
        isRefreshing = false;
        clearTokens();
        // Redirect to login if in browser
        if (typeof window !== "undefined") {
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnUrl=${returnUrl}`;
        }
        throw new ApiError(401, "Unauthorized", "Session expired");
      }
    } else {
      // Another refresh is in progress; wait for it
      const newToken = await new Promise<string>((resolve) => {
        subscribeTokenRefresh(resolve);
      });
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        credentials: "include",
        headers,
      });
    }
  }

  if (!response.ok) {
    let errorData: Record<string, unknown> | undefined;
    let errorMessage: string | undefined;
    try {
      errorData = await response.json();
      errorMessage =
        (errorData?.message as string) ||
        (errorData?.error as string) ||
        undefined;
    } catch {
      // Response body is not JSON
    }
    throw new ApiError(
      response.status,
      response.statusText,
      errorMessage,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// =============================================================================
// HTTP Method Helpers
// =============================================================================

/**
 * GET request helper with query parameter support
 */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return apiClient<T>(url.toString(), {
    method: "GET",
    ...options,
  });
}

/**
 * POST request helper
 */
export async function apiPost<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCH request helper
 */
export async function apiPatch<T, D = unknown>(
  endpoint: string,
  data?: D,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(
  endpoint: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "DELETE",
    ...options,
  });
}
