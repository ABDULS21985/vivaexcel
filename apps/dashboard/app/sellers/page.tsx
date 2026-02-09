'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminSellers, useSuspendSeller, useReinstateSeller } from '../../hooks/use-sellers';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending_review', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  suspended: 'bg-red-100 text-red-700',
  rejected: 'bg-zinc-100 text-zinc-700',
};

export default function SellersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const { data, isLoading } = useAdminSellers({ search: search || undefined, status: status || undefined });
  const suspendSeller = useSuspendSeller();
  const reinstateSeller = useReinstateSeller();

  const sellers = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Sellers</h1>
        <div className="flex gap-2">
          <Link
            href="/sellers/applications"
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            Applications
          </Link>
          <Link
            href="/sellers/payouts"
            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700"
          >
            Payouts
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search sellers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 px-4 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : sellers.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No sellers found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-6 py-3">Seller</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Sales</th>
                <th className="px-6 py-3">Revenue</th>
                <th className="px-6 py-3">Commission</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller: any) => (
                <tr key={seller.id} className="border-b border-zinc-100 dark:border-zinc-700/50 hover:bg-zinc-50 dark:hover:bg-zinc-700/30">
                  <td className="px-6 py-4">
                    <Link href={`/sellers/${seller.id}`} className="font-medium text-zinc-900 dark:text-white hover:text-primary">
                      {seller.displayName}
                    </Link>
                    <p className="text-xs text-zinc-500">{seller.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[seller.status] || ''}`}>
                      {seller.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{seller.totalSales}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">${Number(seller.totalRevenue).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{Number(seller.commissionRate)}%</td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{Number(seller.averageRating).toFixed(1)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/sellers/${seller.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                      {seller.status === 'approved' && (
                        <button
                          onClick={() => suspendSeller.mutate(seller.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Suspend
                        </button>
                      )}
                      {seller.status === 'suspended' && (
                        <button
                          onClick={() => reinstateSeller.mutate(seller.id)}
                          className="text-xs text-green-600 hover:underline"
                        >
                          Reinstate
                        </button>
                      )}
                    </div>
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
