"use client";

import { useEffect } from "react";
import { toast } from "sonner";
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
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { NotificationType, NotificationPriority } from "@/types/notification";
import type { Notification } from "@/types/notification";
import { useNotificationSocket } from "@/hooks/use-notification-socket";

// =============================================================================
// Toast Notification Provider
// =============================================================================
// Integrates with WebSocket to show Sonner toast notifications in real-time.
// Renders different toast styles based on notification type and priority.

// -----------------------------------------------------------------------------
// Icon Mapping
// -----------------------------------------------------------------------------

const TOAST_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
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

const TOAST_COLORS: Record<NotificationType, string> = {
  [NotificationType.ORDER]: "text-blue-600",
  [NotificationType.REVIEW]: "text-amber-600",
  [NotificationType.PRODUCT_UPDATE]: "text-emerald-600",
  [NotificationType.PROMOTION]: "text-purple-600",
  [NotificationType.SYSTEM]: "text-neutral-600",
  [NotificationType.COMMUNITY]: "text-cyan-600",
  [NotificationType.ACHIEVEMENT]: "text-yellow-500",
  [NotificationType.PAYOUT]: "text-green-600",
  [NotificationType.SUBSCRIPTION]: "text-indigo-600",
  [NotificationType.SECURITY]: "text-red-600",
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NotificationToastProvider() {
  const router = useRouter();

  useNotificationSocket({
    onNotification: (notification: Notification) => {
      showNotificationToast(notification, router);
    },
  });

  return null;
}

function showNotificationToast(
  notification: Notification,
  router: ReturnType<typeof useRouter>
) {
  const Icon = TOAST_ICONS[notification.type] ?? Bell;
  const iconColor = TOAST_COLORS[notification.type] ?? "text-neutral-600";

  const isUrgent =
    notification.priority === NotificationPriority.URGENT ||
    notification.priority === NotificationPriority.HIGH;

  // Achievement: celebratory toast
  if (notification.type === NotificationType.ACHIEVEMENT) {
    toast.success(notification.title, {
      description: notification.body,
      duration: 6000,
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      action: notification.actionUrl
        ? {
            label: notification.actionLabel || "View",
            onClick: () => router.push(notification.actionUrl!),
          }
        : undefined,
    });
    return;
  }

  // Payout: success style
  if (notification.type === NotificationType.PAYOUT) {
    toast.success(notification.title, {
      description: notification.body,
      duration: 5000,
      icon: <DollarSign className="w-5 h-5 text-green-600" />,
      action: notification.actionUrl
        ? {
            label: notification.actionLabel || "View",
            onClick: () => router.push(notification.actionUrl!),
          }
        : undefined,
    });
    return;
  }

  // Security: warning style
  if (notification.type === NotificationType.SECURITY) {
    toast.warning(notification.title, {
      description: notification.body,
      duration: 8000,
      icon: <Shield className="w-5 h-5 text-red-600" />,
      action: notification.actionUrl
        ? {
            label: notification.actionLabel || "Review",
            onClick: () => router.push(notification.actionUrl!),
          }
        : undefined,
    });
    return;
  }

  // Promotion / Flash sale: urgent styling
  if (
    notification.type === NotificationType.PROMOTION &&
    isUrgent
  ) {
    toast(notification.title, {
      description: notification.body,
      duration: 8000,
      icon: <Megaphone className="w-5 h-5 text-purple-600" />,
      action: notification.actionUrl
        ? {
            label: notification.actionLabel || "Shop Now",
            onClick: () => router.push(notification.actionUrl!),
          }
        : undefined,
      className: "border-purple-200 dark:border-purple-800",
    });
    return;
  }

  // Default toast
  toast(notification.title, {
    description: notification.body,
    duration: isUrgent ? 8000 : 4000,
    icon: <Icon className={`w-5 h-5 ${iconColor}`} />,
    action: notification.actionUrl
      ? {
          label: notification.actionLabel || "View",
          onClick: () => router.push(notification.actionUrl!),
        }
      : undefined,
  });
}

export default NotificationToastProvider;
