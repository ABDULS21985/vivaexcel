'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSellerApplications, useReviewApplication } from '../../../hooks/use-sellers';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ApplicationsPage() {
  const [status, setStatus] = useState('pending');
  const { data, isLoading } = useSellerApplications({ status: status || undefined });
  const reviewApp = useReviewApplication();

  const applications = data?.data ?? [];

  const handleReview = (id: string, decision: 'approve' | 'reject') => {
    const notes = decision === 'reject' ? prompt('Rejection reason (optional):') : undefined;
    reviewApp.mutate({ id, decision, reviewNotes: notes || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Seller Applications</h1>
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
                : 'bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700'
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
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No applications found.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-zinc-500 uppercase border-b border-zinc-200 dark:border-zinc-700">
                <th className="px-6 py-3">Applicant</th>
                <th className="px-6 py-3">Display Name</th>
                <th className="px-6 py-3">Specialties</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Applied</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app: any) => (
                <tr key={app.id} className="border-b border-zinc-100 dark:border-zinc-700/50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{app.user?.firstName} {app.user?.lastName}</p>
                    <p className="text-xs text-zinc-500">{app.user?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{app.displayName}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(app.specialties || []).slice(0, 2).map((s: string) => (
                        <span key={s} className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-700 text-xs">{s}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || ''}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {app.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(app.id, 'approve')}
                          disabled={reviewApp.isPending}
                          className="text-xs text-green-600 hover:underline font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(app.id, 'reject')}
                          disabled={reviewApp.isPending}
                          className="text-xs text-red-600 hover:underline font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <Link href={`/sellers/applications/${app.id}`} className="text-xs text-primary hover:underline">
                        View
                      </Link>
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
