'use client';

import { useSellerEarnings, useSellerPayouts } from '../../../../hooks/use-sellers';
import { PAYOUT_STATUS_LABELS, PAYOUT_STATUS_COLORS } from '../../../../types/seller';

export default function SellerEarningsPage() {
  const { data: earnings, isLoading: loadingEarnings } = useSellerEarnings();
  const { data: payouts, isLoading: loadingPayouts } = useSellerPayouts();

  if (loadingEarnings || loadingPayouts) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Earnings & Payouts</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            ${(earnings?.totalRevenue ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Pending Payout</p>
          <p className="text-2xl font-bold text-yellow-600">
            ${(earnings?.pendingPayout ?? 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Commission Rate</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-white">
            {Number(earnings?.commissionRate ?? 20)}%
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Payout History</h2>
        </div>

        {payouts && (Array.isArray(payouts) ? payouts : []).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-700">
                  <th className="px-6 py-3">Period</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Platform Fee</th>
                  <th className="px-6 py-3">Net</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(payouts) ? payouts : []).map((payout: any) => (
                  <tr key={payout.id} className="border-b border-zinc-100 dark:border-zinc-700/50">
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">
                      ${Number(payout.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-500">
                      ${Number(payout.platformFee).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">
                      ${Number(payout.netAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {payout.itemCount}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYOUT_STATUS_COLORS[payout.status as keyof typeof PAYOUT_STATUS_COLORS] || ''}`}>
                        {PAYOUT_STATUS_LABELS[payout.status as keyof typeof PAYOUT_STATUS_LABELS] || payout.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">No payouts yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
