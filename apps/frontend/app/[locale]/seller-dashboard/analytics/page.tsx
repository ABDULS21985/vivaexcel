'use client';

import { useSellerEarnings } from '../../../../hooks/use-sellers';

export default function SellerAnalyticsPage() {
  const { data: earnings, isLoading } = useSellerEarnings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Sales Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Total Sales</span>
              <span className="font-medium text-zinc-900 dark:text-white">{earnings?.totalSales ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Total Revenue</span>
              <span className="font-medium text-zinc-900 dark:text-white">${(earnings?.totalRevenue ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Average Rating</span>
              <span className="font-medium text-zinc-900 dark:text-white">{Number(earnings?.averageRating ?? 0).toFixed(1)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Performance</h3>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Detailed analytics with charts and conversion metrics will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
