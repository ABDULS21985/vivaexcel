'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiGet } from '@/lib/api-client';
import { useAuth } from '@/providers/auth-provider';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from 'recharts';
import {
  HeartPulse,
  FileText,
  Image,
  Search,
  DollarSign,
  Tag,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ListingScore {
  productId: string;
  overallScore: number;
  dimensions: {
    titleQuality: number;
    descriptionCompleteness: number;
    imageQuality: number;
    seoOptimization: number;
    pricingCompetitiveness: number;
    tagRelevance: number;
  };
  suggestions: Array<{
    dimension: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

interface SellerProduct {
  id: string;
  title: string;
  slug: string;
  featuredImage?: string;
  status: 'published' | 'draft' | 'archived';
}

// ---------------------------------------------------------------------------
// Dimension Config
// ---------------------------------------------------------------------------

const DIMENSION_CONFIG: Record<
  keyof ListingScore['dimensions'],
  { label: string; max: number; icon: React.ElementType; color: string }
> = {
  titleQuality: { label: 'Title Quality', max: 15, icon: FileText, color: '#1E4DB7' },
  descriptionCompleteness: { label: 'Description', max: 25, icon: FileText, color: '#2A5BC4' },
  imageQuality: { label: 'Image Quality', max: 20, icon: Image, color: '#F59A23' },
  seoOptimization: { label: 'SEO Optimization', max: 15, icon: Search, color: '#10B981' },
  pricingCompetitiveness: { label: 'Pricing', max: 15, icon: DollarSign, color: '#8B5CF6' },
  tagRelevance: { label: 'Tag Relevance', max: 10, icon: Tag, color: '#EC4899' },
};

// ---------------------------------------------------------------------------
// Mock Data (structured for real API replacement)
// ---------------------------------------------------------------------------

const MOCK_PRODUCTS: SellerProduct[] = [
  { id: 'prod-001', title: 'Modern Business Pitch Deck Template', slug: 'modern-pitch-deck', status: 'published' },
  { id: 'prod-002', title: 'Financial Report Spreadsheet Bundle', slug: 'financial-report', status: 'published' },
  { id: 'prod-003', title: 'SaaS Landing Page Template Kit', slug: 'saas-landing-kit', status: 'published' },
  { id: 'prod-004', title: 'Professional Resume & CV Pack', slug: 'resume-cv-pack', status: 'draft' },
  { id: 'prod-005', title: 'Startup Investor Presentation', slug: 'investor-presentation', status: 'published' },
  { id: 'prod-006', title: 'E-commerce Dashboard Template', slug: 'ecommerce-dashboard', status: 'published' },
];

const MOCK_SCORES: Record<string, ListingScore> = {
  'prod-001': {
    productId: 'prod-001',
    overallScore: 82,
    dimensions: { titleQuality: 13, descriptionCompleteness: 20, imageQuality: 17, seoOptimization: 12, pricingCompetitiveness: 12, tagRelevance: 8 },
    suggestions: [
      { dimension: 'descriptionCompleteness', suggestion: 'Add more bullet points highlighting key features and use cases.', impact: 'high' },
      { dimension: 'seoOptimization', suggestion: 'Include more long-tail keywords in the product description.', impact: 'medium' },
      { dimension: 'tagRelevance', suggestion: 'Add tags for "corporate", "business plan", and "quarterly review".', impact: 'low' },
    ],
  },
  'prod-002': {
    productId: 'prod-002',
    overallScore: 65,
    dimensions: { titleQuality: 10, descriptionCompleteness: 15, imageQuality: 14, seoOptimization: 10, pricingCompetitiveness: 10, tagRelevance: 6 },
    suggestions: [
      { dimension: 'titleQuality', suggestion: 'Include specific keywords like "Excel" or "Google Sheets" in the title.', impact: 'high' },
      { dimension: 'descriptionCompleteness', suggestion: 'Add a detailed features list and compatibility information.', impact: 'high' },
      { dimension: 'imageQuality', suggestion: 'Add more preview screenshots showing different tabs and formulas.', impact: 'medium' },
      { dimension: 'pricingCompetitiveness', suggestion: 'Consider adding a volume discount for multi-license purchases.', impact: 'low' },
    ],
  },
  'prod-003': {
    productId: 'prod-003',
    overallScore: 91,
    dimensions: { titleQuality: 14, descriptionCompleteness: 23, imageQuality: 19, seoOptimization: 14, pricingCompetitiveness: 13, tagRelevance: 8 },
    suggestions: [
      { dimension: 'pricingCompetitiveness', suggestion: 'Competitors offer similar kits at lower prices -- consider a launch discount.', impact: 'medium' },
      { dimension: 'tagRelevance', suggestion: 'Add trending tags like "Next.js" and "Tailwind CSS".', impact: 'low' },
    ],
  },
  'prod-004': {
    productId: 'prod-004',
    overallScore: 35,
    dimensions: { titleQuality: 8, descriptionCompleteness: 5, imageQuality: 6, seoOptimization: 5, pricingCompetitiveness: 7, tagRelevance: 4 },
    suggestions: [
      { dimension: 'descriptionCompleteness', suggestion: 'Write a complete product description -- currently only 2 sentences.', impact: 'high' },
      { dimension: 'imageQuality', suggestion: 'Upload at least 3 preview images showcasing different resume layouts.', impact: 'high' },
      { dimension: 'seoOptimization', suggestion: 'Add meta description and alt text for all images.', impact: 'high' },
      { dimension: 'titleQuality', suggestion: 'Specify the file format and number of templates included in the title.', impact: 'medium' },
      { dimension: 'tagRelevance', suggestion: 'Add tags for target job roles and industries.', impact: 'medium' },
    ],
  },
  'prod-005': {
    productId: 'prod-005',
    overallScore: 54,
    dimensions: { titleQuality: 11, descriptionCompleteness: 12, imageQuality: 10, seoOptimization: 8, pricingCompetitiveness: 8, tagRelevance: 5 },
    suggestions: [
      { dimension: 'imageQuality', suggestion: 'Replace low-resolution thumbnails with high-quality mockups.', impact: 'high' },
      { dimension: 'descriptionCompleteness', suggestion: 'Add a video walkthrough or animated GIF preview.', impact: 'high' },
      { dimension: 'seoOptimization', suggestion: 'Optimize the slug and add structured data markup.', impact: 'medium' },
      { dimension: 'tagRelevance', suggestion: 'Include tags for "Series A", "seed funding", and "VC pitch".', impact: 'low' },
    ],
  },
  'prod-006': {
    productId: 'prod-006',
    overallScore: 73,
    dimensions: { titleQuality: 12, descriptionCompleteness: 18, imageQuality: 15, seoOptimization: 11, pricingCompetitiveness: 11, tagRelevance: 6 },
    suggestions: [
      { dimension: 'descriptionCompleteness', suggestion: 'Document the chart components and data sources used in the dashboard.', impact: 'medium' },
      { dimension: 'seoOptimization', suggestion: 'Target "admin dashboard" and "analytics template" keywords.', impact: 'medium' },
      { dimension: 'tagRelevance', suggestion: 'Add technology stack tags like "React", "Chart.js", and "Recharts".', impact: 'low' },
    ],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getScoreColor(score: number): string {
  if (score < 40) return '#EF4444';
  if (score <= 70) return '#F59A23';
  return '#10B981';
}

function getScoreLabel(score: number): string {
  if (score < 40) return 'Poor';
  if (score <= 70) return 'Fair';
  return 'Good';
}

function getImpactBadgeClass(impact: 'high' | 'medium' | 'low'): string {
  switch (impact) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    case 'medium':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    case 'low':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
  }
}

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const color = getScoreColor(score);
  const data = [{ value: score, fill: color }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'rgba(148, 163, 184, 0.15)' }}
            dataKey="value"
            angleAxisId={0}
            cornerRadius={12}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-bold"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
          / 100
        </span>
      </div>
    </div>
  );
}

function DimensionBar({
  dimensionKey,
  value,
  index,
}: {
  dimensionKey: keyof ListingScore['dimensions'];
  value: number;
  index: number;
}) {
  const config = DIMENSION_CONFIG[dimensionKey];
  const Icon = config.icon;
  const percentage = (value / config.max) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
          <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            {config.label}
          </span>
        </div>
        <span className="text-xs font-semibold text-neutral-900 dark:text-white">
          {value}/{config.max}
        </span>
      </div>
      <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, delay: index * 0.06 + 0.1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>
    </motion.div>
  );
}

