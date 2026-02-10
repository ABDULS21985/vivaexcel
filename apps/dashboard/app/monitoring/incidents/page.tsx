"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
} from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: "P1" | "P2" | "P3" | "P4";
  status: "INVESTIGATING" | "IDENTIFIED" | "MONITORING" | "RESOLVED";
  servicesAffected: string[];
  timeline: Array<{ timestamp: string; update: string; author?: string }>;
  startedAt: string;
  resolvedAt: string | null;
  postmortemUrl: string | null;
}

const severityColors: Record<string, string> = {
  P1: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  P2: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  P3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  P4: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const statusColors: Record<string, string> = {
  INVESTIGATING: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  IDENTIFIED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  MONITORING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

export default function IncidentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updateText, setUpdateText] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "P2" as string,
    servicesAffected: [] as string[],
  });

  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ["monitoring", "incidents", statusFilter],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      return apiGet<Incident[]>("/monitoring/incidents", params);
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      apiPost("/monitoring/incidents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "incidents"] });
      setShowCreate(false);
      setForm({ title: "", description: "", severity: "P2", servicesAffected: [] });
      toast({ title: "Incident created" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; status: string; update: string }) =>
      apiPatch(`/monitoring/incidents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "incidents"] });
      setUpdateText("");
      setUpdateStatus("");
      toast({ title: "Incident updated" });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) =>
      apiPatch(`/monitoring/incidents/${id}/resolve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monitoring", "incidents"] });
      setSelectedIncident(null);
      toast({ title: "Incident resolved" });
    },
  });

  const incidents = incidentsData?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident Management"
        description="Create, track, and resolve incidents"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="h-4 w-4" />
            Create Incident
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-2">
        {["", "INVESTIGATING", "IDENTIFIED", "MONITORING", "RESOLVED"].map(
          (s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                statusFilter === s
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {s || "All"}
            </button>
          )
        )}
      </div>

      {/* Create Form Modal */}
      {showCreate && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
          <h3 className="font-semibold mb-4">Create Incident</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
              rows={3}
            />
            <select
              value={form.severity}
              onChange={(e) => setForm({ ...form, severity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
            >
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || createMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-3">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="bg-white dark:bg-gray-900 rounded-lg border p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
            onClick={() =>
              setSelectedIncident(
                selectedIncident?.id === incident.id ? null : incident
              )
            }
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${severityColors[incident.severity]}`}
              >
                {incident.severity}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[incident.status]}`}
              >
                {incident.status}
              </span>
              <span className="font-medium text-sm">{incident.title}</span>
            </div>
            <p className="text-xs text-gray-500">
              Started: {new Date(incident.startedAt).toLocaleString()}
              {incident.resolvedAt &&
                ` | Resolved: ${new Date(incident.resolvedAt).toLocaleString()}`}
            </p>

            {/* Expanded detail */}
            {selectedIncident?.id === incident.id && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {incident.description}
                </p>

                {/* Timeline */}
                <div className="pl-4 border-l-2 space-y-2">
                  {incident.timeline.map((entry, idx) => (
                    <div key={idx} className="text-xs">
                      <span className="text-gray-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                      <p className="text-gray-700 dark:text-gray-300">
                        {entry.update}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {incident.status !== "RESOLVED" && (
                  <div className="flex gap-2 flex-wrap">
                    <input
                      type="text"
                      placeholder="Add update..."
                      value={updateText}
                      onChange={(e) => setUpdateText(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 min-w-[200px] px-3 py-1 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    />
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 border rounded-lg bg-white dark:bg-gray-800 text-sm"
                    >
                      <option value="">Same status</option>
                      <option value="INVESTIGATING">Investigating</option>
                      <option value="IDENTIFIED">Identified</option>
                      <option value="MONITORING">Monitoring</option>
                    </select>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (updateText) {
                          updateMutation.mutate({
                            id: incident.id,
                            status: updateStatus || incident.status,
                            update: updateText,
                          });
                        }
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                    >
                      Update
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resolveMutation.mutate(incident.id);
                      }}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {!isLoading && incidents.length === 0 && (
          <p className="text-center text-gray-500 py-8">No incidents found</p>
        )}
      </div>
    </div>
  );
}
