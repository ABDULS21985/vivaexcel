// =============================================================================
// Notification Types
// =============================================================================
// Type definitions for the Notification Center feature.

export enum NotificationType {
  ORDER = "order",
  REVIEW = "review",
  PRODUCT_UPDATE = "product_update",
  PROMOTION = "promotion",
  SYSTEM = "system",
  COMMUNITY = "community",
  ACHIEVEMENT = "achievement",
  PAYOUT = "payout",
  SUBSCRIPTION = "subscription",
  SECURITY = "security",
}

export enum NotificationChannel {
  IN_APP = "in_app",
  EMAIL = "email",
  PUSH = "push",
  SMS = "sms",
}

export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived",
  DISMISSED = "dismissed",
}

export enum EmailDigestFrequency {
  INSTANT = "instant",
  DAILY = "daily",
  WEEKLY = "weekly",
  NONE = "none",
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
  imageUrl?: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  groupId?: string;
  metadata?: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  channel: NotificationChannel;
  categories: Record<string, boolean>;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  emailDigest: EmailDigestFrequency;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  userAgent?: string;
  deviceName?: string;
}

export interface NotificationsResponse {
  items: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UnreadCountResponse {
  count: number;
}
