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
import { apiClient } from "@/lib/api-client";

// =============================================================================
// Auth Provider
// =============================================================================
// Provides authentication state and methods to the entire application.
// Stores JWT via httpOnly cookies (set by the API), manages user state,
// and redirects unauthenticated users from protected routes.

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
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
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

  // Check auth status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await apiClient<{ user: User }>("/auth/me", {
          credentials: "include",
        });
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
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
      const response = await apiClient<{ user: User }>("/auth/login", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const loginWithProvider = useCallback(
    async (provider: "google" | "github") => {
      // Redirect to OAuth provider endpoint
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
      window.location.href = `${baseUrl}/auth/${provider}`;
    },
    []
  );

  const loginWithMagicLink = useCallback(async (email: string) => {
    await apiClient("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Proceed with local logout even if API call fails
    }
    setUser(null);
    router.push("/");
  }, [router]);

  const register = useCallback(
    async (data: RegisterData) => {
      const response = await apiClient<{ user: User }>("/auth/register", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
      });
      setUser(response.user);
      router.push("/dashboard");
    },
    [router]
  );

  const updateProfile = useCallback(async (data: Partial<User>) => {
    const response = await apiClient<{ user: User }>("/auth/profile", {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify(data),
    });
    setUser(response.user);
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
