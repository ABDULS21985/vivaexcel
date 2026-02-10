"use client";

// =============================================================================
// Trending Badge
// =============================================================================
// A small animated badge component that displays product badges such as
// "trending", "bestseller", "new", and "hot". Each badge type has a distinct
// colour from the design system.

import { motion } from "framer-motion";
import { TrendingUp, Award, Sparkles, Flame } from "lucide-react";
import type { ProductBadge } from "@/types/analytics";

// =============================================================================
// Config
// =============================================================================

const BADGE_CONFIG: Record<
  ProductBadge,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  trending: {
    label: "Trending",
    bg: "bg-[#F59A23]/15 dark:bg-[#F59A23]/20",
    text: "text-[#F59A23]",
    icon: TrendingUp,
  },
  bestseller: {
    label: "Bestseller",
    bg: "bg-[#E86A1D]/15 dark:bg-[#E86A1D]/20",
    text: "text-[#E86A1D]",
    icon: Award,
  },
  new: {
    label: "New",
    bg: "bg-[#1E4DB7]/15 dark:bg-[#1E4DB7]/20",
    text: "text-[#1E4DB7] dark:text-blue-400",
    icon: Sparkles,
  },
  hot: {
    label: "Hot",
    bg: "bg-red-500/15 dark:bg-red-500/20",
    text: "text-red-500",
    icon: Flame,
  },
};

// =============================================================================
// Types
// =============================================================================

interface TrendingBadgeProps {
  badge: ProductBadge;
  size?: "sm" | "md";
  className?: string;
}

// =============================================================================
// Animation
// =============================================================================

const badgeVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

// =============================================================================
// Component
// =============================================================================

export function TrendingBadge({
  badge,
  size = "sm",
  className = "",
}: TrendingBadgeProps) {
  const config = BADGE_CONFIG[badge];
  if (!config) return null;

  const Icon = config.icon;
  const isSmall = size === "sm";

  return (
    <motion.span
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      className={[
        "inline-flex items-center gap-1 rounded-full font-semibold",
        config.bg,
        config.text,
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      ].join(" ")}
    >
      <Icon
        className={isSmall ? "h-2.5 w-2.5" : "h-3 w-3"}
        aria-hidden="true"
      />
      {config.label}
    </motion.span>
  );
}

export default TrendingBadge;
