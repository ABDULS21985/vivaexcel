"use client";

import { motion } from "framer-motion";
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
// Animation Variants
// =============================================================================

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      type: "spring" as const,
      stiffness: 120,
      damping: 16,
    },
  }),
};

// =============================================================================
// Component
// =============================================================================

export function UserStats({ stats }: UserStatsProps) {
  const t = useTranslations("profile");

  const statItems = [
    {
      key: "showcases",
      icon: ImageIcon,
      count: stats.showcases,
      label: t("stats.showcases"),
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-500 dark:text-blue-400",
    },
    {
      key: "reviews",
      icon: Star,
      count: stats.reviews,
      label: t("stats.reviews"),
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-500 dark:text-amber-400",
    },
    {
      key: "threads",
      icon: MessageSquare,
      count: stats.threads,
      label: t("stats.threads"),
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      iconColor: "text-purple-500 dark:text-purple-400",
    },
    {
      key: "answers",
      icon: CheckCircle,
      count: stats.answers,
      label: t("stats.answers"),
      bgColor: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-500 dark:text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.key}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className={`
              flex flex-col items-center gap-2 p-4 md:p-5 rounded-xl
              ${item.bgColor}
              border border-neutral-200/50 dark:border-neutral-700/50
            `}
          >
            <Icon className={`h-5 w-5 ${item.iconColor}`} />
            <span className="text-2xl font-bold text-neutral-900 dark:text-white tabular-nums">
              {item.count.toLocaleString()}
            </span>
            <span className="text-sm text-neutral-500 dark:text-neutral-400 text-center">
              {item.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default UserStats;
