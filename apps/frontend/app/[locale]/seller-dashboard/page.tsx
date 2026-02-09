'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Star,
  Package,
  ArrowRight,
  Plus,
  BarChart3,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button, Skeleton, Badge } from '@ktblog/ui/components';
import { useMySellerProfile, useSellerEarnings } from '../../../hooks/use-sellers';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PRIMARY = '#1E4DB7';
const SECONDARY = '#143A8F';
const ACCENT = '#F59A23';

const GLASS =
  'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const PERIOD_OPTIONS = ['7d', '30d', '90d', '1y'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

// ---------------------------------------------------------------------------
// AnimatedNumber
// ---------------------------------------------------------------------------
function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, decimals]);

  const display = decimals > 0 ? count.toFixed(decimals) : count.toLocaleString();

  return (
    <span>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Mock data generators
// ---------------------------------------------------------------------------
function generateRevenueData(period: Period) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    const month = date.toLocaleString('en', { month: 'short' });
    const day = date.getDate();
    return {
      label: days <= 30 ? `${month} ${day}` : `${month} ${day}`,
      revenue: Math.floor(Math.random() * 450 + 50),
    };
  });
}

const SPARKLINE_DATA = Array.from({ length: 12 }, (_, i) => ({
  v: Math.floor(Math.random() * 80 + 20),
}));

const MOCK_ORDERS = [
  { id: '1', customer: 'Sarah Johnson', initials: 'SJ', product: 'Excel Financial Model Pro', amount: 79.99, time: '2 hours ago', status: 'completed' as const },
  { id: '2', customer: 'Mark Chen', initials: 'MC', product: 'Budget Tracker Template', amount: 34.99, time: '4 hours ago', status: 'processing' as const },
  { id: '3', customer: 'Emily Davis', initials: 'ED', product: 'Project Dashboard Kit', amount: 49.99, time: '6 hours ago', status: 'completed' as const },
  { id: '4', customer: 'James Wilson', initials: 'JW', product: 'KPI Reporting Bundle', amount: 129.99, time: '8 hours ago', status: 'pending' as const },
  { id: '5', customer: 'Lisa Park', initials: 'LP', product: 'Data Analytics Suite', amount: 89.99, time: '12 hours ago', status: 'completed' as const },
];

const MOCK_PRODUCTS = [
  { id: '1', name: 'Excel Financial Model Pro', revenue: 4280, sales: 54, trend: 'up' as const },
  { id: '2', name: 'KPI Reporting Bundle', revenue: 3150, sales: 42, trend: 'up' as const },
  { id: '3', name: 'Data Analytics Suite', revenue: 2890, sales: 38, trend: 'stable' as const },
  { id: '4', name: 'Budget Tracker Template', revenue: 1720, sales: 49, trend: 'down' as const },
  { id: '5', name: 'Project Dashboard Kit', revenue: 1450, sales: 29, trend: 'up' as const },
];

