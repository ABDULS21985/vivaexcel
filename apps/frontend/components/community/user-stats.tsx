"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  ImageIcon,
  Star,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";

// =============================================================================
// Types
// =============================================================================

interface UserStatsProps {
  stats: {
    showcases: number;
    reviews: number;
    threads: number;
    answers: number;
  };
}

// =============================================================================
// Animated Counter Hook
// =============================================================================

function useAnimatedCounter(
  target: number,
  duration: number = 1200,
  isInView: boolean,
) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    if (target === 0) {
      setCount(0);
      hasAnimated.current = true;
      return;
    }

    hasAnimated.current = true;
    const startTime = performance.now();
    let rafId: number;

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a natural deceleration feel
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easedProgress * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, isInView]);

  return count;
}

// =============================================================================
// Animated Stat Card
// =============================================================================

function AnimatedStatCard({
  icon: Icon,
  count,
  label,
  bgColor,
  iconColor,
  gradientFrom,
  gradientTo,
  index,
  isInView,
}: {
  icon: React.ElementType;
  count: number;
  label: string;
  bgColor: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  index: number;
  isInView: boolean;
}) {
  const animatedCount = useAnimatedCounter(count, 1200, isInView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 16, scale: 0.95 }
      }
      transition={{
        delay: index * 0.08,
        type: "spring",
        stiffness: 120,
        damping: 16,
      }}
      className={`
        relative flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl
        ${bgColor}
        border border-neutral-200/50 dark:border-neutral-700/50
        overflow-hidden group
      `}
    >
      {/* Subtle gradient accent on hover */}
      <div
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-gradient-to-br ${gradientFrom} ${gradientTo}
        `}
      />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
          {animatedCount.toLocaleString()}
        </span>
        <span className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

// =============================================================================
// Component
// =============================================================================

export function UserStats({ stats }: UserStatsProps) {
  const t = useTranslations("profile");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const statItems = [
    {
      key: "showcases",
      icon: ImageIcon,
      count: stats.showcases,
      label: t("stats.showcases"),
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
      gradientFrom: "from-blue-500/5",
      gradientTo: "to-indigo-500/5",
    },
    {
      key: "reviews",
      icon: Star,
      count: stats.reviews,
      label: t("stats.reviews"),
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
      gradientFrom: "from-amber-500/5",
      gradientTo: "to-orange-500/5",
    },
    {
      key: "threads",
      icon: MessageSquare,
      count: stats.threads,
      label: t("stats.threads"),
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
      gradientFrom: "from-purple-500/5",
      gradientTo: "to-pink-500/5",
    },
    {
      key: "answers",
      icon: CheckCircle,
      count: stats.answers,
      label: t("stats.answers"),
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
      gradientFrom: "from-green-500/5",
      gradientTo: "to-emerald-500/5",
    },
  ];

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
    >
      {statItems.map((item, index) => (
        <AnimatedStatCard
          key={item.key}
          icon={item.icon}
          count={item.count}
          label={item.label}
          bgColor={item.bgColor}
          iconColor={item.iconColor}
          gradientFrom={item.gradientFrom}
          gradientTo={item.gradientTo}
          index={index}
          isInView={isInView}
        />
      ))}
    </div>
  );
}

export default UserStats;
