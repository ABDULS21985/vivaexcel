export enum NotificationType {
  ORDER = 'order',
  REVIEW = 'review',
  PRODUCT_UPDATE = 'product_update',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
  COMMUNITY = 'community',
  ACHIEVEMENT = 'achievement',
  PAYOUT = 'payout',
  SUBSCRIPTION = 'subscription',
  SECURITY = 'security',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DISMISSED = 'dismissed',
}

export enum EmailDigestFrequency {
  INSTANT = 'instant',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  NONE = 'none',
}
