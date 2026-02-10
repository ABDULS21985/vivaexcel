"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  ChevronRight,
  ChevronLeft,
  Settings,
  CheckCheck,
  Archive,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { cn, Button, Skeleton } from "@ktblog/ui/components";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@ktblog/ui/components";
import { useAuth } from "@/providers/auth-provider";
import { NotificationStatus } from "@/types/notification";
import type { Notification } from "@/types/notification";
import {
  useNotifications,
  useUnreadCount,
  useMarkAllAsRead,
  useMarkAsRead,
  useArchiveNotification,
} from "@/hooks/use-notifications";
import { NotificationItem } from "@/components/notifications/notification-item";

// =============================================================================
// Notifications Page
// =============================================================================
// Full notification history with filters, pagination, and archive actions.

// -----------------------------------------------------------------------------
// Tab Configuration
// -----------------------------------------------------------------------------

interface StatusTab {
  key: string;
  label: string;
  status?: NotificationStatus;
}

const STATUS_TABS: StatusTab[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread", status: NotificationStatus.UNREAD },
  { key: "read", label: "Read", status: NotificationStatus.READ },
  { key: "archived", label: "Archived", status: NotificationStatus.ARCHIVED },
];

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function NotificationsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <Skeleton className="w-11 h-11 rounded-xl bg-neutral-200 dark:bg-neutral-800 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="h-3 w-full bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="h-3 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
              <Skeleton className="h-2.5 w-20 bg-neutral-200 dark:bg-neutral-800" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function EmptyState({ tab }: { tab: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-24 h-24 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <BellOff className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
        {tab === "all"
          ? "No notifications yet"
          : tab === "unread"
            ? "All caught up!"
            : tab === "archived"
              ? "No archived notifications"
              : "No read notifications"}
      </h2>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-sm text-sm">
        {tab === "all"
          ? "When you receive notifications about orders, reviews, and updates, they will appear here."
          : tab === "unread"
            ? "You have no unread notifications. Check back later for updates."
            : tab === "archived"
              ? "Archived notifications will appear here for your records."
              : "Notifications you have read will appear here."}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 15;

  const activeConfig = STATUS_TABS.find((t) => t.key === activeTab);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?returnUrl=/account/notifications");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading, isError, refetch } = useNotifications({
    status: activeConfig?.status,
    page,
    limit,
  });

  const { data: unreadData } = useUnreadCount();
  const markAllAsRead = useMarkAllAsRead();
  const markAsRead = useMarkAsRead();
  const archiveNotification = useArchiveNotification();

  const notifications = useMemo(() => data?.items ?? [], [data]);
  const totalPages = data?.meta?.totalPages ?? 1;
  const total = data?.meta?.total ?? 0;
  const unreadCount = unreadData?.count ?? 0;

  const handleItemClick = useCallback(
    (notification: Notification) => {
      if (notification.status === NotificationStatus.UNREAD) {
        markAsRead.mutate(notification.id);
      }
      if (notification.actionUrl) {
        router.push(notification.actionUrl);
      }
    },
    [markAsRead, router]
  );

  const handleArchive = useCallback(
    (notificationId: string) => {
      archiveNotification.mutate(notificationId);
    },
    [archiveNotification]
  );

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // Auth loading
  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-[#1E4DB7] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
        {/* Dot Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 max-w-6xl relative">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-white/70 hover:text-white">
                    Home
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    href="/account"
                    className="text-white/70 hover:text-white"
                  >
                    Account
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="w-3.5 h-3.5 text-white/50" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">
                  Notifications
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-6">
            {/* Icon Container */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-10 h-10 text-white" />
            </div>

            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Notifications
              </h1>
              <p className="text-white/80 text-sm md:text-base">
                Stay updated on your orders, reviews, and account activity
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Bell className="w-3.5 h-3.5" />
                Total Notifications
              </div>
              <div className="text-2xl font-bold text-white">{total}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-white/70 text-xs mb-1">
                <Bell className="w-3.5 h-3.5" />
                Unread
              </div>
              <div className="text-2xl font-bold text-white">
                {unreadCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 max-w-6xl">
        {/* Actions Bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                    activeTab === tab.key
                      ? "bg-[#1E4DB7] text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  {tab.label}
                  {tab.key === "unread" && unreadCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white/20 text-[11px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead.mutate()}
                  disabled={markAllAsRead.isPending}
                  className="gap-1.5 text-xs"
                >
                  {markAllAsRead.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  Mark All Read
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 text-xs"
              >
                <Link href="/account/settings/notifications">
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && <NotificationsSkeleton />}

        {/* Error */}
        {isError && (
          <div className="text-center py-12 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-500 dark:text-red-400 mb-4 font-medium">
              Failed to load notifications. Please try again.
            </p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retry
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && notifications.length === 0 && (
          <EmptyState tab={activeTab} />
        )}

        {/* Notification List */}
        {!isLoading && !isError && notifications.length > 0 && (
          <>
            <div className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
              Showing {(page - 1) * limit + 1}-
              {Math.min(page * limit, total)} of {total} notifications
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    className="relative group"
                  >
                    <NotificationItem
                      notification={notification}
                      showArchive
                      onItemClick={handleItemClick}
                    />

                    {/* Archive Overlay Button */}
                    {notification.status !== NotificationStatus.ARCHIVED && (
                      <button
                        onClick={() => handleArchive(notification.id)}
                        className={cn(
                          "absolute top-4 right-12 p-2 rounded-lg",
                          "bg-neutral-100 dark:bg-neutral-800",
                          "text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400",
                          "opacity-0 group-hover:opacity-100 transition-opacity",
                          "hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        )}
                        title="Archive notification"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Page {page} of {totalPages}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, totalPages) },
                      (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={
                              page === pageNum ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className={cn(
                              "w-9 h-9 p-0",
                              page === pageNum &&
                                "bg-[#1E4DB7] hover:bg-[#143A8F] text-white"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