function SuggestionItem({
  suggestion,
  index,
}: {
  suggestion: ListingScore['suggestions'][number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 + 0.3, duration: 0.25 }}
      className="flex items-start gap-3 py-2"
    >
      <div className="mt-0.5 w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
          {suggestion.suggestion}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
            {DIMENSION_CONFIG[suggestion.dimension as keyof ListingScore['dimensions']]?.label ?? suggestion.dimension}
          </span>
          <Badge
            className={cn(
              'text-[10px] px-1.5 py-0 h-4 border-0 capitalize',
              getImpactBadgeClass(suggestion.impact),
            )}
          >
            {suggestion.impact} impact
          </Badge>
        </div>
      </div>
    </motion.div>
  );
}

function ProductScoreCard({
  product,
  score,
  onRescore,
  isRescoring,
}: {
  product: SellerProduct;
  score: ListingScore | undefined;
  onRescore: (productId: string) => void;
  isRescoring: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!score) {
    return (
      <motion.div
        variants={cardVariants}
        className={cn(
          'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
          'border border-neutral-200/60 dark:border-neutral-700/60',
          'rounded-xl p-5 shadow-sm',
        )}
      >
        <div className="flex items-center gap-4">
          <Skeleton className="w-[100px] h-[100px] rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </motion.div>
    );
  }

  const scoreColor = getScoreColor(score.overallScore);
  const scoreLabel = getScoreLabel(score.overallScore);

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={cn(
        'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
        'border border-neutral-200/60 dark:border-neutral-700/60',
        'rounded-xl shadow-sm overflow-hidden',
        'hover:shadow-md transition-shadow duration-300',
      )}
    >
      {/* Card header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full text-left p-5 flex items-center gap-4"
      >
        {/* Gauge */}
        <div className="flex-shrink-0">
          <ScoreGauge score={score.overallScore} size={100} />
        </div>

        {/* Product info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
            {product.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge
              className={cn(
                'text-[10px] px-2 py-0 h-5 border-0 font-semibold capitalize',
                product.status === 'published'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : product.status === 'draft'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
              )}
            >
              {product.status}
            </Badge>
            <span
              className="text-xs font-semibold"
              style={{ color: scoreColor }}
            >
              {scoreLabel}
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {score.suggestions.length} suggestion{score.suggestions.length !== 1 ? 's' : ''} for improvement
          </p>
        </div>

        {/* Expand icon */}
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-neutral-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-5">
              {/* Dimension scores */}
              <div>
                <h4 className="text-xs font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-3">
                  Score Breakdown
                </h4>
                <div className="space-y-3">
                  {(Object.keys(DIMENSION_CONFIG) as Array<keyof ListingScore['dimensions']>).map(
                    (key, index) => (
                      <DimensionBar
                        key={key}
                        dimensionKey={key}
                        value={score.dimensions[key]}
                        index={index}
                      />
                    ),
                  )}
                </div>
              </div>

              {/* Suggestions */}
              {score.suggestions.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold tracking-wider text-neutral-400 dark:text-neutral-500 uppercase mb-2">
                    Improvement Suggestions
                  </h4>
                  <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {score.suggestions.map((suggestion, index) => (
                      <SuggestionItem
                        key={`${suggestion.dimension}-${index}`}
                        suggestion={suggestion}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Re-score button */}
              <div className="flex justify-end pt-1">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRescore(product.id);
                  }}
                  disabled={isRescoring}
                  className={cn(
                    'gap-2 text-sm',
                    'bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]',
                    'hover:from-[#143A8F] hover:to-[#1E4DB7]',
                    'text-white shadow-md shadow-[#1E4DB7]/20',
                  )}
                >
                  <RefreshCw
                    className={cn('w-4 h-4', isRescoring && 'animate-spin')}
                  />
                  {isRescoring ? 'Re-scoring...' : 'Re-score'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-40 bg-neutral-200 dark:bg-neutral-800" />
          <Skeleton className="h-4 w-64 mt-2 bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <Skeleton className="h-[120px] w-[120px] rounded-full bg-neutral-200 dark:bg-neutral-800" />
      </div>

      {/* Card skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200 dark:border-neutral-700/60 p-5"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-[100px] h-[100px] rounded-full bg-neutral-200 dark:bg-neutral-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-6">
        <HeartPulse className="w-10 h-10 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
        No listings to score
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-sm">
        Create and publish products to see their listing health scores and get
        actionable improvement suggestions.
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function ListingHealthPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rescoringIds, setRescoringIds] = useState<Set<string>>(new Set());

  // Fetch seller products
  const {
    data: productsResponse,
    isLoading: loadingProducts,
  } = useQuery({
    queryKey: ['seller-products', user?.id],
    queryFn: async () => {
      try {
        const response = await apiGet<{ data: SellerProduct[] }>('/seller/products');
        return response.data;
      } catch {
        // Fallback to mock data during development
        return MOCK_PRODUCTS;
      }
    },
    enabled: !!user,
  });

  const products = productsResponse ?? [];

  // Fetch scores for all products
  const {
    data: scoresMap,
    isLoading: loadingScores,
  } = useQuery({
    queryKey: ['listing-scores', products.map((p) => p.id).join(',')],
    queryFn: async () => {
      const scores: Record<string, ListingScore> = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const response = await apiGet<{ data: ListingScore }>(
              `/seller-growth/insights/score/${product.id}`,
            );
            scores[product.id] = response.data;
          } catch {
            // Fallback to mock score during development
            if (MOCK_SCORES[product.id]) {
              scores[product.id] = MOCK_SCORES[product.id];
            }
          }
        }),
      );
      return scores;
    },
    enabled: products.length > 0,
  });

  // Calculate portfolio average
  const portfolioScore = (() => {
    if (!scoresMap || Object.keys(scoresMap).length === 0) return 0;
    const scores = Object.values(scoresMap);
    return Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length);
  })();

  // Handle re-score
  const handleRescore = async (productId: string) => {
    setRescoringIds((prev) => new Set(prev).add(productId));
    try {
      await apiGet<{ data: ListingScore }>(
        `/seller-growth/insights/score/${productId}`,
        { force: true },
      );
      // Invalidate and refetch
      await queryClient.invalidateQueries({
        queryKey: ['listing-scores'],
      });
    } catch {
      // Silently handle -- the UI already shows the current score
    } finally {
      setRescoringIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const isLoading = loadingProducts || loadingScores;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6">
          <HeartPulse className="h-6 w-6 text-[#1E4DB7]" />
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Listing Health
          </h1>
        </div>
        <EmptyState />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ─── Page Header ───────────────────────────────────────────────────── */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-[#1E4DB7]" />
            Listing Health
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} scored
            &bull; Improve your listings to increase visibility and sales
          </p>
        </div>

        {/* Portfolio health gauge */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Portfolio Health
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: getScoreColor(portfolioScore) }}
            >
              {getScoreLabel(portfolioScore)}
            </p>
          </div>
          <ScoreGauge score={portfolioScore} size={100} />
        </div>
      </motion.div>

      {/* ─── Score Summary Badges ──────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="flex flex-wrap gap-2">
        {[
          { label: 'Good', filter: (s: ListingScore) => s.overallScore > 70, color: '#10B981' },
          { label: 'Fair', filter: (s: ListingScore) => s.overallScore >= 40 && s.overallScore <= 70, color: '#F59A23' },
          { label: 'Poor', filter: (s: ListingScore) => s.overallScore < 40, color: '#EF4444' },
        ].map((bucket) => {
          const count = scoresMap
            ? Object.values(scoresMap).filter(bucket.filter).length
            : 0;
          return (
            <Badge
              key={bucket.label}
              className="border-0 text-xs font-semibold px-3 py-1"
              style={{
                backgroundColor: `${bucket.color}15`,
                color: bucket.color,
              }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: bucket.color }}
              />
              {count} {bucket.label}
            </Badge>
          );
        })}
      </motion.div>

      {/* ─── Product Score Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {products.map((product) => (
          <ProductScoreCard
            key={product.id}
            product={product}
            score={scoresMap?.[product.id]}
            onRescore={handleRescore}
            isRescoring={rescoringIds.has(product.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}
