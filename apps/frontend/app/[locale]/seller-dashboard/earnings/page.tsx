'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Download,
  CreditCard,
  Banknote,
} from 'lucide-react';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';
import { useSellerEarnings, useSellerPayouts } from '@/hooks/use-sellers';
import {
  PAYOUT_STATUS_LABELS,
  PAYOUT_STATUS_COLORS,
  PayoutStatus,
} from '@/types/seller';
import type { SellerPayout } from '@/types/seller';
import { toast } from 'sonner';

// ─── Animated Number Component ────────────────────────────────────────────────

function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = displayed;
    const end = value;
    const duration = 1200;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(start + (end - start) * eased);
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    }
    ref.current = requestAnimationFrame(animate);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span className={className}>
      {prefix}
      {displayed.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

// ─── Mock Chart Data Generator ────────────────────────────────────────────────

const MONTH_LABELS = [
  'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
  'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb',
];

function generateChartData(period: string, commissionRate: number) {
  const feeRate = commissionRate / 100;
  const keepRate = 1 - feeRate;

  const baseData = MONTH_LABELS.map((month) => {
    const gross = Math.round(400 + Math.random() * 1200);
    return {
      month,
      earnings: Math.round(gross * keepRate),
      platformFee: Math.round(gross * feeRate),
    };
  });

  switch (period) {
    case '7d':
      return baseData.slice(-1).map((d) => ({
        ...d,
        earnings: Math.round(d.earnings * 0.25),
        platformFee: Math.round(d.platformFee * 0.25),
      }));
    case '30d':
      return baseData.slice(-1);
    case '90d':
      return baseData.slice(-3);
    case '1y':
    default:
      return baseData;
  }
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl px-4 py-3 shadow-2xl">
      <p className="text-xs font-medium text-zinc-400 mb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-300">{entry.name}:</span>
          <span className="font-semibold text-white">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function EarningsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <Skeleton className="h-56 w-full rounded-2xl" />
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      {/* Chart skeleton */}
      <Skeleton className="h-80 rounded-2xl" />
      {/* Bottom row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      {/* Table skeleton */}
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

// ─── Stagger Animation Variants ───────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SellerEarningsPage() {
  const { data: earnings, isLoading: loadingEarnings } = useSellerEarnings();
  const { data: payouts, isLoading: loadingPayouts } = useSellerPayouts();
  const [chartPeriod, setChartPeriod] = useState('1y');

  const commissionRate = Number(earnings?.commissionRate ?? 20);
  const keepPercent = 100 - commissionRate;
  const totalRevenue = earnings?.totalRevenue ?? 0;
  const pendingPayout = earnings?.pendingPayout ?? 0;
  const availableBalance = totalRevenue - pendingPayout;

  const chartData = useMemo(
    () => generateChartData(chartPeriod, commissionRate),
    [chartPeriod, commissionRate],
  );

  const pieData = useMemo(
    () => [
      { name: 'Your Earnings', value: keepPercent },
      { name: 'Platform Fee', value: commissionRate },
    ],
    [keepPercent, commissionRate],
  );

  const payoutList: SellerPayout[] = useMemo(
    () => (Array.isArray(payouts) ? payouts : []),
    [payouts],
  );

  // Monthly mock earnings for KPI
  const thisMonthEarnings = useMemo(() => {
    const lastMonth = chartData[chartData.length - 1];
    return lastMonth?.earnings ?? 0;
  }, [chartData]);

  const avgOrderValue = useMemo(() => {
    const totalSales = earnings?.totalSales ?? 1;
    return totalRevenue / Math.max(totalSales, 1);
  }, [totalRevenue, earnings?.totalSales]);

  // Payout progress mock: assume current period is Feb 1-28, today is Feb 9
  const payoutProgressPercent = 32; // ~9/28 days

  if (loadingEarnings || loadingPayouts) {
    return (
      <div className="px-1">
        <EarningsSkeleton />
      </div>
    );
  }

  function handleCopyStripeId(id: string) {
    navigator.clipboard.writeText(id);
    toast.success('Stripe transfer ID copied');
  }

  function handleExportPayouts() {
    if (!payoutList.length) {
      toast.error('No payouts to export');
      return;
    }
    const headers = ['Period', 'Gross', 'Platform Fee', 'Net', 'Items', 'Status', 'Stripe ID'];
    const rows = payoutList.map((p) => [
      `${new Date(p.periodStart).toLocaleDateString()} - ${new Date(p.periodEnd).toLocaleDateString()}`,
      p.amount.toFixed(2),
      p.platformFee.toFixed(2),
      p.netAmount.toFixed(2),
      String(p.itemCount),
      PAYOUT_STATUS_LABELS[p.status] ?? p.status,
      p.stripeTransferId ?? '',
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payouts-export.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Payouts exported as CSV');
  }

  const PIE_COLORS = ['#1E4DB7', '#a1a1aa'];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 px-1"
    >
      {/* ═══════════════════ 1. EARNINGS OVERVIEW HERO ═══════════════════ */}
      <motion.div
        variants={item}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/10',
          'bg-gradient-to-br from-[#1E4DB7]/5 via-zinc-900/60 to-transparent',
          'backdrop-blur-xl p-6 sm:p-8',
        )}
      >
        {/* Decorative pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-400 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Available Balance
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              <AnimatedNumber value={availableBalance} prefix="$" />
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Clock className="h-3.5 w-3.5" />
                Pending Clearance:{' '}
                <AnimatedNumber
                  value={pendingPayout}
                  prefix="$"
                  className="font-semibold"
                />
              </span>
              <span className="text-zinc-500">|</span>
              <span className="text-zinc-400">
                Lifetime Earnings:{' '}
                <AnimatedNumber
                  value={totalRevenue}
                  prefix="$"
                  className="font-medium text-zinc-300"
                />
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Next payout: ~$
              {Math.round(pendingPayout * 0.8).toLocaleString()} on Feb 15
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              className={cn(
                'relative overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-white',
                'bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]',
                'hover:from-[#2358ca] hover:to-[#1a4aad]',
                'shadow-lg shadow-[#1E4DB7]/20 transition-all duration-300',
              )}
            >
              {/* Shimmer overlay */}
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Withdraw Funds
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════ 2. MINI KPI CARDS ══════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "This Month's Earnings",
            value: thisMonthEarnings,
            prefix: '$',
            trend: '+12.4%',
            trendUp: true,
            icon: DollarSign,
            gradient: 'from-emerald-500 to-emerald-700',
          },
          {
            label: 'Average Order Value',
            value: avgOrderValue,
            prefix: '$',
            trend: '+3.8%',
            trendUp: true,
            icon: CreditCard,
            gradient: 'from-[#1E4DB7] to-[#143A8F]',
          },
          {
            label: 'Commission Rate',
            value: commissionRate,
            suffix: '%',
            decimals: 1,
            subtitle: `You keep ${keepPercent}%`,
            icon: TrendingUp,
            gradient: 'from-[#F59A23] to-amber-600',
          },
        ].map((kpi, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className={cn(
              'relative rounded-2xl border border-white/10',
              'bg-zinc-900/50 backdrop-blur-xl p-5',
              'hover:border-white/20 transition-colors duration-300',
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  {kpi.label}
                </p>
                <h3 className="text-2xl font-bold text-white">
                  <AnimatedNumber
                    value={kpi.value}
                    prefix={kpi.prefix}
                    suffix={kpi.suffix}
                    decimals={kpi.decimals ?? 2}
                  />
                </h3>
                {kpi.trend && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      kpi.trendUp ? 'text-emerald-400' : 'text-red-400',
                    )}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {kpi.trend} vs last month
                  </span>
                )}
                {kpi.subtitle && (
                  <span className="text-xs text-zinc-500">{kpi.subtitle}</span>
                )}
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  'bg-gradient-to-br shadow-lg',
                  kpi.gradient,
                )}
              >
                <kpi.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══════════════════ 3. EARNINGS CHART ══════════════════════════ */}
      <motion.div
        variants={item}
        className={cn(
          'rounded-2xl border border-white/10',
          'bg-zinc-900/50 backdrop-blur-xl p-6',
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-white">
            Earnings Breakdown
          </h3>
          <div className="flex items-center gap-1 rounded-lg bg-zinc-800/80 p-1">
            {['7d', '30d', '90d', '1y'].map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  chartPeriod === p
                    ? 'bg-[#1E4DB7] text-white shadow-md'
                    : 'text-zinc-400 hover:text-white',
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={chartPeriod}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-72"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  axisLine={{ stroke: '#3f3f46' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar
                  dataKey="earnings"
                  name="Your Earnings"
                  stackId="a"
                  fill="#22c55e"
                  radius={[0, 0, 0, 0]}
                  animationDuration={800}
                />
                <Bar
                  dataKey="platformFee"
                  name="Platform Fee"
                  stackId="a"
                  fill="#71717a"
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ═══════════════════ 4 & 5. PIE CHART + UPCOMING PAYOUT ═════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Breakdown Donut */}
        <motion.div
          variants={item}
          className={cn(
            'rounded-2xl border border-white/10',
            'bg-zinc-900/50 backdrop-blur-xl p-6',
          )}
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Commission Breakdown
          </h3>
          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  animationDuration={1000}
                  stroke="none"
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx]} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value: string) => (
                    <span className="text-sm text-zinc-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center -mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{keepPercent}%</p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Yours</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Upcoming Payout Card */}
        <motion.div
          variants={item}
          className={cn(
            'rounded-2xl border border-white/10',
            'bg-zinc-900/50 backdrop-blur-xl p-6',
            'flex flex-col justify-between',
          )}
        >
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Next Estimated Payout
            </h3>
            <p className="text-xs text-zinc-500 mb-6">Based on your current earnings cycle</p>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  <AnimatedNumber
                    value={Math.round(pendingPayout * 0.8)}
                    prefix="$"
                  />
                </span>
                <span className="text-sm text-zinc-400">estimated</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <Calendar className="h-4 w-4 text-[#1E4DB7]" />
                February 15, 2026
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>Feb 1</span>
                  <span>Feb 28</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${payoutProgressPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]"
                  />
                </div>
                <p className="text-xs text-zinc-500 text-right">
                  {payoutProgressPercent}% through payout period
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Payout Schedule</span>
              <Badge className="bg-[#1E4DB7]/20 text-[#6B9BFA] border-[#1E4DB7]/30 text-xs">
                Monthly
              </Badge>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════ 6. PAYOUT HISTORY TABLE ════════════════════ */}
      <motion.div
        variants={item}
        className={cn(
          'rounded-2xl border border-white/10',
          'bg-zinc-900/50 backdrop-blur-xl overflow-hidden',
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Payout History</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPayouts}
            className="gap-2 border-white/10 text-zinc-300 hover:bg-white/5"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {payoutList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider border-b border-white/5">
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Gross Amount</th>
                  <th className="px-6 py-3">Platform Fee</th>
                  <th className="px-6 py-3">Net Amount</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Stripe ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payoutList.map((payout) => (
                  <tr
                    key={payout.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-zinc-300">
                        {new Date(payout.periodStart).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        -{' '}
                        {new Date(payout.periodEnd).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-xs text-zinc-600 mt-0.5">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-200">
                      ${Number(payout.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      -${Number(payout.platformFee).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400">
                      ${Number(payout.netAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {payout.itemCount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                          PAYOUT_STATUS_COLORS[payout.status] ?? '',
                        )}
                      >
                        {payout.status === PayoutStatus.COMPLETED && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {payout.status === PayoutStatus.FAILED && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
                      </span>
                      {payout.status === PayoutStatus.FAILED && payout.failureReason && (
                        <p className="mt-1 text-xs text-red-400">
                          {payout.failureReason}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payout.stripeTransferId ? (
                        <button
                          onClick={() =>
                            handleCopyStripeId(payout.stripeTransferId!)
                          }
                          title="Click to copy"
                          className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                        >
                          {payout.stripeTransferId.length > 16
                            ? `${payout.stripeTransferId.slice(0, 8)}...${payout.stripeTransferId.slice(-6)}`
                            : payout.stripeTransferId}
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-600">--</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 mb-4">
              <Wallet className="h-7 w-7 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-400 mb-1">
              No payouts yet
            </p>
            <p className="text-xs text-zinc-600 text-center max-w-xs">
              Start selling to earn! Your payout history will appear here once
              you receive your first payment.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
