'use client';

import { use, useState } from 'react';
import { useAdminSeller, useUpdateSeller } from '../../../hooks/use-sellers';

export default function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: seller, isLoading } = useAdminSeller(id);
  const updateSeller = useUpdateSeller();

  const [commissionRate, setCommissionRate] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!seller) {
    return <div className="text-center py-20 text-zinc-500">Seller not found.</div>;
  }

  const currentRate = commissionRate ?? Number(seller.commissionRate);

  const handleSaveCommission = async () => {
    await updateSeller.mutateAsync({ id, data: { commissionRate: currentRate } });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{seller.displayName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Profile</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-zinc-900 dark:text-white">{seller.user?.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Status</dt>
              <dd className="text-zinc-900 dark:text-white capitalize">{seller.status?.replace('_', ' ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Verification</dt>
              <dd className="text-zinc-900 dark:text-white capitalize">{seller.verificationStatus?.replace('_', ' ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Stripe Connected</dt>
              <dd className="text-zinc-900 dark:text-white">{seller.stripeOnboardingComplete ? 'Yes' : 'No'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Payout Schedule</dt>
              <dd className="text-zinc-900 dark:text-white capitalize">{seller.payoutSchedule}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Joined</dt>
              <dd className="text-zinc-900 dark:text-white">{new Date(seller.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Stats</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Total Sales</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{seller.totalSales}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Total Revenue</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">${Number(seller.totalRevenue).toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Average Rating</dt>
              <dd className="font-medium text-zinc-900 dark:text-white">{Number(seller.averageRating).toFixed(1)}</dd>
            </div>
          </dl>

          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Commission Rate (%)</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={currentRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-3 py-2 text-sm"
              />
              <button
                onClick={handleSaveCommission}
                disabled={updateSeller.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      {seller.bio && (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Bio</h2>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-line">{seller.bio}</p>
        </div>
      )}
    </div>
  );
}
