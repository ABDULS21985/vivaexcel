"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// =============================================================================
// Types
// =============================================================================

interface FlashSaleCountdownProps {
  endsAt: string;
  size?: "sm" | "md" | "lg";
  onExpired?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

// =============================================================================
// Helpers
// =============================================================================

function calculateTimeRemaining(endsAt: string): TimeRemaining {
  const now = new Date().getTime();
  const end = new Date(endsAt).getTime();
  const totalMs = Math.max(0, end - now);

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, totalMs };
}

function padTwo(n: number): string {
  return n.toString().padStart(2, "0");
}

function getColorClass(totalMs: number): string {
  const oneMinute = 60 * 1000;
  const tenMinutes = 10 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  if (totalMs <= oneMinute) return "text-red-500 dark:text-red-400";
  if (totalMs <= tenMinutes) return "text-red-500 dark:text-red-400";
  if (totalMs <= oneHour) return "text-amber-500 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function getBgClass(totalMs: number): string {
  const oneMinute = 60 * 1000;
  const tenMinutes = 10 * 60 * 1000;
  const oneHour = 60 * 60 * 1000;

  if (totalMs <= oneMinute)
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  if (totalMs <= tenMinutes)
    return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
  if (totalMs <= oneHour)
    return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800";
  return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800";
}

// =============================================================================
// Size Configs
// =============================================================================

const sizeConfig = {
  sm: {
    container: "gap-1.5",
    digit: "text-sm font-bold min-w-[28px] py-0.5 px-1",
    label: "text-[8px]",
    separator: "text-sm",
  },
  md: {
    container: "gap-2",
    digit: "text-lg font-bold min-w-[36px] py-1 px-1.5",
    label: "text-[10px]",
    separator: "text-lg",
  },
  lg: {
    container: "gap-3",
    digit: "text-2xl md:text-3xl font-bold min-w-[48px] py-2 px-2",
    label: "text-xs",
    separator: "text-2xl md:text-3xl",
  },
};

// =============================================================================
// Component
// =============================================================================

export function FlashSaleCountdown({
  endsAt,
  size = "md",
  onExpired,
}: FlashSaleCountdownProps) {
  const [time, setTime] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(endsAt),
  );
  const [hasExpired, setHasExpired] = useState(false);

  const handleExpiry = useCallback(() => {
    if (!hasExpired) {
      setHasExpired(true);
      onExpired?.();
    }
  }, [hasExpired, onExpired]);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(endsAt);
      setTime(remaining);

      if (remaining.totalMs <= 0) {
        clearInterval(interval);
        handleExpiry();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt, handleExpiry]);

  const config = sizeConfig[size];
  const colorClass = getColorClass(time.totalMs);
  const bgClass = getBgClass(time.totalMs);
  const isUrgent = time.totalMs > 0 && time.totalMs <= 60 * 1000;

  const segments = [
    { value: padTwo(time.days), label: "Days" },
    { value: padTwo(time.hours), label: "Hrs" },
    { value: padTwo(time.minutes), label: "Min" },
    { value: padTwo(time.seconds), label: "Sec" },
  ];

  if (time.totalMs <= 0) {
    return (
      <div className={`flex items-center ${config.container}`}>
        <span
          className={`${config.digit} ${colorClass} text-center rounded-lg border ${bgClass}`}
        >
          Expired
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${config.container}`}>
      {segments.map((segment, i) => (
        <div key={segment.label} className="flex items-center gap-1.5">
          <motion.div
            className="flex flex-col items-center"
            animate={isUrgent ? { scale: [1, 1.05, 1] } : undefined}
            transition={
              isUrgent
                ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
                : undefined
            }
          >
            <span
              className={`${config.digit} ${colorClass} text-center rounded-lg border ${bgClass} tabular-nums`}
            >
              {segment.value}
            </span>
            <span
              className={`${config.label} font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mt-0.5`}
            >
              {segment.label}
            </span>
          </motion.div>
          {i < segments.length - 1 && (
            <span
              className={`${config.separator} ${colorClass} font-bold self-start mt-0.5`}
            >
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export default FlashSaleCountdown;
