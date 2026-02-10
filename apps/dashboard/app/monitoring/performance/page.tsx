"use client";

import { useQuery } from "@tanstack/react-query";
import { Gauge, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { PageHeader } from "@/components/page-header";

interface PerformanceBudget {
  id: string;
  route: string;
  metricName: string;
  budgetValue: number;
  currentP75: number | null;
  currentP99: number | null;
  isCompliant: boolean;
  sampleCount: number;
  lastReportedAt: string | null;
}

export default function PerformancePage() {
  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ["monitoring", "budgets"],
    queryFn: () =>
      apiGet<PerformanceBudget[]>("/monitoring/performance/budgets"),
  });

  const budgets = budgetsData?.data || [];

  // Group by route
  const grouped = budgets.reduce(
    (acc, b) => {
      if (!acc[b.route]) acc[b.route] = [];
      acc[b.route].push(b);
      return acc;
    },
    {} as Record<string, PerformanceBudget[]>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance Budgets"
        description="Web Vitals tracking and performance budget compliance"
      />

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : budgets.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No performance budgets configured yet
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([route, metrics]) => (
            <div
              key={route}
              className="bg-white dark:bg-gray-900 rounded-lg border"
            >
              <div className="px-4 py-3 border-b">
                <h3 className="font-medium text-sm">{route}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-gray-500">
                      <th className="px-4 py-2">Metric</th>
                      <th className="px-4 py-2">Budget</th>
                      <th className="px-4 py-2">P75</th>
                      <th className="px-4 py-2">P99</th>
                      <th className="px-4 py-2">Samples</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m) => (
                      <tr key={m.id} className="border-b last:border-0">
                        <td className="px-4 py-2 font-medium">
                          {m.metricName}
                        </td>
                        <td className="px-4 py-2">
                          {Number(m.budgetValue).toFixed(3)}
                        </td>
                        <td
                          className={`px-4 py-2 ${
                            m.currentP75 !== null &&
                            Number(m.currentP75) > Number(m.budgetValue)
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {m.currentP75 !== null
                            ? Number(m.currentP75).toFixed(3)
                            : "--"}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {m.currentP99 !== null
                            ? Number(m.currentP99).toFixed(3)
                            : "--"}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {m.sampleCount}
                        </td>
                        <td className="px-4 py-2">
                          {m.isCompliant ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
