"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCheck,
  BellOff,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import { NotificationType, NotificationStatus } from "@/types/notification";
import { useNotifications, useMarkAllAsRead } from "@/hooks/use-notifications";
import { NotificationItem } from "./notification-item";

// =============================================================================
// Notification Panel Component
// =============================================================================
// Dropdown panel that displays a filtered list of recent notifications.

// -----------------------------------------------------------------------------
// Tab Configuration
// -----------------------------------------------------------------------------

interface TabConfig {
  key: string;
  label: string;
  type?: NotificationType;
}

const TABS: TabConfig[] = [
  { key: "all", label: "All" },
  { key: "orders", label: "Orders", type: NotificationType.ORDER },
  { key: "reviews", label: "Reviews", type: NotificationType.REVIEW },
  { key: "updates", label: "Updates", type: NotificationType.PRODUCT_UPDATE },
  { key: "promotions", label: "Promos", type: NotificationType.PROMOTION },
];

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function PanelSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3">
          <Skeleton className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4 bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-full bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-2.5 w-16 bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function EmptyTabState({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
        <BellOff className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
      </div>
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        No {tab === "all" ? "" : tab + " "}notifications
      </p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
        You&apos;re all caught up!
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

export interface NotificationPanelProps {
  /** Callback when panel should close */
  onClose?: () => void;
  /** Max number of items to display */
  maxItems?: number;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function NotificationPanel({
  onClose,
  maxItems = 10,
}: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState("all");
  const activeConfig = TABS.find((t) => t.key === activeTab);

  const { data, isLoading } = useNotifications({
    type: activeConfig?.type,
    limit: maxItems,
  });
  const markAllAsRead = useMarkAllAsRead();

  const notifications = useMemo(() => {
    return data?.items ?? [];
  }, [data]);

  const hasUnread = notifications.some(
    (n) => n.status === NotificationStatus.UNREAD
  );

  return (
    <div className="w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            Notifications
          </h3>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
              className="text-xs text-[#1E4DB7] dark:text-blue-400 hover:text-[#143A8F] h-7 px-2"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
              ) : (
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-1 px-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                activeTab === tab.key
                  ? "bg-[#1E4DB7] text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto overscroll-contain">
        {isLoading ? (
          <PanelSkeleton />
        ) : notifications.length === 0 ? (
          <EmptyTabState tab={activeTab} />
        ) : (
          <div className="p-1.5 space-y-0.5">
            <AnimatePresence mode="popLayout" initial={false}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  compact
                  onItemClick={() => onClose?.()}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="h-px bg-neutral-100 dark:bg-neutral-800" />
      <div className="p-3">
        <Link
          href="/account/notifications"
          onClick={() => onClose?.()}
          className={cn(
            "flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-medium",
            "text-[#1E4DB7] dark:text-blue-400 hover:bg-[#1E4DB7]/5 dark:hover:bg-blue-400/5",
            "transition-colors"
          )}
        >
          View All Notifications
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

export default NotificationPanel;
