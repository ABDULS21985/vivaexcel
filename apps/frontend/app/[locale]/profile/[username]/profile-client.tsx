"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api-client";
import { Link } from "@/i18n/routing";
import { ProfileHeader } from "@/components/community/profile-header";
import { UserStats } from "@/components/community/user-stats";
import { ProfileTabs } from "@/components/community/profile-tabs";

// =============================================================================
// Types
// =============================================================================

interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PublicProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  coverImageUrl?: string;
  isCreator?: boolean;
  specialties?: string[];
  createdAt: string;
  stats: {
    showcaseCount: number;
    reviewCount: number;
    threadCount: number;
    replyCount: number;
    questionCount: number;
    answerCount: number;
  };
  gamification?: {
    level: number;
    currentXP: number;
    nextLevelXP: number;
  };
}

// =============================================================================
// Skeleton
// =============================================================================

function ProfileSkeleton() {
  return (
    <div className="w-full animate-pulse">
      {/* Cover skeleton */}
      <div className="h-[300px] rounded-t-2xl bg-neutral-200 dark:bg-neutral-800" />

      <div className="px-5 md:px-8 pb-6">
        {/* Avatar skeleton */}
        <div className="relative -mt-12 mb-4">
          <div className="w-24 h-24 rounded-full bg-neutral-300 dark:bg-neutral-700 ring-4 ring-white dark:ring-neutral-900" />
        </div>

        {/* Name skeleton */}
        <div className="mb-3 space-y-2">
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>

        {/* Bio skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full max-w-xl bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-3 w-3/4 max-w-md bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>

        {/* Meta skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl bg-neutral-100 dark:bg-neutral-800"
            >
              <div className="w-5 h-5 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="w-10 h-7 bg-neutral-200 dark:bg-neutral-700 rounded" />
              <div className="w-16 h-3 bg-neutral-200 dark:bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mt-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-5 md:p-8">
        <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-neutral-200 dark:bg-neutral-700 rounded"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 bg-neutral-200 dark:bg-neutral-700 rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Not Found State
// =============================================================================

function ProfileNotFound({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-24 px-6"
    >
      <div className="mb-6 p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60">
        <UserX className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
      </div>
      <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
        {t("notFound")}
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-6">
        {t("notFoundDescription")}
      </p>
      <Link
        href="/"
        className="
          inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg
          bg-[#1E4DB7] hover:bg-[#143A8F] text-white
          transition-colors focus:outline-none focus-visible:ring-2
          focus-visible:ring-[#1E4DB7]/40 focus-visible:ring-offset-1
        "
      >
        {t("backHome")}
      </Link>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

interface ProfileClientProps {
  username: string;
}

export function ProfileClient({ username }: ProfileClientProps) {
  const t = useTranslations("profile");

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user-profile", username],
    queryFn: () =>
      apiGet<ApiResponseWrapper<PublicProfile>>(
        `/users/profile/${username}`,
      ).then((res) => res.data),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      // Don't retry 404s
      if (
        error &&
        "status" in error &&
        (error as { status: number }).status === 404
      ) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <ProfileSkeleton />
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Not Found / Error
  // ---------------------------------------------------------------------------

  if (isError || !profile) {
    return (
      <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="container mx-auto px-4 max-w-5xl">
          <ProfileNotFound t={t} />
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Mapped stats for the UserStats component
  // ---------------------------------------------------------------------------

  const mappedStats = {
    showcases: profile.stats.showcaseCount,
    reviews: profile.stats.reviewCount,
    threads: profile.stats.threadCount + profile.stats.replyCount,
    answers: profile.stats.answerCount,
  };

  // ---------------------------------------------------------------------------
  // Profile
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="container mx-auto max-w-5xl px-4 py-6">
        {/* Profile Header with cover, avatar, bio, gamification */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm overflow-hidden">
          <ProfileHeader profile={profile} />
        </div>

        {/* Stats Section */}
        <div className="mt-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-5 md:p-8">
          <UserStats stats={mappedStats} />
        </div>

        {/* Tabbed Content */}
        <div className="mt-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/70 dark:border-neutral-800 shadow-sm p-5 md:p-8">
          <ProfileTabs userId={profile.id} username={username} />
        </div>
      </div>
    </main>
  );
}

export default ProfileClient;
