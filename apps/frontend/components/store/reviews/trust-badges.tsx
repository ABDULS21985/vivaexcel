"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Lock,
  Download,
  ShieldCheck,
  BadgeCheck,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

// =============================================================================
// Types
// =============================================================================

interface TrustBadge {
  icon: LucideIcon;
  label: string;
  tooltip: string;
}

interface TrustBadgesProps {
  variant?: "inline" | "grid" | "compact";
}

// =============================================================================
// Data
// =============================================================================

// TRUST_BADGES is now built inside the component to use translations

// =============================================================================
// Badge Item (shared across variants)
// =============================================================================

function BadgeTooltip({ text }: { text: string }) {
  return (
    <span
      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2
        whitespace-nowrap rounded-md bg-neutral-900 dark:bg-neutral-100
        px-2.5 py-1.5 text-[11px] font-medium leading-none
        text-white dark:text-neutral-900 opacity-0 group-hover/badge:opacity-100
        transition-opacity duration-200 z-50
        after:absolute after:top-full after:left-1/2 after:-translate-x-1/2
        after:border-4 after:border-transparent after:border-t-neutral-900
        dark:after:border-t-neutral-100"
    >
      {text}
    </span>
  );
}

// =============================================================================
// Inline Variant
// =============================================================================

function InlineBadge({
  badge,
  index,
}: {
  badge: TrustBadge;
  index: number;
}) {
  const Icon = badge.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
      className="group/badge relative flex items-center gap-1.5 px-2 py-1 cursor-default"
    >
      <BadgeTooltip text={badge.tooltip} />
      <Icon className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-500 transition-colors duration-200 group-hover/badge:text-[#1E4DB7]" aria-hidden="true" />
      <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-500 whitespace-nowrap">
        {badge.label}
      </span>
    </motion.div>
  );
}

// =============================================================================
// Grid Variant
// =============================================================================

function GridBadge({
  badge,
  index,
}: {
  badge: TrustBadge;
  index: number;
}) {
  const Icon = badge.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
      className="group/badge relative flex items-center gap-3 rounded-xl border border-neutral-100
        dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 cursor-default"
    >
      <BadgeTooltip text={badge.tooltip} />
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 transition-colors duration-200 group-hover/badge:bg-blue-50 dark:group-hover/badge:bg-blue-950/30">
        <Icon className="h-4.5 w-4.5 text-neutral-500 dark:text-neutral-500 transition-colors duration-200 group-hover/badge:text-[#1E4DB7]" aria-hidden="true" />
      </div>
      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-400">
        {badge.label}
      </span>
    </motion.div>
  );
}

// =============================================================================
// Compact Variant
// =============================================================================

function CompactBadge({
  badge,
  index,
}: {
  badge: TrustBadge;
  index: number;
}) {
  const Icon = badge.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: "easeOut" }}
      className="group/badge relative flex items-center justify-center cursor-default p-1.5"
    >
      <BadgeTooltip text={badge.tooltip} />
      <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-500 transition-colors duration-200 group-hover/badge:text-[#1E4DB7]" aria-hidden="true" />
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function TrustBadges({ variant = "inline" }: TrustBadgesProps) {
  const t = useTranslations("store");
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  const TRUST_BADGES: TrustBadge[] = [
    { icon: Lock, label: t("trust.securePayment"), tooltip: t("trust.securePaymentDesc") },
    { icon: Download, label: t("trust.instantDownload"), tooltip: t("trust.instantDownloadDesc") },
    { icon: ShieldCheck, label: t("trust.moneyBack"), tooltip: t("trust.moneyBackDesc") },
    { icon: BadgeCheck, label: t("trust.verifiedReviews"), tooltip: t("trust.verifiedReviewsDesc") },
    { icon: Headphones, label: t("trust.support"), tooltip: t("trust.supportDesc") },
  ];

  if (variant === "inline") {
    return (
      <div ref={containerRef} className="flex flex-wrap items-center gap-1">
        {isInView &&
          TRUST_BADGES.map((badge, i) => (
            <InlineBadge key={badge.label} badge={badge} index={i} />
          ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div
        ref={containerRef}
        className="grid grid-cols-2 lg:grid-cols-3 gap-3"
      >
        {isInView &&
          TRUST_BADGES.map((badge, i) => (
            <GridBadge key={badge.label} badge={badge} index={i} />
          ))}
      </div>
    );
  }

  // compact
  return (
    <div ref={containerRef} className="flex items-center gap-1">
      {isInView &&
        TRUST_BADGES.map((badge, i) => (
          <CompactBadge key={badge.label} badge={badge} index={i} />
        ))}
    </div>
  );
}

export default TrustBadges;
