"use client";

import { Flame, Trophy, Sparkles, Zap } from "lucide-react";
import type { ProductBadge as ProductBadgeType } from "@/types/analytics";

// =============================================================================
// Types
// =============================================================================

interface ProductBadgeProps {
  badge: ProductBadgeType;
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

const BADGE_CONFIG: Record<
  ProductBadgeType,
  {
    icon: typeof Flame;
    label: string;
    bg: string;
    text: string;
  }
> = {
  trending: {
    icon: Flame,
    label: "Trending",
    bg: "bg-orange-500/15 dark:bg-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
  },
  bestseller: {
    icon: Trophy,
    label: "Bestseller",
    bg: "bg-amber-500/15 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  new: {
    icon: Sparkles,
    label: "New",
    bg: "bg-blue-500/15 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  hot: {
    icon: Zap,
    label: "Hot",
    bg: "bg-red-500/15 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
  },
};

// =============================================================================
// Component
// =============================================================================

export function ProductBadge({ badge, className = "" }: ProductBadgeProps) {
  const config = BADGE_CONFIG[badge];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

export default ProductBadge;
