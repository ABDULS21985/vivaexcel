/**
 * Authentication Types
 *
 * This file contains all TypeScript types related to authentication.
 * These types are re-exported from the auth context for convenience.
 */

/**
 * User object returned from the API
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Authentication tokens returned from login/refresh
 */
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Credentials for login request
 */
export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * Authentication state
 */
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

/**
 * Login response from API
 */
export interface LoginResponse {
    user: User;
    tokens: AuthTokens;
    message?: string;
}

/**
 * Refresh token response from API
 */
export interface RefreshTokenResponse {
    user?: User;
    tokens: AuthTokens;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
    message: string;
    error?: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
}
