'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { cn, Button, Badge, Skeleton } from '@ktblog/ui/components';
import { useAffiliateCommissions } from '@/hooks/use-affiliates';
import { CommissionStatus } from '@/types/affiliate';

const PRIMARY = '#1E4DB7';
const GLASS = 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/60 dark:border-neutral-700/60';
const GLASS_CARD = cn(GLASS, 'rounded-2xl');

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'reversed', label: 'Reversed' },
];

function getStatusStyle(status: CommissionStatus) {
  switch (status) {
    case CommissionStatus.PENDING:
      return { color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Clock };
    case CommissionStatus.APPROVED:
      return { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: CheckCircle };
    case CommissionStatus.PAID:
      return { color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: CheckCircle };
    case CommissionStatus.REVERSED:
      return { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: XCircle };
    default:
      return { color: 'text-neutral-700 dark:text-neutral-400', bg: 'bg-neutral-50 dark:bg-neutral-800', icon: Clock };
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

export default function AffiliateCommissionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [cursor, setCursor] = useState<string | undefined>();

  const { data, isLoading } = useAffiliateCommissions({
    cursor,
    limit: 20,
    status: statusFilter || undefined,
  });

  const commissions = data?.items ?? [];
  const meta = data?.meta;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-60" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Summary stats
  const pendingTotal = commissions.filter((c) => c.status === CommissionStatus.PENDING).reduce((s, c) => s + c.commissionAmount, 0);
  const approvedTotal = commissions.filter((c) => c.status === CommissionStatus.APPROVED).reduce((s, c) => s + c.commissionAmount, 0);
  const paidTotal = commissions.filter((c) => c.status === CommissionStatus.PAID).reduce((s, c) => s + c.commissionAmount, 0);
  const reversedTotal = commissions.filter((c) => c.status === CommissionStatus.REVERSED).reduce((s, c) => s + c.commissionAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Commissions</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Track your commission earnings and status
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending', value: pendingTotal, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', icon: Clock },
          { label: 'Approved', value: approvedTotal, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', icon: CheckCircle },
          { label: 'Paid', value: paidTotal, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', icon: DollarSign },
          { label: 'Reversed', value: reversedTotal, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', icon: XCircle },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-4 flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bg)}>
              <stat.icon className={cn('w-5 h-5', stat.color)} />
            </div>
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{stat.label}</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">${stat.value.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-neutral-400" />
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setCursor(undefined); }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                statusFilter === f.value
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commission Table */}
      {commissions.length === 0 ? (
        <div className={cn(GLASS_CARD, 'p-12 text-center')}>
          <DollarSign className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">No commissions yet</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Commissions will appear here when customers purchase through your affiliate links.
          </p>
        </div>
      ) : (
        <>
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-[1fr_100px_100px_120px_100px_100px] gap-4 px-5 py-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            <span>Order</span>
            <span>Sale</span>
            <span>Rate</span>
            <span>Commission</span>
            <span>Status</span>
            <span>Date</span>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-2">
            {commissions.map((commission) => {
              const style = getStatusStyle(commission.status);
              const StatusIcon = style.icon;

              return (
                <motion.div
                  key={commission.id}
                  variants={itemVariants}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-700/60 rounded-xl p-4 lg:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="lg:grid lg:grid-cols-[1fr_100px_100px_120px_100px_100px] lg:gap-4 lg:items-center">
                    {/* Order */}
                    <div className="mb-2 lg:mb-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {commission.order?.orderNumber ?? commission.orderId.slice(0, 8)}
                      </p>
                      {commission.flagged && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-[10px] text-amber-600 dark:text-amber-400">Flagged</span>
                        </div>
                      )}
                    </div>

                    {/* Sale Amount */}
                    <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                      <span className="text-xs text-neutral-500 lg:hidden">Sale:</span>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        ${commission.saleAmount.toFixed(2)}
                      </p>
                    </div>

                    {/* Rate */}
                    <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                      <span className="text-xs text-neutral-500 lg:hidden">Rate:</span>
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {commission.commissionRate}%
                      </p>
                    </div>

                    {/* Commission */}
                    <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                      <span className="text-xs text-neutral-500 lg:hidden">Commission:</span>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ${commission.commissionAmount.toFixed(2)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 lg:block mb-1 lg:mb-0">
                      <span className="text-xs text-neutral-500 lg:hidden">Status:</span>
                      <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium', style.bg, style.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 lg:block">
                      <span className="text-xs text-neutral-500 lg:hidden">Date:</span>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(commission.createdAt).toLocaleDateString()}
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
        <div className="flex items-center justify-center gap-3">
          {meta.hasPreviousPage && meta.previousCursor && (
            <Button variant="outline" size="sm" onClick={() => setCursor(meta.previousCursor)}>
              Previous
            </Button>
          )}
          {meta.hasNextPage && meta.nextCursor && (
            <Button variant="outline" size="sm" onClick={() => setCursor(meta.nextCursor)}>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
