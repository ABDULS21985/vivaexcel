'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Badge } from '@ktblog/ui/components';
import { useSellerResource } from '@/hooks/use-seller-growth';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRIMARY = '#1E4DB7';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const TYPE_COLORS: Record<string, string> = {
  tutorial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  guide: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  video: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  best_practice: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  success_story: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
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
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

// ─── Skeleton ───────────────────────────────────────────────────────────────

function ResourceDetailSkeleton() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back link skeleton */}
      <div className="h-5 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />

      {/* Title skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
          <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className={cn(GLASS_CARD, 'p-8 space-y-4')}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse"
            style={{ width: `${Math.max(40, 100 - i * 8)}%` }}
          />
        ))}
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Date Formatter ─────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function SellerResourceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: resource, isLoading } = useSellerResource(slug);

  if (isLoading) {
    return <ResourceDetailSkeleton />;
  }

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ backgroundColor: `${PRIMARY}15` }}
        >
          <ArrowLeft className="w-8 h-8" style={{ color: PRIMARY }} />
        </div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
          Resource not found
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          The resource you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/seller-dashboard/learn"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#1E4DB7] dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learn &amp; Grow
        </Link>
      </div>
    );
  }

  const badgeColor = TYPE_COLORS[resource.type] ?? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  const typeLabel = TYPE_LABELS[resource.type] ?? resource.type;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* ─── Back Link ───────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Link
          href="/seller-dashboard/learn"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learn &amp; Grow
        </Link>
      </motion.div>

      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge className={cn('text-xs font-medium border-0 rounded-full px-2.5 py-0.5', badgeColor)}>
            {typeLabel}
          </Badge>

          {resource.publishedAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(resource.publishedAt)}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white leading-tight">
          {resource.title}
        </h1>
      </motion.div>

      {/* ─── Video Embed (for video resources) ───────────────────────────── */}
      {resource.type === 'video' && resource.videoUrl && (
        <motion.div variants={itemVariants}>
          <div className={cn(GLASS_CARD, 'p-0 overflow-hidden')}>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={resource.videoUrl}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full rounded-2xl"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Content ─────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6 sm:p-8')}>
          <div
            className={cn(
              'prose prose-neutral dark:prose-invert max-w-none',
              'prose-headings:text-neutral-900 dark:prose-headings:text-white',
              'prose-a:text-[#1E4DB7] dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline',
              'prose-img:rounded-xl prose-img:shadow-md',
              'prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5',
              'prose-pre:bg-neutral-900 dark:prose-pre:bg-neutral-950 prose-pre:rounded-xl',
              'prose-blockquote:border-l-[#1E4DB7]',
            )}
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />
        </div>
      </motion.div>

      {/* ─── Tags ────────────────────────────────────────────────────────── */}
      {resource.tags && resource.tags.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            {resource.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
