'use client';

import { useState } from 'react';
import {
  useMySellerProfile,
  useUpdateSellerProfile,
  useStripeConnectStatus,
  useCreateStripeConnect,
  useStripeDashboardLink,
} from '../../../../hooks/use-sellers';

export default function SellerSettingsPage() {
  const { data: profile, isLoading } = useMySellerProfile();
  const updateProfile = useUpdateSellerProfile();
  const { data: stripeStatus } = useStripeConnectStatus();
  const createStripeConnect = useCreateStripeConnect();
  const stripeDashboard = useStripeDashboardLink();

  const [form, setForm] = useState<{
    displayName: string;
    bio: string;
    website: string;
    payoutSchedule: string;
    minimumPayout: number;
  }>({
    displayName: '',
    bio: '',
    website: '',
    payoutSchedule: 'monthly',
    minimumPayout: 50,
  });

  const [initialized, setInitialized] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (profile && !initialized) {
    setForm({
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      website: profile.website || '',
      payoutSchedule: profile.payoutSchedule || 'monthly',
      minimumPayout: Number(profile.minimumPayout) || 50,
    });
    setInitialized(true);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(form as any);
  };

  const handleStripeConnect = async () => {
    const result = await createStripeConnect.mutateAsync();
    if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleStripeDashboard = async () => {
    const result = await stripeDashboard.mutateAsync();
    if (result?.url) {
      window.open(result.url, '_blank');
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Settings</h1>

      {/* Stripe Connect Section */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Stripe Connect</h2>

        {stripeStatus?.complete ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">Connected & Active</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                <p className="text-xs text-zinc-500 mb-1">Charges</p>
                <p className={`text-sm font-medium ${stripeStatus.chargesEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {stripeStatus.chargesEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                <p className="text-xs text-zinc-500 mb-1">Payouts</p>
                <p className={`text-sm font-medium ${stripeStatus.payoutsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {stripeStatus.payoutsEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="text-center p-3 rounded-lg bg-zinc-50 dark:bg-zinc-700/50">
                <p className="text-xs text-zinc-500 mb-1">Details</p>
                <p className={`text-sm font-medium ${stripeStatus.detailsSubmitted ? 'text-green-600' : 'text-red-600'}`}>
                  {stripeStatus.detailsSubmitted ? 'Submitted' : 'Pending'}
                </p>
              </div>
            </div>
            <button
              onClick={handleStripeDashboard}
              disabled={stripeDashboard.isPending}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              {stripeDashboard.isPending ? 'Loading...' : 'Open Stripe Dashboard'}
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Connect your Stripe account to receive payouts for your sales.
            </p>
            <button
              onClick={handleStripeConnect}
              disabled={createStripeConnect.isPending}
              className="px-4 py-2.5 bg-[#635BFF] text-white rounded-lg text-sm font-medium hover:bg-[#5851DB] disabled:opacity-50 transition-colors"
            >
              {createStripeConnect.isPending ? 'Setting up...' : 'Connect with Stripe'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Settings */}
      <form onSubmit={handleSave} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Profile Settings</h2>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Display Name</label>
          <input
            type="text"
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Bio</label>
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Payout Schedule</label>
            <select
              value={form.payoutSchedule}
              onChange={(e) => setForm({ ...form, payoutSchedule: e.target.value })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Minimum Payout ($)</label>
            <input
              type="number"
              min={10}
              max={10000}
              value={form.minimumPayout}
              onChange={(e) => setForm({ ...form, minimumPayout: Number(e.target.value) })}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2.5 text-zinc-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
