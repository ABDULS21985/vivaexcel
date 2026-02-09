"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import { useRouter } from "next/navigation";

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
    roles?: string[];
    avatarUrl?: string | null;
    emailVerified?: boolean;
    twoFactorEnabled?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    clearError: () => void;
}

// Constants
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "auth_user";
const REMEMBER_ME_KEY = "remember_me";

// Helper functions for storage
const getStorage = () => {
    if (typeof window === "undefined") return null;
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    return rememberMe ? localStorage : sessionStorage;
};

const setTokens = (tokens: AuthTokens, rememberMe: boolean) => {
    if (typeof window === "undefined") return;

    const storage = rememberMe ? localStorage : sessionStorage;
    localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
    storage.setItem(TOKEN_KEY, tokens.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

    // Set cookie for middleware
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 1 day
    document.cookie = `${TOKEN_KEY}=${tokens.accessToken}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const getTokens = (): { accessToken: string | null; refreshToken: string | null } => {
    if (typeof window === "undefined") {
        return { accessToken: null, refreshToken: null };
    }

    const storage = getStorage();
    if (!storage) {
        return { accessToken: null, refreshToken: null };
    }

    return {
        accessToken: storage.getItem(TOKEN_KEY),
        refreshToken: storage.getItem(REFRESH_TOKEN_KEY),
    };
};

const clearTokens = () => {
    if (typeof window === "undefined") return;

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    // Clear cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

const setStoredUser = (user: User, rememberMe: boolean) => {
    if (typeof window === "undefined") return;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
};

const getStoredUser = (): User | null => {
    if (typeof window === "undefined") return null;

    const storage = getStorage();
    if (!storage) return null;

    const userStr = storage.getItem(USER_KEY);
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: null,
    });

    // Initialize auth state from storage
    useEffect(() => {
        const initializeAuth = async () => {
            const { accessToken } = getTokens();
            const storedUser = getStoredUser();

            if (accessToken && storedUser) {
                setState({
                    user: storedUser,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                    error: null,
                });
            } else {
                setState((prev) => ({
                    ...prev,
                    isInitialized: true,
                }));
            }
        };

        initializeAuth();
    }, []);

    // Token refresh mechanism
    const refreshToken = useCallback(async (): Promise<boolean> => {
        const { refreshToken: storedRefreshToken } = getTokens();

        if (!storedRefreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refreshToken: storedRefreshToken }),
            });

            if (!response.ok) {
                throw new Error("Token refresh failed");
            }

            const data = await response.json();
            const responseData = data.data;
            const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";

            setTokens(responseData, rememberMe);

            if (responseData.user) {
                setStoredUser(responseData.user, rememberMe);
                setState((prev) => ({
                    ...prev,
                    user: responseData.user,
                }));
            }

            return true;
        } catch (error) {
            console.error("Token refresh error:", error);
            clearTokens();
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                error: null,
            });
            return false;
        }
    }, []);

    // Set up automatic token refresh
    useEffect(() => {
        if (!state.isAuthenticated) return;

        // Refresh token 5 minutes before expiry (assuming 1 hour tokens)
        const refreshInterval = setInterval(
            () => {
                refreshToken();
            },
            55 * 60 * 1000 // 55 minutes
        );

        return () => clearInterval(refreshInterval);
    }, [state.isAuthenticated, refreshToken]);

    // Login function
    const login = useCallback(
        async (credentials: LoginCredentials) => {
            setState((prev) => ({
                ...prev,
                isLoading: true,
                error: null,
            }));

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(
                        errorData.message || "Invalid email or password"
                    );
                }

                const data = await response.json();
                const responseData = data.data;
                const rememberMe = credentials.rememberMe ?? false;

                // Store tokens and user
                setTokens(responseData, rememberMe);
                setStoredUser(responseData.user, rememberMe);

                setState({
                    user: responseData.user,
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true,
                    error: null,
                });

                // Redirect to dashboard
                router.push("/");
            } catch (error) {
                const errorMessage =
                    error instanceof Error
                        ? error.message
                        : "An unexpected error occurred";

                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: errorMessage,
                }));

                throw error;
            }
        },
        [router]
    );

    // Logout function
    const logout = useCallback(async () => {
        setState((prev) => ({
            ...prev,
            isLoading: true,
        }));

        try {
            const { accessToken } = getTokens();

            if (accessToken) {
                // Call logout endpoint
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                }).catch(() => {
                    // Ignore logout API errors - we'll clear local state anyway
                });
            }
        } finally {
            // Clear all stored data
            clearTokens();

            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                isInitialized: true,
                error: null,
            });

            // Redirect to login
            router.push("/login");
        }
    }, [router]);

    // Clear error
    const clearError = useCallback(() => {
        setState((prev) => ({
            ...prev,
            error: null,
        }));
    }, []);

    // Memoize context value
    const contextValue = useMemo<AuthContextType>(
        () => ({
            ...state,
            login,
            logout,
            refreshToken,
            clearError,
        }),
        [state, login, logout, refreshToken, clearError]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook to use auth context
export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);

    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }

    return context;
}

// Export tokens getter for API client
export { getTokens, setTokens, clearTokens };
