'use client';

import { useState } from 'react';
import {
  useMarketOpportunities,
  useMarketBenchmarks,
  useSalesForecast,
} from '@/hooks/use-seller-growth';
import type { MarketOpportunity, MarketBenchmark, SalesForecast } from '@/hooks/use-seller-growth';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Search,
  BarChart3,
  ArrowUpRight,
  Package,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';
import { Link } from '@/i18n/routing';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PRIMARY = '#1E4DB7';
const SECONDARY = '#143A8F';
const ACCENT = '#F59A23';

const GLASS =
  'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getPotentialColor(potential: MarketOpportunity['potential']) {
  switch (potential) {
    case 'HIGH':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    case 'LOW':
      return 'bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300';
  }
}

function getPotentialDotColor(potential: MarketOpportunity['potential']) {
  switch (potential) {
    case 'HIGH':
      return 'bg-emerald-500';
    case 'MEDIUM':
      return 'bg-amber-500';
    case 'LOW':
      return 'bg-neutral-400';
  }
}

function formatNumber(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return num.toLocaleString();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

// ---------------------------------------------------------------------------
// Custom Recharts Tooltips
// ---------------------------------------------------------------------------
function PriceChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 px-3 py-2 shadow-lg">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-xs font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

function ForecastChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 px-3 py-2 shadow-lg">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton Loaders
// ---------------------------------------------------------------------------
function OpportunitiesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={cn(GLASS_CARD, 'p-5 space-y-4')}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BenchmarksSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn(GLASS_CARD, 'p-5 space-y-3')}>
            <Skeleton className="h-5 w-40" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

