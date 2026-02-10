'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  DollarSign,
  MousePointerClick,
  TrendingUp,
  Wallet,
  ArrowRight,
  Link2,
  ShoppingCart,
  Award,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button, Skeleton, Badge } from '@ktblog/ui/components';
import {
  useMyAffiliateProfile,
  useAffiliateStats,
  useAffiliateEarnings,
  useAffiliateLinks,
} from '@/hooks/use-affiliates';
import { AffiliateTier } from '@/types/affiliate';

// ─── Constants ──────────────────────────────────────────────────────────────

const PRIMARY = '#1E4DB7';
const SECONDARY = '#143A8F';
const ACCENT = '#F59A23';

const GLASS =
  'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const PERIOD_OPTIONS = ['7d', '30d', '90d', '1y'] as const;
type Period = (typeof PERIOD_OPTIONS)[number];

const TIER_CONFIG: Record<string, { next: string | null; threshold: number; nextThreshold: number | null }> = {
  standard: { next: 'Silver', threshold: 0, nextThreshold: 1000 },
  silver: { next: 'Gold', threshold: 1000, nextThreshold: 5000 },
  gold: { next: 'Platinum', threshold: 5000, nextThreshold: 25000 },
  platinum: { next: null, threshold: 25000, nextThreshold: null },
};

// ─── AnimatedNumber ─────────────────────────────────────────────────────────

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
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
  return <span>{prefix}{display}</span>;
}

// ─── Chart Data ─────────────────────────────────────────────────────────────

function generateCommissionData(period: Period) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));
    return {
      label: `${date.toLocaleString('en', { month: 'short' })} ${date.getDate()}`,
      commission: Math.floor(Math.random() * 120 + 10),
    };
  });
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

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

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const cardHover = { scale: 1.02, transition: { duration: 0.2 } };

