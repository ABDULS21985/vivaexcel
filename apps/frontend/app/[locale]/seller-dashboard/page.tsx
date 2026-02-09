'use client';

import { useMySellerProfile, useSellerEarnings, useSellerPayouts } from '../../../hooks/use-sellers';
import { DollarSign, ShoppingCart, TrendingUp, Star } from 'lucide-react';

export default function SellerDashboardPage() {
  const { data: profile, isLoading: loadingProfile } = useMySellerProfile();
  const { data: earnings, isLoading: loadingEarnings } = useSellerEarnings();

  if (loadingProfile || loadingEarnings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">No Seller Profile</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">You need to apply and get approved to access the seller dashboard.</p>
        <a href="/become-a-seller" className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 inline-block">
          Become a Seller
        </a>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${(earnings?.totalRevenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Sales',
      value: earnings?.totalSales ?? 0,
      icon: ShoppingCart,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Pending Payout',
      value: `$${(earnings?.pendingPayout ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      label: 'Average Rating',
      value: Number(earnings?.averageRating ?? 0).toFixed(1),
      icon: Star,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
        Welcome back, {profile.displayName}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Commission Info */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3">Commission Structure</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Your current commission rate is <span className="font-semibold text-zinc-900 dark:text-white">{Number(earnings?.commissionRate ?? 20)}%</span>.
          You keep <span className="font-semibold text-primary">{100 - Number(earnings?.commissionRate ?? 20)}%</span> of every sale.
        </p>
      </div>
    </div>
  );
}
