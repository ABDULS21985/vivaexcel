"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Presentation,
  BookOpen,
  Bug,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Badge } from "@ktblog/ui/components";
import type { DiscussionCategory } from "@/types/discussion";

// =============================================================================
// Icon Mapping
// =============================================================================

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Presentation,
  BookOpen,
  Bug,
};

// =============================================================================
// Color Mapping — maps category.color string to Tailwind border + bg classes
// =============================================================================

const COLOR_MAP: Record<string, { border: string; bg: string; text: string; iconBg: string }> = {
  blue: {
    border: "border-s-blue-500",
    bg: "hover:bg-blue-50 dark:hover:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
  },
  green: {
    border: "border-s-green-500",
    bg: "hover:bg-green-50 dark:hover:bg-green-950/20",
    text: "text-green-600 dark:text-green-400",
    iconBg: "bg-green-100 dark:bg-green-900/40",
  },
  amber: {
    border: "border-s-amber-500",
    bg: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
    text: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  purple: {
    border: "border-s-purple-500",
    bg: "hover:bg-purple-50 dark:hover:bg-purple-950/20",
    text: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
  },
  red: {
    border: "border-s-red-500",
    bg: "hover:bg-red-50 dark:hover:bg-red-950/20",
    text: "text-red-600 dark:text-red-400",
    iconBg: "bg-red-100 dark:bg-red-900/40",
  },
  indigo: {
    border: "border-s-indigo-500",
    bg: "hover:bg-indigo-50 dark:hover:bg-indigo-950/20",
    text: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  teal: {
    border: "border-s-teal-500",
    bg: "hover:bg-teal-50 dark:hover:bg-teal-950/20",
    text: "text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
  },
  orange: {
    border: "border-s-orange-500",
    bg: "hover:bg-orange-50 dark:hover:bg-orange-950/20",
    text: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
  },
};

const DEFAULT_COLOR = {
  border: "border-s-neutral-500",
  bg: "hover:bg-neutral-50 dark:hover:bg-neutral-800/30",
  text: "text-neutral-600 dark:text-neutral-400",
  iconBg: "bg-neutral-100 dark:bg-neutral-800/40",
};

// =============================================================================
// Props
// =============================================================================

interface CategoryCardProps {
  category: DiscussionCategory;
}

// =============================================================================
// Component
// =============================================================================

export function CategoryCard({ category }: CategoryCardProps) {
  const t = useTranslations("discussion");
  const Icon = ICON_MAP[category.icon] || MessageSquare;
  const colors = COLOR_MAP[category.color] || DEFAULT_COLOR;

  return (
    <Link href={`/community/discussions?category=${category.slug}`}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={`
          group relative rounded-xl border border-neutral-200 dark:border-neutral-800
          border-s-4 ${colors.border} ${colors.bg}
          bg-white dark:bg-neutral-900
          p-5 transition-all duration-200
          hover:shadow-md dark:hover:shadow-neutral-900/50
          cursor-pointer
        `}
      >
        {/* Icon + Name */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center`}
          >
            <Icon className={`h-5 w-5 ${colors.text}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm leading-tight group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
              {category.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4">
          {category.description}
        </p>

        {/* Thread count badge */}
        <div className="flex items-center justify-between">
          <Badge
            variant="secondary"
            className="text-xs font-medium"
          >
            {category.threadCount} {t("threads")}
          </Badge>
        </div>
      </motion.div>
    </Link>
  );
}

export default CategoryCard;
