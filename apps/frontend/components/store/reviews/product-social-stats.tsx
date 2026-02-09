"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "framer-motion";
import {
  Star,
  Users,
  Download,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

// =============================================================================
// Types
// =============================================================================

interface ProductSocialStatsProps {
  averageRating: number;
  totalReviews: number;
  downloadCount: number;
  variant?: "compact" | "expanded";
  isTrending?: boolean;
}

// =============================================================================
// Helpers
// =============================================================================

function formatCount(n: number): string {
  if (n >= 10000) {
    return `${Math.floor(n / 1000)}K`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    const rounded = Math.floor(k * 10) / 10;
    return rounded % 1 === 0 ? `${Math.floor(k)}K` : `${rounded}K`;
  }
  return n.toString();
}

// =============================================================================
// Animated Counter Hook
// =============================================================================

function useAnimatedCounter(
  target: number,
  shouldAnimate: boolean,
  duration: number = 1200,
) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [target, duration]);

  useEffect(() => {
    if (shouldAnimate && target > 0) {
      animate();
    }
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [shouldAnimate, target, animate]);

  return value;
}

// =============================================================================
// Compact Variant
// =============================================================================

function CompactStats({
  averageRating,
  totalReviews,
  downloadCount,
  isTrending,
  t,
}: Omit<ProductSocialStatsProps, "variant"> & { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400">
      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
        {averageRating.toFixed(1)}
      </span>
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
      <span className="text-neutral-400 dark:text-neutral-500">
        ({totalReviews})
      </span>
      <span className="text-neutral-300 dark:text-neutral-600">&middot;</span>
      <span>{t("socialStats.downloads", { count: formatCount(downloadCount) })}</span>

      {isTrending && (
        <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-[#F59A23]/10 px-1.5 py-0.5 text-[10px] font-semibold text-[#F59A23]">
          <TrendingUp className="h-3 w-3" aria-hidden="true" />
          {t("socialStats.trending")}
        </span>
      )}
    </div>
  );
}

// =============================================================================
// Stat Block (Expanded)
// =============================================================================

function StatBlock({
  icon: Icon,
  value,
  label,
  formatted,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  formatted?: string;
}) {
  return (
    <div className="group flex flex-col items-center gap-1 px-4 py-2 transition-transform duration-200 hover:scale-105 cursor-default">
      <Icon className="h-5 w-5 text-neutral-400 dark:text-neutral-500 mb-0.5" aria-hidden="true" />
      <span className="text-lg font-bold text-neutral-800 dark:text-neutral-100 tabular-nums">
        {formatted ?? value}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {label}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <div className="h-10 w-px bg-neutral-200 dark:bg-neutral-700 self-center" />
  );
}

// =============================================================================
// Expanded Variant
// =============================================================================

function ExpandedStats({
  averageRating,
  totalReviews,
  downloadCount,
  isTrending,
  t,
}: Omit<ProductSocialStatsProps, "variant"> & { t: ReturnType<typeof useTranslations> }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const animatedReviews = useAnimatedCounter(totalReviews, isInView);
  const animatedDownloads = useAnimatedCounter(downloadCount, isInView);

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-center justify-center gap-2 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-3 px-2"
    >
      <StatBlock
        icon={Star}
        value={averageRating}
        label={t("rating.label")}
        formatted={isInView ? averageRating.toFixed(1) : "0.0"}
      />
      <Divider />
      <StatBlock
        icon={Users}
        value={animatedReviews}
        label={t("socialStats.reviewsLabel")}
        formatted={formatCount(animatedReviews)}
      />
      <Divider />
      <StatBlock
        icon={Download}
        value={animatedDownloads}
        label={t("socialStats.downloadsLabel")}
        formatted={formatCount(animatedDownloads)}
      />

      {isTrending && (
        <>
          <Divider />
          <div className="group flex flex-col items-center gap-1 px-4 py-2 transition-transform duration-200 hover:scale-105 cursor-default">
            <TrendingUp className="h-5 w-5 text-[#F59A23] mb-0.5" aria-hidden="true" />
            <span className="text-lg font-bold text-[#F59A23]">
              🔥
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#F59A23]">
              {t("socialStats.trending")}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ProductSocialStats({
  averageRating,
  totalReviews,
  downloadCount,
  variant = "compact",
  isTrending = false,
}: ProductSocialStatsProps) {
  const t = useTranslations("reviews");

  if (variant === "compact") {
    return (
      <CompactStats
        averageRating={averageRating}
        totalReviews={totalReviews}
        downloadCount={downloadCount}
        isTrending={isTrending}
        t={t}
      />
    );
  }

  return (
    <ExpandedStats
      averageRating={averageRating}
      totalReviews={totalReviews}
      downloadCount={downloadCount}
      isTrending={isTrending}
      t={t}
    />
  );
}

export default ProductSocialStats;
