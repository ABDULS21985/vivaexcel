"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Crown, Star, Gift, ChevronRight } from "lucide-react";

// =============================================================================
// Types
// =============================================================================

interface Tier {
  name: string;
  color: string;
  iconUrl?: string;
}

interface NextTier extends Tier {
  minimumSpend: number;
  perks: Record<string, any>;
}

interface LoyaltyProgressBarProps {
  currentTier: Tier;
  nextTier?: NextTier;
  currentSpend: number;
  className?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getTierIcon(tierName: string): React.ReactNode {
  const lowerName = tierName.toLowerCase();
  if (lowerName.includes("platinum") || lowerName.includes("diamond")) {
    return <Crown className="h-4 w-4" />;
  }
  if (lowerName.includes("gold")) {
    return <Star className="h-4 w-4" />;
  }
  if (lowerName.includes("silver")) {
    return <Star className="h-4 w-4" />;
  }
  return <Gift className="h-4 w-4" />;
}

function getPerkLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function formatPerkValue(value: any): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (value < 1) return `${Math.round(value * 100)}%`;
    return value.toString();
  }
  return String(value);
}

// =============================================================================
// Animation Variants
// =============================================================================

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 15,
    },
  },
};

// =============================================================================
// Component
// =============================================================================

export function LoyaltyProgressBar({
  currentTier,
  nextTier,
  currentSpend,
  className = "",
}: LoyaltyProgressBarProps) {
  const progressPercent = useMemo(() => {
    if (!nextTier) return 100;
    if (nextTier.minimumSpend <= 0) return 100;
    return Math.min(
      100,
      Math.round((currentSpend / nextTier.minimumSpend) * 100),
    );
  }, [currentSpend, nextTier]);

  const amountRemaining = useMemo(() => {
    if (!nextTier) return 0;
    return Math.max(0, nextTier.minimumSpend - currentSpend);
  }, [currentSpend, nextTier]);

  const perkEntries = useMemo(() => {
    if (!nextTier?.perks) return [];
    return Object.entries(nextTier.perks).slice(0, 4);
  }, [nextTier]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 p-5 md:p-6 ${className}`}
    >
      {/* Current Tier Header */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-3">
          {/* Tier Icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${currentTier.color}20` }}
          >
            {currentTier.iconUrl ? (
              <Image
                src={currentTier.iconUrl}
                alt={currentTier.name}
                width={20}
                height={20}
                className="object-contain"
              />
            ) : (
              <span style={{ color: currentTier.color }}>
                {getTierIcon(currentTier.name)}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Current Tier
            </p>
            <p
              className="text-base font-bold"
              style={{ color: currentTier.color }}
            >
              {currentTier.name}
            </p>
          </div>
        </div>

        {/* Current Spend */}
        <div className="text-right">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Total spent
          </p>
          <p className="text-base font-bold text-neutral-900 dark:text-white tabular-nums">
            {formatCurrency(currentSpend)}
          </p>
        </div>
      </motion.div>

      {/* Progress Section */}
      {nextTier && (
        <>
          {/* Progress Bar */}
          <motion.div variants={itemVariants} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Progress to{" "}
                <span style={{ color: nextTier.color }} className="font-bold">
                  {nextTier.name}
                </span>
              </span>
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">
                {progressPercent}%
              </span>
            </div>

            <div className="relative h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${currentTier.color}, ${nextTier.color})`,
                }}
              />
              {/* Shimmer effect */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut",
                }}
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{ maxWidth: `${progressPercent}%` }}
              />
            </div>

            {/* Spend Status */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                {formatCurrency(currentSpend)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                {formatCurrency(nextTier.minimumSpend)}
              </span>
            </div>
          </motion.div>

          {/* Amount Remaining */}
          {amountRemaining > 0 && (
            <motion.div
              variants={itemVariants}
              className="p-3 rounded-xl mb-4"
              style={{ backgroundColor: `${nextTier.color}10` }}
            >
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                Spend{" "}
                <span
                  className="font-bold"
                  style={{ color: nextTier.color }}
                >
                  {formatCurrency(amountRemaining)}
                </span>{" "}
                more to reach{" "}
                <span
                  className="font-bold"
                  style={{ color: nextTier.color }}
                >
                  {nextTier.name}
                </span>
              </p>
            </motion.div>
          )}

          {/* Next Tier Perks Preview */}
          {perkEntries.length > 0 && (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-2 mb-3">
                <ChevronRight
                  className="h-4 w-4"
                  style={{ color: nextTier.color }}
                />
                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {nextTier.name} Perks
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {perkEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center gap-2 p-2.5 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: nextTier.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider truncate">
                        {getPerkLabel(key)}
                      </p>
                      <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {formatPerkValue(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}

      {/* Max Tier State */}
      {!nextTier && (
        <motion.div
          variants={itemVariants}
          className="text-center p-4 rounded-xl"
          style={{ backgroundColor: `${currentTier.color}10` }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: currentTier.color }}
          >
            You have reached the highest tier!
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Enjoy all the exclusive perks of your membership.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default LoyaltyProgressBar;
