"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Star,
  Package,
  Megaphone,
  Bell,
  Users,
  Trophy,
  DollarSign,
  CreditCard,
  Shield,
  ExternalLink,
  X,
  Archive,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button } from "@ktblog/ui/components";
import {
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  type Notification,
} from "@/types/notification";
import { useMarkAsRead, useDismissNotification } from "@/hooks/use-notifications";

// =============================================================================
// Notification Item Component
// =============================================================================
// Renders a single notification row with icon, content, time, and actions.

// -----------------------------------------------------------------------------
// Icon Mapping
// -----------------------------------------------------------------------------

const NOTIFICATION_ICONS: Record<
  NotificationType,
  React.ComponentType<{ className?: string }>
> = {
  [NotificationType.ORDER]: ShoppingCart,
  [NotificationType.REVIEW]: Star,
  [NotificationType.PRODUCT_UPDATE]: Package,
  [NotificationType.PROMOTION]: Megaphone,
  [NotificationType.SYSTEM]: Bell,
  [NotificationType.COMMUNITY]: Users,
  [NotificationType.ACHIEVEMENT]: Trophy,
  [NotificationType.PAYOUT]: DollarSign,
  [NotificationType.SUBSCRIPTION]: CreditCard,
  [NotificationType.SECURITY]: Shield,
};

const NOTIFICATION_ICON_COLORS: Record<NotificationType, string> = {
  [NotificationType.ORDER]: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  [NotificationType.REVIEW]: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  [NotificationType.PRODUCT_UPDATE]: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  [NotificationType.PROMOTION]: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  [NotificationType.SYSTEM]: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  [NotificationType.COMMUNITY]: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  [NotificationType.ACHIEVEMENT]: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
  [NotificationType.PAYOUT]: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  [NotificationType.SUBSCRIPTION]: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  [NotificationType.SECURITY]: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const PRIORITY_BORDER: Record<NotificationPriority, string> = {
  [NotificationPriority.LOW]: "",
  [NotificationPriority.NORMAL]: "",
  [NotificationPriority.HIGH]: "border-l-2 border-l-amber-400",
  [NotificationPriority.URGENT]: "border-l-2 border-l-red-500",
};

// -----------------------------------------------------------------------------
// Time Ago Helper
// -----------------------------------------------------------------------------

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface NotificationItemProps {
  notification: Notification;
  /** Compact mode for dropdown panel */
  compact?: boolean;
  /** Show archive button */
  showArchive?: boolean;
  /** Callback when item is clicked */
  onItemClick?: (notification: Notification) => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NotificationItem({
  notification,
  compact = false,
  showArchive = false,
  onItemClick,
}: NotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const dismissNotification = useDismissNotification();

  const isUnread = notification.status === NotificationStatus.UNREAD;
  const Icon = NOTIFICATION_ICONS[notification.type] ?? Bell;
  const iconColor = NOTIFICATION_ICON_COLORS[notification.type] ?? NOTIFICATION_ICON_COLORS[NotificationType.SYSTEM];
  const priorityBorder = PRIORITY_BORDER[notification.priority] ?? "";

  const handleClick = useCallback(() => {
    if (isUnread) {
      markAsRead.mutate(notification.id);
    }
    onItemClick?.(notification);
  }, [isUnread, markAsRead, notification, onItemClick]);

  const handleDismiss = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      dismissNotification.mutate(notification.id);
    },
    [dismissNotification, notification.id]
  );

  const content = (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      className={cn(
        "group relative flex items-start gap-3 rounded-xl transition-all cursor-pointer",
        compact ? "p-3" : "p-4",
        isUnread
          ? "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          : "bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
        !compact && "border border-neutral-200 dark:border-neutral-800",
        priorityBorder
      )}
      onClick={handleClick}
    >
      {/* Unread Dot */}
      {isUnread && (
        <div className="absolute top-3 right-3 z-10">
          <span className="flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1E4DB7] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#1E4DB7]" />
          </span>
        </div>
      )}

      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 flex items-center justify-center rounded-xl",
          compact ? "w-9 h-9" : "w-11 h-11",
          iconColor
        )}
      >
        <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={cn(
              "text-sm leading-snug",
              isUnread
                ? "font-semibold text-neutral-900 dark:text-white"
                : "font-medium text-neutral-700 dark:text-neutral-300"
            )}
          >
            {notification.title}
          </h4>
        </div>

        <p
          className={cn(
            "text-xs text-neutral-500 dark:text-neutral-400 mt-0.5",
            compact ? "line-clamp-1" : "line-clamp-2"
          )}
        >
          {notification.body}
        </p>

        {/* Time + Action */}
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {formatTimeAgo(notification.createdAt)}
          </span>

          {notification.actionUrl && notification.actionLabel && (
            <Link
              href={notification.actionUrl}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E4DB7] dark:text-blue-400 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {notification.actionLabel}
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Action Buttons (appear on hover) */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {showArchive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-colors"
            title="Archive"
          >
            <Archive className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );

  if (notification.actionUrl && !compact) {
    return (
      <Link href={notification.actionUrl} className="block" onClick={handleClick}>
        {content}
      </Link>
    );
  }

  return content;
}

export default NotificationItem;
