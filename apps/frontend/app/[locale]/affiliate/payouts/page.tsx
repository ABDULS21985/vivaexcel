'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { cn, Button, Skeleton } from '@ktblog/ui/components';
import {
  useAffiliateEarnings,
  useAffiliatePayouts,
  useAffiliateStripeStatus,
} from '@/hooks/use-affiliates';
import { AffiliatePayoutStatus } from '@/types/affiliate';

const PRIMARY = '#1E4DB7';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

function getPayoutStatusStyle(status: AffiliatePayoutStatus) {
  switch (status) {
    case AffiliatePayoutStatus.PENDING:
      return { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Clock };
    case AffiliatePayoutStatus.PROCESSING:
      return { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: Clock };
    case AffiliatePayoutStatus.COMPLETED:
      return { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: CheckCircle };
    case AffiliatePayoutStatus.FAILED:
      return { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: XCircle };
    default:
      return { color: 'text-neutral-700', bg: 'bg-neutral-50', icon: Clock };
  }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function AffiliatePayoutsPage() {
  const [cursor, setCursor] = useState<string | undefined>();
  const { data: earnings, isLoading: loadingEarnings } = useAffiliateEarnings();
  const { data: payoutsData, isLoading: loadingPayouts } = useAffiliatePayouts({ cursor, limit: 20 });
  const { data: stripeStatus } = useAffiliateStripeStatus();

  const payouts = payoutsData?.items ?? [];
  const meta = payoutsData?.meta;

  if (loadingEarnings || loadingPayouts) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Payouts</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Track your earnings and payout history
        </p>
      </div>

      {/* Stripe Connect Warning */}
      {!stripeStatus?.complete && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex items-start gap-3">
          <CreditCard className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Stripe Connect not set up
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
              You need to connect your Stripe account to receive payouts.
            </p>
          </div>
          <Link href="/affiliate/settings">
            <Button size="sm" variant="outline" className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-400 rounded-lg">
              Set Up <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Earnings Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: earnings?.pending ?? 0, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
          { label: 'Available', value: earnings?.available ?? 0, icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
          { label: 'Paid Out', value: earnings?.paid ?? 0, icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Total Lifetime', value: earnings?.total ?? 0, icon: DollarSign, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon className={cn('w-5 h-5', stat.color)} />
              </div>
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              ${stat.value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Payout History */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">Payout History</h2>

        {payouts.length === 0 ? (
          <div className={cn(GLASS_CARD, 'p-12 text-center')}>
            <Wallet className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No payouts yet</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Payouts are processed automatically when your approved commissions reach the minimum threshold.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden lg:grid grid-cols-[1fr_120px_120px_100px_100px_120px] gap-4 px-5 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <span>Period</span>
              <span>Amount</span>
              <span>Net</span>
              <span>Items</span>
              <span>Status</span>
              <span>Date</span>
            </div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
              {payouts.map((payout) => {
                const style = getPayoutStatusStyle(payout.status);
                const StatusIcon = style.icon;

                return (
                  <motion.div
                    key={payout.id}
                    variants={itemVariants}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-4 lg:p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="lg:grid lg:grid-cols-[1fr_120px_120px_100px_100px_120px] lg:gap-4 lg:items-center">
                      {/* Period */}
                      <div className="mb-2 lg:mb-0">
                        <p className="text-sm font-medium text-neutral-900 dark:text-white">
                          {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                        <span className="text-xs text-neutral-500 lg:hidden">Amount:</span>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">
                          ${payout.amount.toFixed(2)}
                        </p>
                      </div>

                      {/* Net */}
                      <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                        <span className="text-xs text-neutral-500 lg:hidden">Net:</span>
                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          ${payout.netAmount.toFixed(2)}
                        </p>
                      </div>

                      {/* Items */}
                      <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                        <span className="text-xs text-neutral-500 lg:hidden">Commissions:</span>
                        <p className="text-sm text-neutral-700 dark:text-neutral-300">
                          {payout.commissionCount}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                        <span className="text-xs text-neutral-500 lg:hidden">Status:</span>
                        <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium', style.bg, style.color)}>
                          <StatusIcon className="w-3 h-3" />
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 lg:block">
                        <span className="text-xs text-neutral-500 lg:hidden">Processed:</span>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}

        {/* Pagination */}
        {meta && (meta.hasNextPage || meta.hasPreviousPage) && (
          <div className="flex items-center justify-center gap-3 mt-4">
            {meta.hasPreviousPage && meta.previousCursor && (
              <Button variant="outline" size="sm" onClick={() => setCursor(meta.previousCursor)}>Previous</Button>
            )}
            {meta.hasNextPage && meta.nextCursor && (
              <Button variant="outline" size="sm" onClick={() => setCursor(meta.nextCursor)}>Next</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