const MOCK_ACTIVITY = [
  { id: '1', type: 'sale' as const, description: 'New sale: Excel Financial Model Pro', time: '15 minutes ago' },
  { id: '2', type: 'review' as const, description: 'New 5-star review on KPI Reporting Bundle', time: '1 hour ago' },
  { id: '3', type: 'payout' as const, description: 'Payout of $342.50 completed', time: '3 hours ago' },
  { id: '4', type: 'view' as const, description: 'Data Analytics Suite hit 10,000 views', time: '5 hours ago' },
  { id: '5', type: 'sale' as const, description: 'New sale: Budget Tracker Template', time: '6 hours ago' },
  { id: '6', type: 'review' as const, description: 'New 4-star review on Project Dashboard Kit', time: '8 hours ago' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getStatusColor(status: 'completed' | 'pending' | 'processing') {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500';
    case 'pending':
      return 'bg-amber-500';
    case 'processing':
      return 'bg-blue-500';
  }
}

function getStatusBadgeVariant(status: 'completed' | 'pending' | 'processing') {
  switch (status) {
    case 'completed':
      return 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40';
    case 'pending':
      return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40';
    case 'processing':
      return 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40';
  }
}

function getActivityIcon(type: 'sale' | 'review' | 'payout' | 'view') {
  switch (type) {
    case 'sale':
      return { icon: ShoppingCart, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/40' };
    case 'review':
      return { icon: Star, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/40' };
    case 'payout':
      return { icon: DollarSign, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/40' };
    case 'view':
      return { icon: Eye, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/40' };
  }
}

// ---------------------------------------------------------------------------
// Custom Recharts tooltip
// ---------------------------------------------------------------------------
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg border border-neutral-200/60 dark:border-neutral-700/60 px-3 py-2 shadow-lg">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
        ${payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stagger animation variants
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
// Skeleton loader
// ---------------------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome banner skeleton */}
      <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-5 w-60" />
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(GLASS_CARD, 'p-5 space-y-3')}>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>

      {/* Bottom sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
        <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / No-profile state
// ---------------------------------------------------------------------------
function NoProfileState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[60vh]"
    >
      <div className={cn(GLASS_CARD, 'max-w-lg w-full p-10 text-center relative overflow-hidden')}>
        {/* Gradient orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)` }} />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${ACCENT}, transparent)` }} />

        <div className="relative z-10">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
          >
            <Package className="w-10 h-10 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
            Start Selling on VivaExcel
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            Join our community of creators and start earning from your Excel templates,
            financial models, and data tools. Apply today and reach thousands of buyers.
          </p>

          <Link href="/become-a-seller">
            <Button
              className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
            >
              Become a Seller
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// =========================================================================
// MAIN PAGE COMPONENT
// =========================================================================
export default function SellerDashboardPage() {
  const { data: profile, isLoading: loadingProfile } = useMySellerProfile();
  const { data: earnings, isLoading: loadingEarnings } = useSellerEarnings();
  const [activePeriod, setActivePeriod] = useState<Period>('30d');

  // Revenue chart data
  const revenueData = useMemo(() => generateRevenueData(activePeriod), [activePeriod]);

  // Time-based greeting
  const greeting = useMemo(() => getGreeting(), []);

  // Derived values from real data
  const totalRevenue = earnings?.totalRevenue ?? 0;
  const totalSales = earnings?.totalSales ?? 0;
  const pendingPayout = earnings?.pendingPayout ?? 0;
  const averageRating = earnings?.averageRating ?? 0;
  const displayName = profile?.displayName ?? 'Seller';

  // Mock today's earnings (derived from total)
  const todayEarnings = useMemo(() => Math.floor(totalRevenue * 0.03), [totalRevenue]);
  const todaySales = useMemo(() => Math.max(1, Math.floor(totalSales * 0.02)), [totalSales]);

  // Period change handler
  const handlePeriodChange = useCallback((period: Period) => {
    setActivePeriod(period);
  }, []);

  // Quick action handlers
  const handleWithdraw = useCallback(() => {
    toast.info('Redirecting to withdrawal page...');
  }, []);

  // Loading state
  if (loadingProfile || loadingEarnings) {
    return <DashboardSkeleton />;
  }

  // No profile state
  if (!profile) {
    return <NoProfileState />;
  }

  // Top product revenue for percentage calculations
  const topProductRevenue = MOCK_PRODUCTS[0].revenue;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ================================================================= */}
      {/* SECTION 1: WELCOME BANNER                                         */}
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
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  {greeting}, {displayName}!
                </h1>
                <p className="mt-1.5 text-neutral-600 dark:text-neutral-400">
                  You earned{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    ${todayEarnings.toLocaleString()}
                  </span>{' '}
                  today from{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {todaySales} {todaySales === 1 ? 'sale' : 'sales'}
                  </span>
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    23% vs last week
                  </span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
              <Link href="/seller-dashboard/products">
                <Button
                  className="text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </Link>
              <Link href="/seller-dashboard/analytics">
                <Button
                  variant="outline"
                  className="rounded-xl border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/seller-dashboard/earnings">
                <Button
                  variant="outline"
                  className="rounded-xl border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={handleWithdraw}
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Withdraw Earnings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* SECTION 2: KPI CARDS                                              */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Revenue */}
        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Total Revenue
              </span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}
              >
                <DollarSign className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              <AnimatedNumber value={totalRevenue} prefix="$" decimals={2} />
            </p>
            {/* Sparkline */}
            <div className="h-[30px] w-[80px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={SPARKLINE_DATA}>
                  <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={PRIMARY}
                    strokeWidth={1.5}
                    fill="url(#sparkGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Total Orders */}
        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Total Orders
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
                <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              <AnimatedNumber value={totalSales} />
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +12 this week
            </p>
          </div>
        </motion.div>

        {/* Card 3: Average Rating */}
        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Average Rating
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/30">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              <AnimatedNumber value={Number(averageRating)} decimals={1} />
            </p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'w-3.5 h-3.5',
                    i < Math.round(Number(averageRating))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-neutral-300 dark:text-neutral-600'
                  )}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Card 4: Pending Payout */}
        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Pending Payout
              </span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white mb-1">
              <AnimatedNumber value={pendingPayout} prefix="$" decimals={2} />
            </p>
            <Link
              href="/seller-dashboard/earnings"
              className="text-xs font-medium flex items-center gap-1 hover:underline"
              style={{ color: PRIMARY }}
            >
              Withdraw <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 3: REVENUE CHART                                          */}
      {/* ================================================================= */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Revenue Overview
            </h2>

            {/* Period selector tabs */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 relative">
              {PERIOD_OPTIONS.map((period) => (
                <button
                  key={period}
                  onClick={() => handlePeriodChange(period)}
                  className={cn(
                    'relative z-10 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    activePeriod === period
                      ? 'text-white'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
                  )}
                >
                  {activePeriod === period && (
                    <motion.div
                      layoutId="period-tab"
                      className="absolute inset-0 rounded-md"
                      style={{ background: PRIMARY }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{period}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-neutral-500 dark:text-neutral-400"
                  interval={activePeriod === '7d' ? 0 : 'preserveStartEnd'}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-neutral-500 dark:text-neutral-400"
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={PRIMARY}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: PRIMARY, stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ================================================================= */}
      {/* SECTIONS 4 & 5: RECENT ORDERS + TOP PRODUCTS (side by side)       */}
      {/* ================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 4: RECENT ORDERS */}
        <motion.div variants={itemVariants}>
          <div className={cn(GLASS_CARD, 'p-6 h-full')}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Recent Orders
              </h2>
              <Link
                href="/seller-dashboard/orders"
                className="text-sm font-medium flex items-center gap-1 hover:underline"
                style={{ color: PRIMARY }}
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {MOCK_ORDERS.map((order, index) => (
                <motion.div
                  key={order.id}
                  variants={itemVariants}
                  custom={index}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Customer avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}
                  >
                    {order.initials}
                  </div>

                  {/* Order details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {order.customer}
                      </p>
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white flex-shrink-0">
                        ${order.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {order.product}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {order.time}
                        </span>
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full flex-shrink-0',
                            getStatusColor(order.status)
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* SECTION 5: TOP PRODUCTS */}
        <motion.div variants={itemVariants}>
          <div className={cn(GLASS_CARD, 'p-6 h-full')}>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">
              Top Products
            </h2>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {MOCK_PRODUCTS.map((product, index) => {
                const pct = Math.round((product.revenue / topProductRevenue) * 100);
                return (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    custom={index}
                    className="group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank */}
                      <span className="text-sm font-bold text-neutral-400 dark:text-neutral-500 w-5 text-right">
                        #{index + 1}
                      </span>

                      {/* Thumbnail placeholder */}
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                              ${product.revenue.toLocaleString()}
                            </span>
                            {product.trend === 'up' && (
                              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            )}
                            {product.trend === 'down' && (
                              <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            )}
                            {product.trend === 'stable' && (
                              <div className="w-3.5 h-0.5 bg-neutral-400 rounded" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})` }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                            />
                          </div>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 flex-shrink-0">
                            {product.sales} sales
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 6: ACTIVITY FEED                                          */}
      {/* ================================================================= */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">
            Recent Activity
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-1"
          >
            {MOCK_ACTIVITY.map((activity, index) => {
              const { icon: ActivityIcon, color, bg } = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  variants={itemVariants}
                  custom={index}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', bg)}>
                      <ActivityIcon className={cn('w-4 h-4', color)} />
                    </div>
                    {index < MOCK_ACTIVITY.length - 1 && (
                      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mt-1" />
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-sm text-neutral-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