// ─── Skeleton ───────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
        <Skeleton className="h-8 w-80" />
        <Skeleton className="h-5 w-60" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={cn(GLASS_CARD, 'p-5 space-y-3')}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
      <div className={cn(GLASS_CARD, 'p-6 space-y-4')}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function AffiliateDashboardPage() {
  const { data: profile, isLoading: loadingProfile } = useMyAffiliateProfile();
  const { data: stats } = useAffiliateStats();
  const { data: earnings } = useAffiliateEarnings();
  const { data: linksData } = useAffiliateLinks({ limit: 5 });
  const [activePeriod, setActivePeriod] = useState<Period>('30d');

  const chartData = useMemo(() => generateCommissionData(activePeriod), [activePeriod]);

  const totalEarned = earnings?.total ?? 0;
  const pendingBalance = earnings?.pending ?? 0;
  const availableBalance = earnings?.available ?? 0;
  const paidOut = earnings?.paid ?? 0;

  const lifetimeRevenue = profile?.lifetimeRevenue ?? 0;
  const commissionRate = profile?.commissionRate ?? 10;
  const currentTier = profile?.tier ?? AffiliateTier.STANDARD;
  const tierInfo = TIER_CONFIG[currentTier] ?? TIER_CONFIG.standard;

  const tierProgress = tierInfo.nextThreshold
    ? Math.min(100, Math.round((lifetimeRevenue / tierInfo.nextThreshold) * 100))
    : 100;

  const topLinks = linksData?.items?.slice(0, 5) ?? [];

  if (loadingProfile) return <DashboardSkeleton />;

  if (!profile) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center min-h-[60vh]">
        <div className={cn(GLASS_CARD, 'max-w-lg w-full p-10 text-center relative overflow-hidden')}>
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)` }} />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}>
              <TrendingUp className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">Become an Affiliate</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">Join our affiliate program and earn commissions on every sale you refer.</p>
            <Link href="/affiliate">
              <Button className="px-8 py-3 text-white font-semibold rounded-xl shadow-lg" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}>
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome Banner */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'relative overflow-hidden')} style={{ borderTop: `3px solid ${ACCENT}` }}>
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-[0.07] -translate-y-1/2 translate-x-1/3" style={{ background: `radial-gradient(circle, ${PRIMARY}, transparent)` }} />
          <div className="relative z-10 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                  Affiliate Dashboard
                </h1>
                <p className="mt-1.5 text-neutral-600 dark:text-neutral-400">
                  Your commission rate:{' '}
                  <span className="font-semibold text-neutral-900 dark:text-white">{commissionRate}%</span>
                  {' '}({currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Tier)
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/affiliate/links">
                  <Button className="text-white font-medium rounded-xl shadow-md" style={{ background: `linear-gradient(135deg, ${PRIMARY}, ${SECONDARY})` }}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Create Link
                  </Button>
                </Link>
                <Link href="/affiliate/payouts">
                  <Button variant="outline" className="rounded-xl border-neutral-300 dark:border-neutral-600">
                    <Wallet className="w-4 h-4 mr-2" />
                    View Payouts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Earned</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${PRIMARY}40)` }}>
                <DollarSign className="w-5 h-5" style={{ color: PRIMARY }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              <AnimatedNumber value={totalEarned} prefix="$" decimals={2} />
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Pending</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/30">
                <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              <AnimatedNumber value={pendingBalance} prefix="$" decimals={2} />
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Available</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/30">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              <AnimatedNumber value={availableBalance} prefix="$" decimals={2} />
            </p>
            <Link href="/affiliate/payouts" className="text-xs font-medium flex items-center gap-1 mt-1 hover:underline" style={{ color: PRIMARY }}>
              Withdraw <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} whileHover={cardHover}>
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5 hover:shadow-lg transition-shadow h-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Paid Out</span>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-50 dark:bg-purple-900/30">
                <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              <AnimatedNumber value={paidOut} prefix="$" decimals={2} />
            </p>
          </div>
        </motion.div>
      </div>

      {/* Commission Chart */}
      <motion.div variants={itemVariants}>
        <div className={cn(GLASS_CARD, 'p-6')}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Commission Overview</h2>
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 relative">
              {PERIOD_OPTIONS.map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={cn(
                    'relative z-10 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    activePeriod === period
                      ? 'text-white'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300',
                  )}
                >
                  {activePeriod === period && (
                    <motion.div layoutId="affiliate-period-tab" className="absolute inset-0 rounded-md" style={{ background: PRIMARY }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                  )}
                  <span className="relative z-10">{period}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="affCommGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-neutral-200 dark:text-neutral-700" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="text-neutral-500 dark:text-neutral-400" interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} className="text-neutral-500 dark:text-neutral-400" tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="commission" stroke={PRIMARY} strokeWidth={2} fill="url(#affCommGrad)" dot={false} activeDot={{ r: 5, fill: PRIMARY, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Bottom Row: Top Links + Tier Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Links */}
        <motion.div variants={itemVariants}>
          <div className={cn(GLASS_CARD, 'p-6 h-full')}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Top Links</h2>
              <Link href="/affiliate/links" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: PRIMARY }}>
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {topLinks.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 dark:text-neutral-400">No links created yet</p>
                <Link href="/affiliate/links">
                  <Button size="sm" variant="outline" className="mt-3 rounded-lg">
                    Create Your First Link
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {topLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#1E4DB7]/10">
                      <Link2 className="w-4 h-4" style={{ color: PRIMARY }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                        {link.customCampaign || link.shortCode}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {link.clicks} clicks · {link.conversions} sales
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">${link.commission.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tier Progress */}
        <motion.div variants={itemVariants}>
          <div className={cn(GLASS_CARD, 'p-6 h-full')}>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-5">Tier Progress</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PRIMARY}20, ${ACCENT}20)` }}>
                <Award className="w-7 h-7" style={{ color: PRIMARY }} />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Current Tier</p>
                <p className="text-xl font-bold text-neutral-900 dark:text-white">
                  {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)}
                </p>
                <p className="text-sm" style={{ color: PRIMARY }}>{commissionRate}% commission</p>
              </div>
            </div>

            {tierInfo.next ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Progress to {tierInfo.next}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{tierProgress}%</span>
                </div>
                <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${tierProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                  <span>${lifetimeRevenue.toLocaleString()} earned</span>
                  <span>${tierInfo.nextThreshold?.toLocaleString()} needed</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium">
                  <Award className="w-4 h-4" />
                  Max tier reached!
                </div>
              </div>
            )}

            {/* Tier Overview */}
            <div className="mt-6 pt-6 border-t border-neutral-200/60 dark:border-neutral-700/60">
              <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-3">All Tiers</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: 'Standard', rate: '10%', active: currentTier === 'standard' },
                  { name: 'Silver', rate: '15%', active: currentTier === 'silver' },
                  { name: 'Gold', rate: '20%', active: currentTier === 'gold' },
                  { name: 'Platinum', rate: '25%', active: currentTier === 'platinum' },
                ].map((t) => (
                  <div key={t.name} className={cn('rounded-lg p-2 text-center border', t.active ? 'border-[#1E4DB7] bg-[#1E4DB7]/5' : 'border-neutral-200 dark:border-neutral-700')}>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{t.name}</p>
                    <p className={cn('text-sm font-bold', t.active ? 'text-[#1E4DB7]' : 'text-neutral-700 dark:text-neutral-300')}>{t.rate}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
