'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Video,
  Award,
  Star,
  ChevronRight,
} from 'lucide-react';
import { cn, Button, Badge } from '@ktblog/ui/components';
import { Link } from '@/i18n/routing';
import { useSellerResources, type SellerResource } from '@/hooks/use-seller-growth';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRIMARY = '#1E4DB7';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const TABS = [
  { label: 'All', value: 'all', icon: GraduationCap },
  { label: 'Tutorials', value: 'tutorial', icon: BookOpen },
  { label: 'Guides', value: 'guide', icon: BookOpen },
  { label: 'Videos', value: 'video', icon: Video },
  { label: 'Best Practices', value: 'best_practice', icon: Award },
  { label: 'Success Stories', value: 'success_story', icon: Star },
] as const;

type TabValue = (typeof TABS)[number]['value'];

const TYPE_COLORS: Record<string, string> = {
  tutorial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  guide: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  video: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  best_practice: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  success_story: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const TYPE_ICONS: Record<string, typeof GraduationCap> = {
  tutorial: BookOpen,
  guide: BookOpen,
  video: Video,
  best_practice: Award,
  success_story: Star,
};

const TYPE_LABELS: Record<string, string> = {
  tutorial: 'Tutorial',
  guide: 'Guide',
  video: 'Video',
  best_practice: 'Best Practice',
  success_story: 'Success Story',
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

function ResourcesSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        <div className="h-4 w-80 mt-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-10 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"
          />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(GLASS_CARD, 'p-0 overflow-hidden')}
          >
            <div className="h-44 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
              <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
              <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ activeTab }: { activeTab: TabValue }) {
  const label = TABS.find((t) => t.value === activeTab)?.label ?? 'resources';

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${PRIMARY}15` }}
      >
        <GraduationCap className="w-8 h-8" style={{ color: PRIMARY }} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
        No {label.toLowerCase()} found
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
        We don&apos;t have any {label.toLowerCase()} available right now. Check back soon for new content!
      </p>
    </motion.div>
  );
}

// ─── Resource Card ──────────────────────────────────────────────────────────

function ResourceCard({ resource }: { resource: SellerResource }) {
  const Icon = TYPE_ICONS[resource.type] ?? GraduationCap;
  const badgeColor = TYPE_COLORS[resource.type] ?? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  const typeLabel = TYPE_LABELS[resource.type] ?? resource.type;

  return (
    <motion.div variants={itemVariants} whileHover="hover" initial="rest" animate="rest">
      <motion.div variants={cardHover}>
        <Link href={`/seller-dashboard/learn/${resource.slug}`} className="block">
          <div className={cn(GLASS_CARD, 'p-0 overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow duration-300')}>
            {/* Thumbnail / Placeholder */}
            {resource.thumbnailUrl ? (
              <div className="relative h-44 overflow-hidden">
                <img
                  src={resource.thumbnailUrl}
                  alt={resource.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            ) : (
              <div
                className="h-44 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}08)`,
                }}
              >
                <Icon
                  className="w-12 h-12 transition-transform duration-300 group-hover:scale-110"
                  style={{ color: PRIMARY }}
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-3">
              <Badge className={cn('text-xs font-medium border-0 rounded-full px-2.5 py-0.5', badgeColor)}>
                {typeLabel}
              </Badge>

              <h3 className="text-base font-semibold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-[#1E4DB7] dark:group-hover:text-blue-400 transition-colors">
                {resource.title}
              </h3>

              {resource.excerpt && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {resource.excerpt}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-sm font-medium text-[#1E4DB7] dark:text-blue-400 pt-1">
                <span>Read more</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SellerLearnPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  const queryParams = activeTab === 'all' ? undefined : { type: activeTab };
  const { data, isLoading } = useSellerResources(queryParams);

  const resources = data?.data ?? [];

  if (isLoading) {
    return <ResourcesSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-[#1E4DB7]" />
          Learn &amp; Grow
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Tutorials, guides, and best practices to help you succeed as a seller
        </p>
      </motion.div>

      {/* ─── Tabs ────────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-[#1E4DB7] text-white shadow-md shadow-[#1E4DB7]/25'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white',
              )}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* ─── Resources Grid ──────────────────────────────────────────────── */}
      {resources.length === 0 ? (
        <EmptyState activeTab={activeTab} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
