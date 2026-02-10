"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Bell, Trash2, Play, ToggleLeft, ToggleRight } from "lucide-react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";

interface AlertRule {
  id: string;
  name: string;
  description: string | null;
  metric: string;
  condition: string;
  threshold: number;
  duration: number;
  channel: string;
  recipients: string[];
  isActive: boolean;
  cooldownMinutes: number;
  lastTriggeredAt: string | null;
  lastValue: number | null;
  triggerCount: number;
}

export default function AlertsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading } = useQuery({
    queryKey: ["monitoring", "alerts"],
    queryFn: () => apiGet<AlertRule[]>("/monitoring/alerts"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      apiPatch(`/monitoring/alerts/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "alerts"] });
      toast({ title: "Alert rule updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/monitoring/alerts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "alerts"] });
      toast({ title: "Alert rule deleted" });
    },
  });

  const testMutation = useMutation({
    mutationFn: (id: string) =>
      apiPost(`/monitoring/alerts/${id}/test`, {}),
    onSuccess: () => {
      toast({ title: "Test alert sent" });
    },
  });

  const alerts = alertsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Rules"
        description="Configure monitoring alert rules and notifications"
      />

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-white dark:bg-gray-900 rounded-lg border p-4 ${
              !alert.isActive ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap
                  className={`h-4 w-4 ${
                    alert.lastTriggeredAt ? "text-red-500" : "text-gray-400"
                  }`}
                />
                <span className="font-medium text-sm">{alert.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {alert.channel}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => testMutation.mutate(alert.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Send test alert"
                >
                  <Play className="h-4 w-4 text-blue-500" />
                </button>
                <button
                  onClick={() =>
                    toggleMutation.mutate({
                      id: alert.id,
                      isActive: !alert.isActive,
                    })
                  }
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title={alert.isActive ? "Disable" : "Enable"}
                >
                  {alert.isActive ? (
                    <ToggleRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this alert rule?")) {
                      deleteMutation.mutate(alert.id);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-2">
              {alert.description || `${alert.metric} ${alert.condition} ${alert.threshold}`}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>Metric: {alert.metric}</span>
              <span>
                Condition: {alert.condition} {alert.threshold}
              </span>
              <span>Duration: {alert.duration}s</span>
              <span>Cooldown: {alert.cooldownMinutes}m</span>
              {alert.lastTriggeredAt && (
                <span className="text-red-400">
                  Last triggered:{" "}
                  {new Date(alert.lastTriggeredAt).toLocaleString()}
                </span>
              )}
              <span>Triggered {alert.triggerCount}x</span>
            </div>
          </div>
        ))}
        {!isLoading && alerts.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            No alert rules configured
          </p>
        )}
      </div>
    </div>
  );
}
