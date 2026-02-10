'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  DollarSign,
  BarChart3,
  Target,
  Eye,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  X,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { cn, Button, Badge } from '@ktblog/ui/components';
import {
  useSellerInsights,
  useGenerateInsights,
  useUpdateInsightStatus,
} from '@/hooks/use-seller-growth';
import type { SellerInsight } from '@/hooks/use-seller-growth';

// ─── Types ──────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'pending' | 'viewed' | 'acted_on';

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'viewed', label: 'Viewed' },
  { value: 'acted_on', label: 'Acted On' },
];

const INSIGHT_TYPE_ICONS: Record<SellerInsight['insightType'], React.ElementType> = {
  pricing: DollarSign,
  listing_quality: BarChart3,
  marketing: TrendingUp,
  performance: Target,
  opportunity: Lightbulb,
};

const INSIGHT_TYPE_LABELS: Record<SellerInsight['insightType'], string> = {
  pricing: 'Pricing',
  listing_quality: 'Listing Quality',
  marketing: 'Marketing',
  performance: 'Performance',
  opportunity: 'Opportunity',
};

const PRIORITY_CONFIG: Record<
  SellerInsight['priority'],
  { label: string; className: string; sortOrder: number }
> = {
  high: {
    label: 'HIGH',
    className: 'bg-red-500/10 text-red-500 dark:bg-red-500/20 dark:text-red-400 border-red-500/20',
    sortOrder: 0,
  },
  medium: {
    label: 'MEDIUM',
    className:
      'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20',
    sortOrder: 1,
  },
  low: {
    label: 'LOW',
    className:
      'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20',
    sortOrder: 2,
  },
};

// ─── Glass Card Wrapper ─────────────────────────────────────────────────────

function GlassCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200/60 dark:border-neutral-700/60',
        'rounded-xl p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────

function InsightsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="h-8 w-40 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 w-56 mt-2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div className="h-10 w-48 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      </div>

      {/* Tab skeleton */}
      <div className="h-10 w-80 rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" />

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 p-6',
              'bg-white/80 dark:bg-neutral-900/80',
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-6 w-16 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div className="h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse mb-3" />
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onGenerate, isGenerating }: { onGenerate: () => void; isGenerating: boolean }) {
  return (
    <motion.div
      variants={cardVariants}
      className={cn(
        'flex flex-col items-center justify-center py-20 px-6',
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200/60 dark:border-neutral-700/60',
        'rounded-xl shadow-sm',
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 mb-5">
        <Lightbulb className="h-8 w-8 text-[#1E4DB7]" />
      </div>
      <p className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
        No insights yet
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-sm mb-6">
        Generate personalized insights to discover opportunities for improving your store
        performance, pricing strategy, and listing quality.
      </p>
      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className={cn(
          'rounded-lg px-5 py-2.5 text-sm font-semibold text-white',
          'bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]',
          'hover:from-[#2358ca] hover:to-[#1a4aad]',
          'shadow-lg shadow-[#1E4DB7]/20 transition-all duration-300',
          'disabled:opacity-60 disabled:cursor-not-allowed',
        )}
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Generating...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Insights
          </span>
        )}
      </Button>
    </motion.div>
  );
}

