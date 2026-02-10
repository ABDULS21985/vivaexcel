"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Server,
  Clock,
  Zap,
  RefreshCw,
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { PageHeader } from "@/components/page-header";

interface ServiceStatus {
  serviceName: string;
  displayName: string;
  status: "UP" | "DEGRADED" | "DOWN";
  latency: number | null;
  uptimePercentage: number;
  lastCheckedAt: string;
}

interface ActiveAlert {
  id: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  lastValue: number | null;
  lastTriggeredAt: string;
  channel: string;
}

interface MetricPoint {
  timestamp: number;
  value: number;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "UP":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "DEGRADED":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "DOWN":
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-gray-400" />;
  }
}

export default function MonitoringPage() {
  const [metricsHistory, setMetricsHistory] = useState<
    Record<string, MetricPoint[]>
  >({});

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["monitoring", "status"],
    queryFn: () => apiGet<{ services: ServiceStatus[] }>("/status"),
    refetchInterval: 30000,
  });

  const { data: alertsData } = useQuery({
    queryKey: ["monitoring", "alerts-active"],
    queryFn: () => apiGet<ActiveAlert[]>("/monitoring/alerts/active"),
    refetchInterval: 60000,
  });

  const { data: metricsRaw } = useQuery({
    queryKey: ["monitoring", "metrics"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api/v1"}/metrics`
      );
      return res.text();
    },
    refetchInterval: 300000,
  });

  // Parse and store metrics history
  const parseMetrics = useCallback(
    (text: string) => {
      const now = Date.now();
      const parsed: Record<string, number> = {};

      // Extract key metrics
      const patterns: Record<string, RegExp> = {
        requestsTotal: /http_requests_total\s+(\d+)/,
        errorsTotal: /api_errors_total\s+(\d+)/,
        activeConnections: /http_active_connections\s+(\d+)/,
        heapUsed: /nodejs_heap_used_bytes\s+(\d+)/,
        wsConnections: /active_websocket_connections\s+(\d+)/,
      };

      for (const [key, pattern] of Object.entries(patterns)) {
        const match = text.match(pattern);
        if (match) {
          parsed[key] = parseFloat(match[1]);
        }
      }

      setMetricsHistory((prev) => {
        const updated = { ...prev };
        for (const [key, value] of Object.entries(parsed)) {
          const history = updated[key] || [];
          updated[key] = [...history, { timestamp: now, value }].slice(-60);
        }
        return updated;
      });
    },
    []
  );

  useEffect(() => {
    if (metricsRaw) {
      parseMetrics(metricsRaw);
    }
  }, [metricsRaw, parseMetrics]);

  const services = statusData?.data?.services || [];
  const activeAlerts = alertsData?.data || [];

  const upCount = services.filter((s) => s.status === "UP").length;
  const totalCount = services.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Monitoring"
        description="Real-time system health and performance metrics"
      />

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-red-800 dark:text-red-400">
              {activeAlerts.length} Active Alert
              {activeAlerts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-1">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2"
              >
                <Zap className="h-3 w-3" />
                <span>
                  {alert.name}: {alert.metric} = {alert.lastValue} (threshold:{" "}
                  {alert.condition} {alert.threshold})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Server className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Services</span>
          </div>
          <div className="text-2xl font-bold">
            {upCount}/{totalCount}
          </div>
          <p className="text-xs text-gray-500">online</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Active Connections</span>
          </div>
          <div className="text-2xl font-bold">
            {metricsHistory.activeConnections?.slice(-1)[0]?.value ?? "--"}
          </div>
          <p className="text-xs text-gray-500">HTTP</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">WebSocket</span>
          </div>
          <div className="text-2xl font-bold">
            {metricsHistory.wsConnections?.slice(-1)[0]?.value ?? "--"}
          </div>
          <p className="text-xs text-gray-500">connections</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Heap Memory</span>
          </div>
          <div className="text-2xl font-bold">
            {metricsHistory.heapUsed?.slice(-1)[0]?.value
              ? `${Math.round(metricsHistory.heapUsed.slice(-1)[0].value / 1024 / 1024)}MB`
              : "--"}
          </div>
          <p className="text-xs text-gray-500">used</p>
        </div>
      </div>

      {/* Service Status Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Service Health</h2>
        {statusLoading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.serviceName}
                className="bg-white dark:bg-gray-900 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">
                    {service.displayName || service.serviceName}
                  </span>
                  <StatusIcon status={service.status} />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    Latency: {service.latency != null ? `${service.latency}ms` : "--"}
                  </span>
                  <span>
                    Uptime: {Number(service.uptimePercentage).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
