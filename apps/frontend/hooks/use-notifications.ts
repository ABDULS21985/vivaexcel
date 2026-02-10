import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from "@/lib/api-client";
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  NotificationPreference,
  NotificationType,
  NotificationStatus,
  PushSubscriptionData,
} from "@/types/notification";

// =============================================================================
// Query Key Factory
// =============================================================================

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters?: NotificationFilters) =>
    [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
  preferences: () => [...notificationKeys.all, "preferences"] as const,
};

// =============================================================================
// Filter Types
// =============================================================================

export interface NotificationFilters {
  type?: NotificationType;
  status?: NotificationStatus;
  page?: number;
  limit?: number;
}

// =============================================================================
// Response Wrapper
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch paginated notifications with optional filters.
 */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () =>
      apiGet<ApiResponseWrapper<NotificationsResponse>>(
        "/notification-center",
        {
          type: filters?.type,
          status: filters?.status,
          page: filters?.page,
          limit: filters?.limit ?? 10,
        }
      ).then((res) => res.data),
    staleTime: 30 * 1000,
  });
}

/**
 * Fetch the count of unread notifications.
 * Polls every 30 seconds for real-time badge updates.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<UnreadCountResponse>>(
        "/notification-center/unread-count"
      ).then((res) => res.data),
    refetchInterval: 30000,
    staleTime: 10 * 1000,
  });
}

/**
 * Mark a single notification as read.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiPatch<ApiResponse<Notification>>(
        `/notification-center/${notificationId}/read`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

/**
 * Mark all notifications as read.
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<ApiResponse<void>>("/notification-center/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

/**
 * Archive a notification.
 */
export function useArchiveNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiPatch<ApiResponse<Notification>>(
        `/notification-center/${notificationId}/archive`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

/**
 * Dismiss a notification.
 */
export function useDismissNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiPatch<ApiResponse<Notification>>(
        `/notification-center/${notificationId}/dismiss`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}

/**
 * Fetch notification preferences.
 */
export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () =>
      apiGet<ApiResponseWrapper<NotificationPreference[]>>(
        "/notification-center/preferences"
      ).then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Update notification preferences.
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreference>) =>
      apiPatch<ApiResponse<NotificationPreference>>(
        "/notification-center/preferences",
        preferences
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
  });
}

/**
 * Subscribe to push notifications.
 */
export function usePushSubscribe() {
  return useMutation({
    mutationFn: (subscription: PushSubscriptionData) =>
      apiPost<ApiResponse<{ success: boolean }>>(
        "/notification-center/push/subscribe",
        subscription
      ),
  });
}

/**
 * Unsubscribe from push notifications.
 */
export function usePushUnsubscribe() {
  return useMutation({
    mutationFn: () =>
      apiDelete<ApiResponse<{ success: boolean }>>(
        "/notification-center/push/unsubscribe"
      ),
  });
}

/**
 * Send a test push notification.
 */
export function useTestPush() {
  return useMutation({
    mutationFn: () =>
      apiPost<ApiResponse<{ success: boolean }>>(
        "/notification-center/push/test"
      ),
  });
}
