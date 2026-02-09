"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// =============================================================================
// Mock Data
// =============================================================================

const STATS = {
  views: 12450,
  sales: 342,
  revenue: 27180,
  conversion: 2.75,
};

const LICENSE_BREAKDOWN = [
  { label: "Single Use", color: "bg-blue-500", percentage: 45 },
  { label: "Multi Use", color: "bg-green-500", percentage: 30 },
  { label: "Extended", color: "bg-purple-500", percentage: 15 },
  { label: "Unlimited", color: "bg-orange-500", percentage: 10 },
];

const MONTHLY_DATA = [
  { month: "Sep 2025", views: 1820, sales: 48, revenue: 3840, conversion: 2.64 },
  { month: "Oct 2025", views: 2100, sales: 56, revenue: 4480, conversion: 2.67 },
  { month: "Nov 2025", views: 2350, sales: 62, revenue: 4960, conversion: 2.64 },
  { month: "Dec 2025", views: 2580, sales: 71, revenue: 5680, conversion: 2.75 },
  { month: "Jan 2026", views: 1950, sales: 52, revenue: 4160, conversion: 2.67 },
  { month: "Feb 2026", views: 1650, sales: 53, revenue: 4060, conversion: 3.21 },
];

// =============================================================================
// Component
// =============================================================================

export default function TemplateAnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        href="./"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Template
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Template Analytics
      </h1>

      {/* --------------------------------------------------------------- */}
      {/* Stats Cards                                                      */}
      {/* --------------------------------------------------------------- */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Views
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {STATS.views.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Sales
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {STATS.sales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${STATS.revenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {STATS.conversion}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* License Breakdown                                                */}
      {/* --------------------------------------------------------------- */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          License Breakdown
        </h2>
        <div className="space-y-4">
          {LICENSE_BREAKDOWN.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  {item.percentage}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --------------------------------------------------------------- */}
      {/* Monthly Table                                                    */}
      {/* --------------------------------------------------------------- */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monthly Performance
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Month
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Views
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Sales
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Revenue
                </th>
                <th className="px-6 py-3 font-medium text-gray-500 dark:text-gray-400">
                  Conversion %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {MONTHLY_DATA.map((row) => (
                <tr
                  key={row.month}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">
                    {row.month}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {row.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {row.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    ${row.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-gray-600 dark:text-gray-300">
                    {row.conversion}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