function ForecastSkeleton() {
  return (
    <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OpportunityCard({
  opportunity,
  index,
}: {
  opportunity: MarketOpportunity;
  index: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={cardHover}
      className={cn(GLASS_CARD, 'p-5 flex flex-col gap-3 relative overflow-hidden')}
    >
      {/* Subtle gradient orb */}
      <div
        className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-[0.06]"
        style={{
          background: `radial-gradient(circle, ${
            opportunity.potential === 'HIGH' ? '#10B981' : opportunity.potential === 'MEDIUM' ? '#F59E0B' : '#9CA3AF'
          }, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
          >
            <Search className="w-4 h-4" style={{ color: PRIMARY }} />
          </div>
          <h3 className="font-semibold text-neutral-900 dark:text-white text-sm truncate">
            {opportunity.term}
          </h3>
        </div>
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 flex items-center gap-1.5',
            getPotentialColor(opportunity.potential)
          )}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full', getPotentialDotColor(opportunity.potential))} />
          {opportunity.potential}
        </span>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {formatNumber(opportunity.searchVolume)}
          </span>{' '}
          searches
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {opportunity.existingProducts}
          </span>{' '}
          products
        </span>
      </div>

      {/* Suggested product type */}
      <div className="flex items-center gap-2">
        <Badge className="bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-[#6B9AFF] border-0 text-[11px]">
          {opportunity.suggestedProductType}
        </Badge>
      </div>

      {/* Reasoning */}
      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2">
        {opportunity.reasoning}
      </p>

      {/* CTA */}
      <div className="mt-auto pt-2">
        <Link href="/seller-dashboard/products">
          <Button
            size="sm"
            className="w-full text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow text-xs"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
          >
            <Package className="w-3.5 h-3.5 mr-1.5" />
            Create Product
            <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function BenchmarkCard({ benchmark }: { benchmark: MarketBenchmark }) {
  return (
    <motion.div variants={itemVariants} whileHover={cardHover} className={cn(GLASS_CARD, 'p-5')}>
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
        >
          <BarChart3 className="w-4 h-4" style={{ color: PRIMARY }} />
        </div>
        <h3 className="font-semibold text-neutral-900 dark:text-white text-sm capitalize">
          {benchmark.productType.replace(/_/g, ' ')}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Average Price */}
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">Avg Price</p>
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            {formatCurrency(benchmark.averagePrice)}
          </p>
        </div>
        {/* Median Price */}
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">Median Price</p>
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            {formatCurrency(benchmark.medianPrice)}
          </p>
        </div>
        {/* Avg Rating */}
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">Avg Rating</p>
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            {benchmark.averageRating.toFixed(1)}
          </p>
        </div>
        {/* Avg Monthly Sales */}
        <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">Avg Sales/Mo</p>
          <p className="text-sm font-bold text-neutral-900 dark:text-white">
            {formatNumber(benchmark.averageSalesPerMonth)}
          </p>
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-3">
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">Price Range</p>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {formatCurrency(benchmark.priceRange.min)}
          </span>
          <div className="flex-1 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})`,
                width: `${Math.min(100, ((benchmark.averagePrice - benchmark.priceRange.min) / (benchmark.priceRange.max - benchmark.priceRange.min)) * 100)}%`,
              }}
            />
          </div>
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            {formatCurrency(benchmark.priceRange.max)}
          </span>
        </div>
      </div>

      {/* Top Seller Metrics */}
      <div className="mt-3 pt-3 border-t border-neutral-200/60 dark:border-neutral-700/60">
        <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
          Top Seller Metrics
        </p>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-neutral-600 dark:text-neutral-400">
            Price:{' '}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatCurrency(benchmark.topSellerMetrics.avgPrice)}
            </span>
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            Rating:{' '}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {benchmark.topSellerMetrics.avgRating.toFixed(1)}
            </span>
          </span>
          <span className="text-neutral-600 dark:text-neutral-400">
            Sales:{' '}
            <span className="font-semibold text-neutral-900 dark:text-white">
              {formatNumber(benchmark.topSellerMetrics.avgMonthlySales)}/mo
            </span>
          </span>
        </div>
      </div>

      {/* Sample size + calculated date */}
      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-3">
        Based on {benchmark.sampleSize} products &middot; Updated{' '}
        {new Date(benchmark.calculatedAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------
export default function MarketAnalysisPage() {
  const [productTypeFilter, setProductTypeFilter] = useState<string>('');
  const [forecastDays, setForecastDays] = useState<number>(30);

  // Data hooks
  const {
    data: opportunities,
    isLoading: loadingOpportunities,
  } = useMarketOpportunities();

  const {
    data: benchmarks,
    isLoading: loadingBenchmarks,
  } = useMarketBenchmarks(
    productTypeFilter ? { productType: productTypeFilter } : undefined
  );

  const {
    data: forecast,
    isLoading: loadingForecast,
  } = useSalesForecast(forecastDays);

  // Derive unique product types from benchmarks for the filter dropdown
  const productTypes = benchmarks
    ? [...new Set(benchmarks.map((b) => b.productType))]
    : [];

  // Prepare price distribution chart data from benchmarks
  const priceChartData = benchmarks
    ? benchmarks.map((b) => ({
        name: b.productType.replace(/_/g, ' '),
        average: b.averagePrice,
        median: b.medianPrice,
        min: b.priceRange.min,
        max: b.priceRange.max,
      }))
    : [];

  // Prepare forecast chart data
  const forecastChartData = forecast?.dailyProjections ?? [];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* ================================================================= */}
      {/* PAGE HEADER                                                       */}
      {/* ================================================================= */}
      <motion.div variants={itemVariants}>
        <div
          className={cn(GLASS_CARD, 'relative overflow-hidden')}
          style={{ borderTop: `3px solid ${ACCENT}` }}
        >
          {/* Background gradient orb */}
          <div
            className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07] -translate-y-1/2 translate-x-1/3"
            style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)` }}
          />

          <div className="relative z-10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  Market Analysis
                </h1>
                <p className="mt-1.5 text-neutral-600 dark:text-neutral-400">
                  Discover opportunities, benchmark your products, and forecast your sales.
                </p>
              </div>
              <Link href="/seller-dashboard/products">
                <Button
                  className="text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
                >
                  <Package className="w-4 h-4 mr-2" />
                  View Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 1: MARKET OPPORTUNITIES                                   */}
      {/* ================================================================= */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
          >
            <Search className="w-5 h-5" style={{ color: PRIMARY }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Market Opportunities
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Trending searches with untapped product potential
            </p>
          </div>
          {opportunities && opportunities.length > 0 && (
            <Badge className="bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-[#1E4DB7]/20 dark:text-[#6B9AFF] border-0 text-xs ml-auto">
              {opportunities.length} found
            </Badge>
          )}
        </div>

        {loadingOpportunities ? (
          <OpportunitiesSkeleton />
        ) : opportunities && opportunities.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {opportunities.map((opp, index) => (
              <OpportunityCard key={opp.term} opportunity={opp} index={index} />
            ))}
          </motion.div>
        ) : (
          <div className={cn(GLASS_CARD, 'p-10 text-center')}>
            <Search className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
              No opportunities found
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Check back later for new market opportunities.
            </p>
          </div>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 2: MARKET BENCHMARKS                                      */}
      {/* ================================================================= */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
            >
              <BarChart3 className="w-5 h-5" style={{ color: PRIMARY }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Market Benchmarks
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Pricing and performance benchmarks by product type
              </p>
            </div>
          </div>

          {/* Product type filter */}
          <div className="sm:ml-auto flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select
              value={productTypeFilter}
              onChange={(e) => setProductTypeFilter(e.target.value)}
              className={cn(
                'text-sm rounded-xl px-3 py-2 border border-neutral-200 dark:border-neutral-700',
                'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl',
                'text-neutral-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/40',
                'appearance-none cursor-pointer min-w-[180px]'
              )}
            >
              <option value="">All Product Types</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loadingBenchmarks ? (
          <BenchmarksSkeleton />
        ) : benchmarks && benchmarks.length > 0 ? (
          <div className="space-y-6">
            {/* Benchmark Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {benchmarks.map((benchmark) => (
                <BenchmarkCard key={benchmark.id} benchmark={benchmark} />
              ))}
            </motion.div>

            {/* Price Distribution Bar Chart */}
            {priceChartData.length > 0 && (
              <motion.div variants={itemVariants} className={cn(GLASS_CARD, 'p-6')}>
                <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">
                  Price Distribution by Product Type
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5">
                  Comparing average, median, minimum, and maximum prices
                </p>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priceChartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-neutral-200 dark:text-neutral-700"
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-neutral-500 dark:text-neutral-400"
                        angle={-20}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-neutral-500 dark:text-neutral-400"
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip content={<PriceChartTooltip />} />
                      <Bar
                        dataKey="min"
                        name="Min"
                        fill="#94A3B8"
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                      <Bar
                        dataKey="median"
                        name="Median"
                        fill={ACCENT}
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                      <Bar
                        dataKey="average"
                        name="Average"
                        fill={PRIMARY}
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                      <Bar
                        dataKey="max"
                        name="Max"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        barSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4">
                  {[
                    { label: 'Min', color: '#94A3B8' },
                    { label: 'Median', color: ACCENT },
                    { label: 'Average', color: PRIMARY },
                    { label: 'Max', color: '#10B981' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <span
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className={cn(GLASS_CARD, 'p-10 text-center')}>
            <BarChart3 className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
              No benchmarks available
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Benchmark data will appear once enough products are in the marketplace.
            </p>
          </div>
        )}
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 3: SALES FORECAST                                         */}
      {/* ================================================================= */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
            >
              <TrendingUp className="w-5 h-5" style={{ color: PRIMARY }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Sales Forecast
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Projected revenue and sales for the next period
              </p>
            </div>
          </div>

          {/* Forecast days selector */}
          <div className="sm:ml-auto flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            {[7, 14, 30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setForecastDays(days)}
                className={cn(
                  'relative z-10 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  forecastDays === days
                    ? 'text-white'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                )}
              >
                {forecastDays === days && (
                  <motion.div
                    layoutId="forecast-tab"
                    className="absolute inset-0 rounded-md"
                    style={{ background: PRIMARY }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{days}d</span>
              </button>
            ))}
          </div>
        </div>

        {loadingForecast ? (
          <ForecastSkeleton />
        ) : forecast ? (
          <div className={cn(GLASS_CARD, 'p-6 space-y-6')}>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Projected Revenue */}
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-200/40 dark:border-neutral-700/40">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Projected Revenue
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(forecast.projectedRevenue)}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  {forecast.forecastDays}-day forecast
                </p>
              </div>

              {/* Projected Sales */}
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-200/40 dark:border-neutral-700/40">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Projected Sales
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {forecast.projectedSales.toLocaleString()}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  estimated units
                </p>
              </div>

              {/* Confidence Interval */}
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-200/40 dark:border-neutral-700/40">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                  Confidence Range
                </p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {formatCurrency(forecast.confidenceInterval.low)}
                  <span className="text-sm font-normal text-neutral-400 mx-1">-</span>
                  {formatCurrency(forecast.confidenceInterval.high)}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                  revenue range
                </p>
              </div>
            </div>

            {/* Line Chart */}
            {forecastChartData.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-white mb-4">
                  Daily Revenue Projection
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastChartData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        className="text-neutral-200 dark:text-neutral-700"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-neutral-500 dark:text-neutral-400"
                        tickFormatter={(value) => {
                          const d = new Date(value);
                          return `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`;
                        }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        className="text-neutral-500 dark:text-neutral-400"
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip content={<ForecastChartTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={PRIMARY}
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: PRIMARY,
                          stroke: '#fff',
                          strokeWidth: 2,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Assumptions */}
            {forecast.assumptions && forecast.assumptions.length > 0 && (
              <div className="rounded-xl bg-neutral-50 dark:bg-neutral-800/50 p-4 border border-neutral-200/40 dark:border-neutral-700/40">
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">
                  Forecast Assumptions
                </p>
                <ul className="space-y-1.5">
                  {forecast.assumptions.map((assumption, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-2"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ backgroundColor: PRIMARY }}
                      />
                      {assumption}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className={cn(GLASS_CARD, 'p-10 text-center')}>
            <TrendingUp className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
              No forecast data
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Sales forecast will be available once you have sales history.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
