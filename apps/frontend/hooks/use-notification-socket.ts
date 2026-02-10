import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { getToken } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { notificationKeys } from "./use-notifications";
import type { Notification } from "@/types/notification";

// =============================================================================
// WebSocket Hook for Real-Time Notifications
// =============================================================================
// Connects to the /notifications namespace and listens for real-time events.
// Automatically invalidates React Query caches when notifications arrive.

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4001";

export interface UseNotificationSocketOptions {
  /** Called when a new notification arrives */
  onNotification?: (notification: Notification) => void;
  /** Called when a notification is marked as read */
  onRead?: (data: { id: string }) => void;
  /** Called when all notifications are marked as read */
  onAllRead?: (data: { affected: number }) => void;
  /** Whether socket connection is enabled */
  enabled?: boolean;
}

export function useNotificationSocket(
  options: UseNotificationSocketOptions = {}
) {
  const { onNotification, onRead, onAllRead, enabled = true } = options;
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const onNotificationRef = useRef(onNotification);
  const onReadRef = useRef(onRead);
  const onAllReadRef = useRef(onAllRead);

  // Keep refs up to date
  onNotificationRef.current = onNotification;
  onReadRef.current = onRead;
  onAllReadRef.current = onAllRead;

  const invalidateNotifications = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
  }, [queryClient]);

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;

    const token = getToken();
    if (!token) return;

    const socket = io(`${WS_URL}/notifications`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      // Connection established
    });

    socket.on("notification:new", (notification: Notification) => {
      invalidateNotifications();
      onNotificationRef.current?.(notification);
    });

    socket.on("notification:read", (data: { id: string }) => {
      invalidateNotifications();
      onReadRef.current?.(data);
    });

    socket.on("notification:all-read", (data: { affected: number }) => {
      invalidateNotifications();
      onAllReadRef.current?.(data);
    });

    socket.on("notification:archived", () => {
      invalidateNotifications();
    });

    socket.on("notification:dismissed", () => {
      invalidateNotifications();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, isAuthenticated, invalidateNotifications]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  };
}
