"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface ReviewHighlightsProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
}

// =============================================================================
// Helpers
// =============================================================================

function getSummaryText(averageRating: number): string {
  if (averageRating >= 4.5) {
    return "Customers consistently praise this product for its quality and value. The overwhelming majority of buyers report a positive experience.";
  }
  if (averageRating >= 3.5) {
    return "Most customers are satisfied with this product. Positive feedback highlights good quality, while some suggest minor improvements.";
  }
  if (averageRating >= 2.5) {
    return "Customer opinions are mixed. While some appreciate certain aspects, others have noted areas for improvement.";
  }
  return "This product has received mixed feedback. Consider reading individual reviews for specific details.";
}

const PLACEHOLDER_PROS = [
  { label: "Easy to use", count: 45 },
  { label: "Great design", count: 38 },
  { label: "Good value", count: 32 },
];

const PLACEHOLDER_CONS = [
  { label: "Limited customization", count: 8 },
  { label: "Font choices", count: 5 },
  { label: "Documentation", count: 3 },
];

// =============================================================================
// Sub-components
// =============================================================================

function Pill({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "pro" | "con";
}) {
  const isPro = variant === "pro";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isPro
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
      }`}
    >
      {label}
      <span
        className={`text-[10px] ${
          isPro
            ? "text-emerald-500 dark:text-emerald-500"
            : "text-red-500 dark:text-red-500"
        }`}
      >
        ({count})
      </span>
    </span>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ReviewHighlights({
  productId: _productId,
  averageRating,
  totalReviews,
}: ReviewHighlightsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  // Only show when there are enough reviews
  if (totalReviews < 5) {
    return null;
  }

  const summaryText = getSummaryText(averageRating);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative rounded-xl p-[1px] bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]"
    >
      <div className="rounded-[11px] bg-white dark:bg-neutral-900 p-5">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-[#F59A23]" aria-hidden="true" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
            Review Highlights
          </h3>
          <span className="ml-auto rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
            AI-generated summary
          </span>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 mb-4">
          {summaryText}
        </p>

        {/* Pros */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Top Mentioned Pros
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDER_PROS.map((item) => (
              <Pill
                key={item.label}
                label={item.label}
                count={item.count}
                variant="pro"
              />
            ))}
          </div>
        </div>

        {/* Cons */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Top Mentioned Cons
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PLACEHOLDER_CONS.map((item) => (
              <Pill
                key={item.label}
                label={item.label}
                count={item.count}
                variant="con"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ReviewHighlights;
