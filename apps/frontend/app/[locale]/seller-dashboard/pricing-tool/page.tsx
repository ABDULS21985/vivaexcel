'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { cn, Button, Badge } from '@ktblog/ui/components';
import { useMarketBenchmarks, useSalesForecast } from '@/hooks/use-seller-growth';
import type { PricingAnalysis, MarketBenchmark } from '@/hooks/use-seller-growth';
import { apiGet, apiPatch } from '@/lib/api-client';
import { toast } from 'sonner';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRIMARY = '#1E4DB7';
const GLASS =
  'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const CHART_COLORS = {
  seller: '#1E4DB7',
  average: '#8B5CF6',
  median: '#F59A23',
  topSeller: '#10B981',
};

const POSITION_CONFIG = {
  underpriced: {
    label: 'Underpriced',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    icon: AlertTriangle,
    description: 'Your price is below the market average. You may be leaving revenue on the table.',
  },
  competitive: {
    label: 'Competitive',
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    icon: CheckCircle,
    description: 'Your pricing is well-positioned within the market range.',
  },
  overpriced: {
    label: 'Overpriced',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: AlertTriangle,
    description: 'Your price is above the market average. This may affect conversion rates.',
  },
};

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ─── Types ──────────────────────────────────────────────────────────────────

interface SellerProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  status: 'published' | 'draft' | 'archived';
  type: string;
  categoryId?: string;
  featuredImage?: string;
}

interface ProductsResponse {
  status: string;
  data: SellerProduct[];
  meta?: { total?: number };
}

interface PricingAnalysisResponse {
  status: string;
  data: PricingAnalysis;
}

// ─── Skeleton Components ────────────────────────────────────────────────────

function PricingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Price comparison skeleton */}
      <div className={cn(GLASS_CARD, 'p-6')}>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
          <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </div>
      </div>

      {/* Chart skeleton */}
      <div className={cn(GLASS_CARD, 'p-6')}>
        <div className="h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded mb-6" />
        <div className="h-64 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
      </div>

      {/* Reasoning skeleton */}
      <div className={cn(GLASS_CARD, 'p-6 space-y-3')}>
        <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-full bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-4/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="h-3 w-3/5 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>
    </div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-3 shadow-lg">
      <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
        {label}
      </p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-sm text-neutral-600 dark:text-neutral-400">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          ${entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function PricingToolPage() {
  const queryClient = useQueryClient();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Fetch seller's published products
  const {
    data: productsData,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['seller', 'my-products', 'published'],
    queryFn: () =>
      apiGet<ProductsResponse>('/products/my-products', { status: 'published' }),
    select: (res) => res.data,
  });

  const products = productsData ?? [];
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null;

  // Fetch pricing analysis for the selected product
  const {
    data: pricingAnalysis,
    isLoading: analysisLoading,
    refetch: refetchAnalysis,
    isFetching: analysisRefetching,
  } = useQuery({
    queryKey: ['seller-growth', 'pricing-analysis', selectedProductId],
    queryFn: () =>
      apiGet<PricingAnalysisResponse>(
        '/seller-growth/market/pricing-analysis',
        { productId: selectedProductId! },
      ),
    enabled: !!selectedProductId,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });

  // Fetch market benchmarks for the selected product's category
  const { data: benchmarks } = useMarketBenchmarks(
    selectedProduct?.categoryId
      ? { categoryId: selectedProduct.categoryId }
      : undefined,
  );

  // Fetch sales forecast for context
  const { data: forecast } = useSalesForecast(30);

  // Apply suggested price mutation
  const applyPriceMutation = useMutation({
    mutationFn: (data: { productId: string; price: number }) =>
      apiPatch<{ status: string; data: any }>(`/products/${data.productId}`, {
        price: data.price,
      }),
    onSuccess: () => {
      toast.success('Price updated successfully');
      queryClient.invalidateQueries({ queryKey: ['seller', 'my-products'] });
      queryClient.invalidateQueries({
        queryKey: ['seller-growth', 'pricing-analysis', selectedProductId],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update price');
    },
  });

  // Build chart data from pricing analysis and benchmarks
  const chartData = pricingAnalysis
    ? [
        {
          name: 'Your Price',
          value: pricingAnalysis.currentPrice,
          color: CHART_COLORS.seller,
        },
        {
          name: 'Avg Price',
          value:
            benchmarks?.[0]?.averagePrice ??
            (pricingAnalysis.currentPrice + pricingAnalysis.suggestedPrice) / 2,
          color: CHART_COLORS.average,
        },
        {
          name: 'Median Price',
          value: benchmarks?.[0]?.medianPrice ?? pricingAnalysis.suggestedPrice,
          color: CHART_COLORS.median,
        },
        {
          name: 'Top Seller Avg',
          value:
            benchmarks?.[0]?.topSellerMetrics?.avgPrice ??
            pricingAnalysis.suggestedPrice * 1.1,
          color: CHART_COLORS.topSeller,
        },
      ]
    : [];

  const positionConfig = pricingAnalysis
    ? POSITION_CONFIG[pricingAnalysis.competitivePosition]
    : null;

  const PositionIcon = positionConfig?.icon ?? CheckCircle;

  const handleApplyPrice = () => {
    if (!pricingAnalysis || !selectedProductId) return;
    applyPriceMutation.mutate({
      productId: selectedProductId,
      price: pricingAnalysis.suggestedPrice,
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 max-w-4xl"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Pricing Tool
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Analyze your product pricing against market benchmarks and get AI-powered
          suggestions to optimize revenue.
        </p>
      </motion.div>

      {/* Product Selector */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/30">
              <DollarSign className="w-5 h-5" style={{ color: PRIMARY }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Select a Product
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Choose a published product to analyze its pricing
              </p>
            </div>
          </div>

          {productsLoading ? (
            <div className="h-11 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
              </div>
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                No published products found
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Publish a product first to use the pricing tool.
              </p>
            </div>
          ) : (
            <select
              value={selectedProductId ?? ''}
              onChange={(e) => setSelectedProductId(e.target.value || null)}
              className="w-full h-11 px-4 text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 transition-shadow appearance-none cursor-pointer"
            >
              <option value="">-- Select a product --</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title} &mdash; ${product.price.toFixed(2)}
                </option>
              ))}
            </select>
          )}
        </div>
      </motion.div>

      {/* Analysis Section */}
      {selectedProductId && (
        <>
          {analysisLoading ? (
            <motion.div variants={itemVariants}>
              <PricingSkeleton />
            </motion.div>
          ) : pricingAnalysis ? (
            <>
              {/* Current Price vs Suggested Price */}
              <motion.div variants={itemVariants}>
                <div className={cn(GLASS_CARD, 'p-6')}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                      Price Comparison
                    </h3>
                    <button
                      onClick={() => refetchAnalysis()}
                      disabled={analysisRefetching}
                      className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      title="Refresh analysis"
                    >
                      <RefreshCw
                        className={cn(
                          'w-4 h-4 text-neutral-500 dark:text-neutral-400',
                          analysisRefetching && 'animate-spin',
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-6 sm:gap-10">
                    {/* Current Price */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                        Current Price
                      </p>
                      <p className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white">
                        <span className="text-xl align-top">$</span>
                        {pricingAnalysis.currentPrice.toFixed(2)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                      >
                        <ArrowRight
                          className="w-8 h-8"
                          style={{ color: PRIMARY }}
                        />
                      </motion.div>
                    </div>

                    {/* Suggested Price */}
                    <div className="text-center">
                      <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">
                        Suggested Price
                      </p>
                      <p className="text-4xl sm:text-5xl font-bold" style={{ color: PRIMARY }}>
                        <span className="text-xl align-top">$</span>
                        {pricingAnalysis.suggestedPrice.toFixed(2)}
                      </p>
                      {pricingAnalysis.priceRange && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                          Range: ${pricingAnalysis.priceRange.min.toFixed(2)} &ndash; $
                          {pricingAnalysis.priceRange.max.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price difference indicator */}
                  {pricingAnalysis.currentPrice !== pricingAnalysis.suggestedPrice && (
                    <div className="mt-4 text-center">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full',
                          pricingAnalysis.suggestedPrice > pricingAnalysis.currentPrice
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                        )}
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        {pricingAnalysis.suggestedPrice > pricingAnalysis.currentPrice
                          ? '+'
                          : ''}
                        $
                        {(
                          pricingAnalysis.suggestedPrice - pricingAnalysis.currentPrice
                        ).toFixed(2)}{' '}
                        (
                        {pricingAnalysis.currentPrice > 0
                          ? (
                              ((pricingAnalysis.suggestedPrice -
                                pricingAnalysis.currentPrice) /
                                pricingAnalysis.currentPrice) *
                              100
                            ).toFixed(1)
                          : '0.0'}
                        %)
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Market Comparison Chart */}
              <motion.div variants={itemVariants}>
                <div className={cn(GLASS_CARD, 'p-6')}>
                  <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
                    Market Comparison
                  </h3>

                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                        barCategoryGap="20%"
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="currentColor"
                          className="text-neutral-200 dark:text-neutral-700"
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 12 }}
                          className="text-neutral-500 dark:text-neutral-400"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          className="text-neutral-500 dark:text-neutral-400"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<ChartTooltip />} cursor={false} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={64}>
                          {chartData.map((entry, index) => (
                            <Cell key={index} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Chart legend */}
                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
                    {chartData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Competitive Position + Confidence */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Competitive Position Badge */}
                  <div className={cn(GLASS_CARD, 'p-6')}>
                    <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                      Competitive Position
                    </h3>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center',
                          positionConfig?.color,
                        )}
                      >
                        <PositionIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <Badge
                          className={cn(
                            'text-sm font-semibold px-3 py-1',
                            positionConfig?.color,
                          )}
                        >
                          {positionConfig?.label}
                        </Badge>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 max-w-xs">
                          {positionConfig?.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Score */}
                  <div className={cn(GLASS_CARD, 'p-6')}>
                    <h3 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                      Confidence Score
                    </h3>
                    <div className="flex items-end gap-3">
                      <p
                        className="text-4xl font-bold"
                        style={{ color: PRIMARY }}
                      >
                        {Math.round(pricingAnalysis.confidenceScore)}%
                      </p>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-3 w-full h-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(pricingAnalysis.confidenceScore, 100)}%`,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(to right, ${PRIMARY}, #10B981)`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">
                      Based on {benchmarks?.[0]?.sampleSize ?? 'N/A'} comparable products in the market
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* AI Reasoning */}
              <motion.div variants={itemVariants}>
                <div className={cn(GLASS_CARD, 'p-6')}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/30">
                      <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        AI Reasoning
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Why we suggest this price
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-700/50">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {pricingAnalysis.reasoning}
                    </p>
                  </div>

                  {/* Forecast context */}
                  {forecast && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>
                        Projected revenue over next {forecast.forecastDays} days:{' '}
                        <strong className="text-neutral-700 dark:text-neutral-300">
                          ${forecast.projectedRevenue.toLocaleString()}
                        </strong>{' '}
                        ({forecast.projectedSales} sales)
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Apply Price CTA */}
              <motion.div variants={itemVariants}>
                <div className={cn(GLASS_CARD, 'p-6')}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
                        Apply Suggested Price
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Update <strong>{selectedProduct?.title}</strong> from $
                        {pricingAnalysis.currentPrice.toFixed(2)} to $
                        {pricingAnalysis.suggestedPrice.toFixed(2)}
                      </p>
                    </div>
                    <Button
                      onClick={handleApplyPrice}
                      disabled={
                        applyPriceMutation.isPending ||
                        pricingAnalysis.currentPrice === pricingAnalysis.suggestedPrice
                      }
                      className="rounded-xl px-6 h-11 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                      style={{ backgroundColor: PRIMARY }}
                    >
                      {applyPriceMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Applying...
                        </>
                      ) : pricingAnalysis.currentPrice ===
                        pricingAnalysis.suggestedPrice ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Price is Optimal
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Apply Suggested Price
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            /* Error / no data fallback */
            <motion.div variants={itemVariants}>
              <div className={cn(GLASS_CARD, 'p-10 text-center')}>
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
                </div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Unable to load pricing analysis
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Please try again or select a different product.
                </p>
                <Button
                  onClick={() => refetchAnalysis()}
                  variant="outline"
                  className="mt-4 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