// ─── Insight Card ───────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onDismiss,
  isDismissing,
}: {
  insight: SellerInsight;
  onDismiss: (id: string) => void;
  isDismissing: boolean;
}) {
  const priorityConfig = PRIORITY_CONFIG[insight.priority];
  const TypeIcon = INSIGHT_TYPE_ICONS[insight.insightType];
  const typeLabel = INSIGHT_TYPE_LABELS[insight.insightType];

  return (
    <GlassCard className="group relative flex flex-col hover:border-neutral-300/80 dark:hover:border-neutral-600/80 transition-colors duration-200">
      {/* Top row: Priority badge + Type badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5',
              priorityConfig.className,
            )}
          >
            {priorityConfig.label}
          </Badge>
          <Badge
            className={cn(
              'text-[10px] font-medium border px-2 py-0.5',
              'bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-[#6B9BFA]',
              'border-[#1E4DB7]/20',
            )}
          >
            <TypeIcon className="h-3 w-3 mr-1" />
            {typeLabel}
          </Badge>
        </div>

        {insight.status === 'viewed' || insight.status === 'acted_on' ? (
          <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
            {insight.status === 'viewed' && <Eye className="h-3 w-3" />}
            {insight.status === 'acted_on' && <CheckCircle className="h-3 w-3 text-emerald-500" />}
            <span className="capitalize">{insight.status.replace('_', ' ')}</span>
          </div>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-2 leading-snug">
        {insight.title}
      </h3>

      {/* Description */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
        {insight.description}
      </p>

      {/* Action Items */}
      {insight.actionItems && insight.actionItems.length > 0 && (
        <div className="flex-1 mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
            Action Items
          </p>
          <ul className="space-y-1.5">
            {insight.actionItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800">
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500">
                    {idx + 1}
                  </span>
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-300 leading-snug">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer: Timestamp + Dismiss */}
      <div className="mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
          {new Date(insight.generatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <button
          onClick={() => onDismiss(insight.id)}
          disabled={isDismissing}
          className={cn(
            'flex items-center gap-1 text-[10px] font-medium',
            'text-neutral-400 dark:text-neutral-500',
            'hover:text-red-500 dark:hover:text-red-400',
            'transition-colors duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
          title="Dismiss insight"
        >
          <X className="h-3 w-3" />
          Dismiss
        </button>
      </div>
    </GlassCard>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function SellerInsightsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dismissingId, setDismissingId] = useState<string | null>(null);

  const queryParams = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
  };

  const { data: insightsData, isLoading } = useSellerInsights(queryParams);
  const generateInsights = useGenerateInsights();
  const updateInsightStatus = useUpdateInsightStatus();

  const insights = insightsData?.data ?? [];

  // Sort by priority: high -> medium -> low
  const sortedInsights = [...insights].sort(
    (a, b) =>
      (PRIORITY_CONFIG[a.priority]?.sortOrder ?? 99) -
      (PRIORITY_CONFIG[b.priority]?.sortOrder ?? 99),
  );

  const handleGenerate = () => {
    generateInsights.mutate();
  };

  const handleDismiss = (id: string) => {
    setDismissingId(id);
    updateInsightStatus.mutate(
      { id, status: 'dismissed' },
      {
        onSettled: () => {
          setDismissingId(null);
        },
      },
    );
  };

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Page Header ───────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-[#1E4DB7]" />
            Insights
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            AI-powered recommendations to grow your store
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateInsights.isPending}
          className={cn(
            'rounded-lg px-5 py-2.5 text-sm font-semibold text-white',
            'bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]',
            'hover:from-[#2358ca] hover:to-[#1a4aad]',
            'shadow-lg shadow-[#1E4DB7]/20 transition-all duration-300',
            'disabled:opacity-60 disabled:cursor-not-allowed',
          )}
        >
          {generateInsights.isPending ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generate New Insights
            </span>
          )}
        </Button>
      </motion.div>

      {/* ─── Status Filter Tabs ────────────────────────────────────────── */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                statusFilter === tab.value
                  ? 'bg-[#1E4DB7] text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Insights Grid / Empty State ───────────────────────────────── */}
      {sortedInsights.length === 0 ? (
        <EmptyState onGenerate={handleGenerate} isGenerating={generateInsights.isPending} />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          {sortedInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onDismiss={handleDismiss}
              isDismissing={dismissingId === insight.id}
            />
          ))}
        </motion.div>
      )}

      {/* ─── Summary Footer ────────────────────────────────────────────── */}
      {sortedInsights.length > 0 && (
        <motion.div
          variants={cardVariants}
          className="flex items-center justify-between pt-2"
        >
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Showing {sortedInsights.length} insight{sortedInsights.length !== 1 ? 's' : ''}
            {statusFilter !== 'all' && (
              <span>
                {' '}filtered by{' '}
                <span className="font-medium text-neutral-500 dark:text-neutral-400 capitalize">
                  {statusFilter.replace('_', ' ')}
                </span>
              </span>
            )}
          </p>
          {insights.some((i) => i.priority === 'high') && (
            <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-medium">
                {insights.filter((i) => i.priority === 'high').length} high priority
              </span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
