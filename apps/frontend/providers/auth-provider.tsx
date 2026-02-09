"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  apiClient,
  apiPost,
  apiPatch,
  setTokens,
  clearTokens,
  getToken,
  hasToken,
} from "@/lib/api-client";

// =============================================================================
// Auth Provider
// =============================================================================
// Provides authentication state and methods to the entire application.
// Uses JWT tokens stored in localStorage, validates with GET /auth/me,
// handles token refresh automatically via the API client, and redirects
// unauthenticated users from protected routes.

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  plan: "free" | "basic" | "pro" | "premium";
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: "google" | "github") => Promise<void>;
  loginWithMagicLink: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Protected route paths that require authentication
const PROTECTED_PATHS = ["/dashboard", "/dashboard/profile", "/dashboard/billing"];

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Check auth status on mount using stored JWT token
  useEffect(() => {
    async function checkAuth() {
      // Only attempt auth check if we have a stored token
      if (!hasToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient<{ user: User }>("/auth/me");
        setUser(response.user);
      } catch {
        // Token is invalid or expired - clear it
        clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Handle OAuth callback tokens from URL hash/query params
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken") || params.get("token");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      setTokens(accessToken, refreshToken || undefined);
      // Clean URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);

      // Fetch user data with new token
      apiClient<{ user: User }>("/auth/me")
        .then((response) => {
          setUser(response.user);
          setIsLoading(false);
        })
        .catch(() => {
          clearTokens();
          setIsLoading(false);
        });
    }
  }, []);

  // Redirect to login for protected routes
  useEffect(() => {
    if (isLoading) return;

    const isProtected = PROTECTED_PATHS.some((path) => {
      // Strip locale prefix (e.g. /en/dashboard -> /dashboard)
      const segments = pathname.split("/");
      const pathWithoutLocale = "/" + segments.slice(2).join("/");
      return pathWithoutLocale.startsWith(path);
    });

    if (isProtected && !isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.push(`/login?returnUrl=${returnUrl}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiPost<AuthResponse>("/auth/login", {
        email,
        password,
      });
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const loginWithProvider = useCallback(
    async (provider: "google" | "github") => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
      window.location.href = `${baseUrl}/auth/${provider}`;
    },
    []
  );

  const loginWithMagicLink = useCallback(async (email: string) => {
    await apiPost("/auth/magic-link", { email });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout");
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearTokens();
    setUser(null);
    router.push("/");
  }, [router]);

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await apiPost<AuthResponse>("/auth/register", data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await apiPatch<{ user: User }>("/auth/profile", data);
    setUser(response.user);
  }, []);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await apiPost("/auth/change-password", {
        currentPassword,
        newPassword,
      });
    },
    []
  );

  const deleteAccount = useCallback(async () => {
    await apiClient("/auth/account", { method: "DELETE" });
    clearTokens();
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!hasToken()) return;
    try {
      const response = await apiClient<{ user: User }>("/auth/me");
      setUser(response.user);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      loginWithProvider,
      loginWithMagicLink,
      logout,
      register,
      updateProfile,
      changePassword,
      deleteAccount,
      refreshUser,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      login,
      loginWithProvider,
      loginWithMagicLink,
      logout,
      register,
      updateProfile,
      changePassword,
      deleteAccount,
      refreshUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access the auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
