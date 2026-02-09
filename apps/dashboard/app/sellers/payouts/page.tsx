'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminPayouts, useProcessPayout } from '../../../hooks/use-sellers';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
};

export default function PayoutsPage() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminPayouts({ status: status || undefined });
  const processPayout = useProcessPayout();

  const payouts = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Payouts</h1>
        <Link href="/sellers" className="text-sm text-zinc-500 hover:text-zinc-700">
          Back to Sellers
        </Link>
      </div>

      <div className="flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              status === opt.value
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : payouts.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No payouts found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Period</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Fee</th>
                <th className="px-6 py-3">Net</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((payout: any) => (
                <tr key={payout.id} className="border-b border-zinc-100 dark:border-zinc-700/50">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                    {payout.seller?.displayName || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">${Number(payout.amount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">${Number(payout.platformFee).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">${Number(payout.netAmount).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{payout.itemCount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payout.status] || ''}`}>
                      {payout.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {payout.status === 'pending' && (
                      <button
                        onClick={() => processPayout.mutate(payout.id)}
                        disabled={processPayout.isPending}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Process
                      </button>
                    )}
                    {payout.status === 'failed' && payout.failureReason && (
                      <span className="text-xs text-red-500" title={payout.failureReason}>
                        Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
