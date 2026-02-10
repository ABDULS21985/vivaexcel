"use client";

// =============================================================================
// Search Intent Badge
// =============================================================================
// Displays detected AI search intent as a row of small, color-coded pills.
// Renders badges for detected product type, price range, sort preference,
// features, and "Did you mean" corrections.

import { motion } from "framer-motion";
import {
  Sparkles,
  Filter,
  DollarSign,
  Star,
  TrendingUp,
  Tag,
} from "lucide-react";
import { cn } from "@ktblog/ui/components";
import type { SearchIntent } from "./types";

// =============================================================================
// Types
// =============================================================================

interface SearchIntentBadgeProps {
  intent: SearchIntent;
  /** Callback when "Did you mean" link is clicked */
  onCorrection?: (correctedQuery: string) => void;
  className?: string;
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const pillVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 400, damping: 25 },
  },
};

// =============================================================================
// Sub-component: Intent Pill
// =============================================================================

function IntentPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <motion.span
      variants={pillVariants}
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-2.5 py-1 rounded-full",
        "text-xs font-medium",
        "bg-[#1E4DB7]/10 text-[#1E4DB7]",
        "dark:bg-[#1E4DB7]/20 dark:text-blue-300",
        "border border-[#1E4DB7]/15 dark:border-[#1E4DB7]/25",
      )}
    >
      <Icon size={12} className="shrink-0" aria-hidden="true" />
      {label}
    </motion.span>
  );
}

// =============================================================================
// Component
// =============================================================================

export function SearchIntentBadge({
  intent,
  onCorrection,
  className,
}: SearchIntentBadgeProps) {
  const pills: Array<{
    key: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
  }> = [];

  // AI-detected natural language query
  if (intent.isNaturalLanguage) {
    pills.push({ key: "ai", icon: Sparkles, label: "AI Search" });
  }

  // Detected product type
  if (intent.productType) {
    pills.push({ key: "type", icon: Tag, label: intent.productType });
  }

  // Detected category
  if (intent.category) {
    pills.push({ key: "category", icon: Filter, label: intent.category });
  }

  // Detected price range
  if (intent.priceRange) {
    const { min, max } = intent.priceRange;
    let priceLabel = "";
    if (min !== undefined && max !== undefined) {
      priceLabel = `$${min} - $${max}`;
    } else if (min !== undefined) {
      priceLabel = `From $${min}`;
    } else if (max !== undefined) {
      priceLabel = `Up to $${max}`;
    }
    if (priceLabel) {
      pills.push({ key: "price", icon: DollarSign, label: priceLabel });
    }
  }

  // Detected sort preference
  if (intent.sortPreference) {
    const sortLabels: Record<string, string> = {
      rating: "Highest Rated",
      price_asc: "Lowest Price",
      price_desc: "Highest Price",
      newest: "Newest First",
      popular: "Most Popular",
      relevance: "Most Relevant",
    };
    const sortLabel =
      sortLabels[intent.sortPreference] || intent.sortPreference;
    pills.push({ key: "sort", icon: TrendingUp, label: sortLabel });
  }

  // Detected features
  if (intent.features && intent.features.length > 0) {
    intent.features.slice(0, 3).forEach((feature, idx) => {
      pills.push({ key: `feature-${idx}`, icon: Star, label: feature });
    });
  }

  // Nothing to render
  if (pills.length === 0 && !intent.correctedQuery) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Intent pills row */}
      {pills.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap items-center gap-2"
          role="status"
          aria-label="Detected search intent"
        >
          {pills.map((pill) => (
            <IntentPill key={pill.key} icon={pill.icon} label={pill.label} />
          ))}
        </motion.div>
      )}

      {/* Did you mean correction */}
      {intent.correctedQuery && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-sm text-slate-600 dark:text-slate-400"
        >
          Did you mean{" "}
          <button
            type="button"
            onClick={() => onCorrection?.(intent.correctedQuery!)}
            className={cn(
              "font-medium underline decoration-dotted underline-offset-2",
              "text-[#1E4DB7] dark:text-blue-400",
              "hover:text-[#143A8F] dark:hover:text-blue-300",
              "outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7] rounded-sm",
              "transition-colors duration-150",
            )}
          >
            &ldquo;{intent.correctedQuery}&rdquo;
          </button>
          ?
        </motion.p>
      )}
    </div>
  );
}
