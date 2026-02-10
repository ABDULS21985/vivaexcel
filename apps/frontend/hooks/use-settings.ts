import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";

// =============================================================================
// Settings Types
// =============================================================================

export interface UserSettingsData {
  emailProductUpdates: boolean;
  emailWeeklyDigest: boolean;
  emailCommentsReplies: boolean;
  emailMentions: boolean;
  emailNewsletter: boolean;
  emailMarketing: boolean;
  profileVisibility: string;
  showReadingHistory: boolean;
  showBookmarks: boolean;
  allowAnalytics: boolean;
  language?: string;
  timezone?: string;
}

export interface SessionData {
  ipAddress: string;
  userAgent: string;
  createdAt: number;
  lastAccessedAt: number;
  isCurrent: boolean;
}

// =============================================================================
// Query Keys
// =============================================================================

export const settingsKeys = {
  all: ["settings"] as const,
  detail: () => [...settingsKeys.all, "detail"] as const,
  sessions: () => [...settingsKeys.all, "sessions"] as const,
};

// =============================================================================
// Hooks
// =============================================================================

export function useSettings() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: () => apiGet<UserSettingsData>("/settings"),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserSettingsData>) =>
      apiPatch<UserSettingsData>("/settings/notifications", data),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data);
    },
  });
}

export function useUpdatePrivacy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserSettingsData>) =>
      apiPatch<UserSettingsData>("/settings/privacy", data),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data);
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<UserSettingsData>) =>
      apiPatch<UserSettingsData>("/settings/preferences", data),
    onSuccess: (data) => {
      queryClient.setQueryData(settingsKeys.detail(), data);
    },
  });
}

export function useSessions() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: () => apiGet<SessionData[]>("/settings/sessions"),
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
}

export function useLogoutAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<{ message: string }>("/auth/logout/all"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.sessions() });
    },
  });
}
