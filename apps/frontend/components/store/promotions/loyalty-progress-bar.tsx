"use client";

import { motion } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

export interface LoyaltyTier {
  id: string;
  name: string;
  requiredSpend: number;
  discountPercent: number;
  color: string;
  icon?: string;
  benefits?: string[];
}

interface LoyaltyProgressBarProps {
  currentSpend: number;
  currentTier: LoyaltyTier;
  nextTier?: LoyaltyTier | null;
  tiers: LoyaltyTier[];
  currency?: string;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// =============================================================================
// Component
// =============================================================================

export function LoyaltyProgressBar({
  currentSpend,
  currentTier,
  nextTier,
  tiers,
  currency = "USD",
  className = "",
}: LoyaltyProgressBarProps) {
  // Calculate progress to next tier
  const progressPercent = nextTier
    ? Math.min(
        100,
        ((currentSpend - currentTier.requiredSpend) /
          (nextTier.requiredSpend - currentTier.requiredSpend)) *
          100,
      )
    : 100;

  const amountToNext = nextTier
    ? Math.max(0, nextTier.requiredSpend - currentSpend)
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current tier + Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${currentTier.color}20` }}
          >
            <Crown className="h-4 w-4" style={{ color: currentTier.color }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
              {currentTier.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {currentTier.discountPercent}% member discount
            </p>
          </div>
        </div>

        {nextTier && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <ArrowRight className="h-3 w-3" />
            <span className="font-medium" style={{ color: nextTier.color }}>
              {nextTier.name}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: nextTier
                ? `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`
                : currentTier.color,
            }}
          />
        </div>

        {/* Tier markers */}
        <div className="relative mt-1">
          {tiers.map((tier) => {
            const maxSpend = tiers[tiers.length - 1]?.requiredSpend ?? 1;
            const position = Math.min(
              100,
              (tier.requiredSpend / maxSpend) * 100,
            );
            return (
              <div
                key={tier.id}
                className="absolute top-0 -translate-x-1/2"
                style={{ left: `${position}%` }}
              >
                <div
                  className="w-2 h-2 rounded-full border-2 border-white dark:border-neutral-900"
                  style={{
                    backgroundColor:
                      currentSpend >= tier.requiredSpend
                        ? tier.color
                        : "#d4d4d4",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Spending info */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-neutral-500 dark:text-neutral-400">
          Spent: <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formatPrice(currentSpend, currency)}</span>
        </span>
        {nextTier ? (
          <span className="text-neutral-500 dark:text-neutral-400">
            <span className="font-semibold" style={{ color: nextTier.color }}>
              {formatPrice(amountToNext, currency)}
            </span>{" "}
            to {nextTier.name}
          </span>
        ) : (
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Top tier reached!
          </span>
        )}
      </div>
    </div>
  );
}

export default LoyaltyProgressBar;
