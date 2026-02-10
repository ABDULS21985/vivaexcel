"use client";

import dynamic from "next/dynamic";
import { DashboardHero } from "./_components/dashboard-hero";
import { StatsRow } from "./_components/stats-row";

// =============================================================================
// Member Dashboard — Overview Page
// =============================================================================
// Orchestrates all dashboard sections. Critical sections (Hero, Stats) load
// eagerly; secondary sections are dynamically imported for performance.

const GamificationHub = dynamic(
  () =>
    import("./_components/gamification-hub").then((m) => ({
      default: m.GamificationHub,
    })),
  {
    loading: () => <SectionSkeleton height="h-96" />,
  }
);

const ReadingAnalytics = dynamic(
  () =>
    import("./_components/reading-analytics").then((m) => ({
      default: m.ReadingAnalytics,
    })),
  {
    loading: () => <SectionSkeleton height="h-56" />,
  }
);

const ReadingHistoryList = dynamic(
  () =>
    import("./_components/reading-history-list").then((m) => ({
      default: m.ReadingHistoryList,
    })),
  {
    loading: () => <SectionSkeleton height="h-64" />,
  }
);

const BookmarksSection = dynamic(
  () =>
    import("./_components/bookmarks-section").then((m) => ({
      default: m.BookmarksSection,
    })),
  {
    loading: () => <SectionSkeleton height="h-48" />,
  }
);

const SubscriptionCard = dynamic(
  () =>
    import("./_components/subscription-card").then((m) => ({
      default: m.SubscriptionCard,
    })),
  {
    loading: () => <SectionSkeleton height="h-32" />,
  }
);

const RecommendationsSection = dynamic(
  () =>
    import("./_components/recommendations").then((m) => ({
      default: m.RecommendationsSection,
    })),
  {
    loading: () => <SectionSkeleton height="h-48" />,
  }
);

const QuickActions = dynamic(
  () =>
    import("./_components/quick-actions").then((m) => ({
      default: m.QuickActions,
    })),
  {
    loading: () => <SectionSkeleton height="h-40" />,
  }
);

const ActivityFeed = dynamic(
  () =>
    import("./_components/activity-feed").then((m) => ({
      default: m.ActivityFeed,
    })),
  {
    loading: () => <SectionSkeleton height="h-64" />,
  }
);

function SectionSkeleton({ height = "h-48" }: { height?: string }) {
  return (
    <div
      className={`${height} w-full rounded-xl bg-[var(--surface-1)] animate-pulse mb-8`}
    />
  );
}

export default function DashboardPage() {
  return (
    <div>
      {/* 1. Welcome Hero */}
      <DashboardHero />

      {/* 2. Enhanced Stats Row */}
      <StatsRow />

      {/* 3. Gamification Hub */}
      <GamificationHub />

      {/* 4. Reading Analytics */}
      <ReadingAnalytics />

      {/* 5. Recent Reading History */}
      <ReadingHistoryList />

      {/* 6. Bookmarks */}
      <BookmarksSection />

      {/* 7. Subscription & Plan */}
      <SubscriptionCard />

      {/* 8. Recommended For You */}
      <RecommendationsSection />

      {/* 9. Quick Actions */}
      <QuickActions />

      {/* 10. Activity Feed */}
      <ActivityFeed />
    </div>
  );
}
