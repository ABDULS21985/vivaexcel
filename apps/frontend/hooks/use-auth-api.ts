import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  apiPost,
  apiPatch,
  setTokens,
  clearTokens,
  hasToken,
} from "@/lib/api-client";
import type { User } from "@/providers/auth-provider";

// =============================================================================
// Auth API Types
// =============================================================================

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
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

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// =============================================================================
// Query Keys
// =============================================================================

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
};

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch the currently authenticated user.
 * Only runs if a token exists in localStorage.
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: async () => {
      const response = await apiClient<{ user: User }>("/auth/me");
      return response.user;
    },
    enabled: hasToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Login mutation.
 * Stores tokens on success and invalidates the current user query.
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiPost<AuthResponse>("/auth/login", data);
      return response;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(authKeys.currentUser(), data.user);
    },
  });
}

/**
 * Register mutation.
 * Stores tokens on success and sets user in cache.
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiPost<AuthResponse>("/auth/register", data);
      return response;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      queryClient.setQueryData(authKeys.currentUser(), data.user);
    },
  });
}

/**
 * Logout mutation.
 * Clears tokens and resets all queries.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await apiPost("/auth/logout");
      } catch {
        // Proceed with local logout even if API call fails
      }
    },
    onSettled: () => {
      clearTokens();
      queryClient.setQueryData(authKeys.currentUser(), null);
      queryClient.clear();
    },
  });
}

/**
 * Update profile mutation.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await apiPatch<{ user: User }>("/auth/profile", data);
      return response.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(authKeys.currentUser(), updatedUser);
    },
  });
}

/**
 * Change password mutation.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      return apiPost<{ message: string }>("/auth/change-password", data);
    },
  });
}

/**
 * Send magic link mutation.
 */
export function useMagicLink() {
  return useMutation({
    mutationFn: async (email: string) => {
      return apiPost<{ message: string }>("/auth/magic-link", { email });
    },
  });
}

/**
 * Delete account mutation.
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      return apiClient<{ message: string }>("/auth/account", {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      clearTokens();
    },
  });
}

/**
 * Get the Google OAuth redirect URL.
 */
export function getGoogleOAuthUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
  return `${baseUrl}/auth/google`;
}

/**
 * Get the GitHub OAuth redirect URL.
 */
export function getGitHubOAuthUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1";
  return `${baseUrl}/auth/github`;
}
