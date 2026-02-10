// =============================================================================
// Notification Types
// =============================================================================
// Type definitions for the Notification Center feature.

export enum NotificationType {
  ORDER = "ORDER",
  REVIEW = "REVIEW",
  PRODUCT_UPDATE = "PRODUCT_UPDATE",
  PROMOTION = "PROMOTION",
  SYSTEM = "SYSTEM",
  COMMUNITY = "COMMUNITY",
  ACHIEVEMENT = "ACHIEVEMENT",
  PAYOUT = "PAYOUT",
  SUBSCRIPTION = "SUBSCRIPTION",
  SECURITY = "SECURITY",
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
  SMS = "SMS",
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum NotificationStatus {
  UNREAD = "UNREAD",
  READ = "READ",
  ARCHIVED = "ARCHIVED",
  DISMISSED = "DISMISSED",
}

export enum EmailDigestFrequency {
  INSTANT = "INSTANT",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  NONE = "NONE",
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
