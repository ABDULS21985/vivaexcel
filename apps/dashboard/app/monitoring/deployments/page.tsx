"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Play,
  Clock,
  RefreshCw,
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api-client";
import { PageHeader } from "@/components/page-header";
import { useState } from "react";

interface SmokeTestResult {
  test: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface DeployResult {
  timestamp: string;
  passed: boolean;
  results: SmokeTestResult[];
}

export default function DeploymentsPage() {
  const [latestResult, setLatestResult] = useState<DeployResult | null>(null);

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["monitoring", "deploy-history"],
    queryFn: () => apiGet<DeployResult[]>("/monitoring/deploy/history"),
  });

  const verifyMutation = useMutation({
    mutationFn: () =>
      apiPost<{ passed: boolean; results: SmokeTestResult[] }>(
        "/monitoring/deploy/verify",
        {}
      ),
    onSuccess: (data) => {
      setLatestResult({
        timestamp: new Date().toISOString(),
        ...(data.data as any),
      });
    },
  });

  const history = historyData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deployment Verification"
        description="Smoke test results and deployment health"
        action={
          <button
            onClick={() => verifyMutation.mutate()}
            disabled={verifyMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            {verifyMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run Smoke Tests
          </button>
        }
      />

      {/* Latest Result */}
      {latestResult && (
        <div
          className={`rounded-lg border p-4 ${
            latestResult.passed
              ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {latestResult.passed ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-semibold">
              {latestResult.passed ? "All Tests Passed" : "Tests Failed"}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(latestResult.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="space-y-1">
            {latestResult.results.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {r.passed ? (
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>{r.test}</span>
                <span className="text-xs text-gray-400">{r.duration}ms</span>
                {r.error && (
                  <span className="text-xs text-red-500">({r.error})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recent Deployments</h2>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No deployment history yet
          </p>
        ) : (
          <div className="space-y-3">
            {history.map((deploy, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-900 rounded-lg border p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  {deploy.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="font-medium text-sm">
                    {deploy.passed ? "Passed" : "Failed"}
                  </span>
                  <span className="text-xs text-gray-500">
                    <Clock className="inline h-3 w-3 mr-1" />
                    {new Date(deploy.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                  {deploy.results?.map((r, ri) => (
                    <span key={ri} className="flex items-center gap-1">
                      {r.passed ? (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      ) : (
                        <XCircle className="h-3 w-3 text-red-400" />
                      )}
                      {r.test}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
