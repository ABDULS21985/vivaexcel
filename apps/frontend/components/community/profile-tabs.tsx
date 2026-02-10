"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  Star,
  MessageSquare,
  HelpCircle,
  Loader2,
  Calendar,
  Tag,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api-client";
import { formatRelativeTime } from "@/lib/format";
import { Link } from "@/i18n/routing";

// =============================================================================
// Types
// =============================================================================

interface ProfileTabsProps {
  userId: string;
  username: string;
}

type TabKey = "showcases" | "reviews" | "discussions" | "qa";

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

interface ShowcaseItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  createdAt: string;
}

interface ReviewItem {
  id: string;
  productId: string;
  productName?: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
}

interface ThreadItem {
  id: string;
  title: string;
  category?: string;
  replyCount?: number;
  createdAt: string;
}

interface QAItem {
  id: string;
  type: "question" | "answer";
  content: string;
  productName?: string;
  upvoteCount: number;
  createdAt: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const tabContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.15 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
    },
  }),
};

// =============================================================================
// Sub-components
// =============================================================================

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ElementType;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60">
        <Icon className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {message}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-300 dark:text-neutral-600" />
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 dark:fill-neutral-700 text-neutral-200 dark:text-neutral-700"
          }`}
        />
      ))}
    </div>
  );
}

// =============================================================================
// Tab Content Components
// =============================================================================

function ShowcasesTab({ userId, t }: { userId: string; t: ReturnType<typeof useTranslations> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile-showcases", userId],
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ items: ShowcaseItem[] }>>(
        "/showcases",
        { userId, limit: 20 },
      ).then((res) => res.data.items),
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) return <LoadingState />;
  if (!data || data.length === 0) {
    return (
      <EmptyState icon={ImageIcon} message={t("tabs.noShowcases")} />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((item, i) => (
        <motion.div
          key={item.id}
          custom={i}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
        >
          <Link
            href={`/showcases/${item.id}`}
            className="block group rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-md transition-shadow"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-neutral-100 dark:bg-neutral-800 relative overflow-hidden">
              {item.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              {item.description && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
                {formatRelativeTime(item.createdAt)}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function ReviewsTab({ userId, t }: { userId: string; t: ReturnType<typeof useTranslations> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile-reviews", userId],
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ items: ReviewItem[] }>>(
        "/reviews",
        { userId, limit: 20 },
      ).then((res) => res.data.items),
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) return <LoadingState />;
  if (!data || data.length === 0) {
    return <EmptyState icon={Star} message={t("tabs.noReviews")} />;
  }

  return (
    <div className="space-y-3">
      {data.map((review, i) => (
        <motion.div
          key={review.id}
          custom={i}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
          className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1">
                {review.title}
              </h3>
              {review.productName && (
                <p className="text-xs text-[#1E4DB7] dark:text-blue-400 mt-0.5">
                  {review.productName}
                </p>
              )}
            </div>
            <StarDisplay rating={review.rating} />
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {review.body}
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-2">
            {formatRelativeTime(review.createdAt)}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

function DiscussionsTab({ userId, t }: { userId: string; t: ReturnType<typeof useTranslations> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile-discussions", userId],
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ items: ThreadItem[] }>>(
        "/community/threads",
        { userId, limit: 20 },
      ).then((res) => res.data.items),
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) return <LoadingState />;
  if (!data || data.length === 0) {
    return (
      <EmptyState icon={MessageSquare} message={t("tabs.noDiscussions")} />
    );
  }

  return (
    <div className="space-y-3">
      {data.map((thread, i) => (
        <motion.div
          key={thread.id}
          custom={i}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
        >
          <Link
            href={`/community/threads/${thread.id}`}
            className="block p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800 hover:shadow-sm transition-shadow group"
          >
            <h3 className="font-semibold text-neutral-900 dark:text-white text-sm line-clamp-1 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
              {thread.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              {thread.category && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {thread.category}
                </span>
              )}
              {thread.replyCount !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {thread.replyCount} {t("tabs.replies")}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(thread.createdAt)}
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function QATab({ userId, t }: { userId: string; t: ReturnType<typeof useTranslations> }) {
  const { data, isLoading } = useQuery({
    queryKey: ["profile-qa", userId],
    queryFn: () =>
      apiGet<ApiResponseWrapper<{ items: QAItem[] }>>(
        "/product-qa/user-activity",
        { userId, limit: 20 },
      ).then((res) => res.data.items),
    staleTime: 3 * 60 * 1000,
  });

  if (isLoading) return <LoadingState />;
  if (!data || data.length === 0) {
    return <EmptyState icon={HelpCircle} message={t("tabs.noQA")} />;
  }

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <motion.div
          key={item.id}
          custom={i}
          variants={listItemVariants}
          initial="hidden"
          animate="visible"
          className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/70 dark:border-neutral-800"
        >
          <div className="flex items-start gap-3">
            {/* Type badge */}
            <span
              className={`
                shrink-0 mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold
                ${
                  item.type === "question"
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                }
              `}
            >
              {item.type === "question" ? t("tabs.question") : t("tabs.answerLabel")}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                {item.content}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                {item.productName && (
                  <span className="text-[#1E4DB7] dark:text-blue-400">
                    {item.productName}
                  </span>
                )}
                <span>{formatRelativeTime(item.createdAt)}</span>
                {item.upvoteCount > 0 && (
                  <span>
                    {item.upvoteCount} {t("tabs.upvotes")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ProfileTabs({ userId, username }: ProfileTabsProps) {
  const t = useTranslations("profile");
  const [activeTab, setActiveTab] = useState<TabKey>("showcases");

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = useMemo(
    () => [
      { key: "showcases", label: t("tabs.showcases"), icon: ImageIcon },
      { key: "reviews", label: t("tabs.reviews"), icon: Star },
      { key: "discussions", label: t("tabs.discussions"), icon: MessageSquare },
      { key: "qa", label: t("tabs.qa"), icon: HelpCircle },
    ],
    [t],
  );

  return (
    <div className="w-full">
      {/* ================================================================= */}
      {/* Tab Navigation                                                    */}
      {/* ================================================================= */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
        <nav
          className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px"
          role="tablist"
          aria-label={t("tabs.navigation")}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                onClick={() => setActiveTab(tab.key)}
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.key}`}
                className={`
                  relative inline-flex items-center gap-2 px-5 py-3 text-sm font-medium
                  whitespace-nowrap transition-colors
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]/40
                  ${
                    isActive
                      ? "text-[#1E4DB7] dark:text-blue-400"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="profile-tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-indigo-500"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================================================================= */}
      {/* Tab Content                                                       */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
        >
          {activeTab === "showcases" && (
            <ShowcasesTab userId={userId} t={t} />
          )}
          {activeTab === "reviews" && (
            <ReviewsTab userId={userId} t={t} />
          )}
          {activeTab === "discussions" && (
            <DiscussionsTab userId={userId} t={t} />
          )}
          {activeTab === "qa" && <QATab userId={userId} t={t} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default ProfileTabs;
