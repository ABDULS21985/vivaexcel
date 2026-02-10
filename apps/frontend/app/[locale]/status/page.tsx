'use client';

import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Activity,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api/v1';

interface ServiceStatus {
  serviceName: string;
  displayName: string;
  status: 'UP' | 'DEGRADED' | 'DOWN';
  latency: number | null;
  uptimePercentage: number;
  lastCheckedAt: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'P1' | 'P2' | 'P3' | 'P4';
  status: 'INVESTIGATING' | 'IDENTIFIED' | 'MONITORING' | 'RESOLVED';
  servicesAffected: string[];
  timeline: Array<{ timestamp: string; update: string; author?: string }>;
  startedAt: string;
  resolvedAt: string | null;
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'UP':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'DEGRADED':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'DOWN':
      return (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <XCircle className="h-5 w-5 text-red-500" />
        </motion.div>
      );
    default:
      return <Activity className="h-5 w-5 text-gray-400" />;
  }
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    P1: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    P2: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    P3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    P4: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[severity] || colors.P4}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    INVESTIGATING: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    IDENTIFIED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    MONITORING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || ''}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function StatusPage() {
  const [showHistory, setShowHistory] = useState(false);

  const { data: statusData, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/status`);
      const json = await res.json();
      return json.data as { services: ServiceStatus[]; activeIncidents: Incident[] };
    },
    refetchInterval: 60000,
  });

  const { data: historyData } = useQuery({
    queryKey: ['status-history'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/status/history?limit=50`);
      const json = await res.json();
      return json.data as Incident[];
    },
    enabled: showHistory,
  });

  const services = statusData?.services || [];
  const activeIncidents = statusData?.activeIncidents || [];

  const allUp = services.length > 0 && services.every((s) => s.status === 'UP');
  const hasDown = services.some((s) => s.status === 'DOWN');
  const hasDegraded = services.some((s) => s.status === 'DEGRADED');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Overall Status Banner */}
      <div
        className={`py-12 px-4 text-center ${
          allUp
            ? 'bg-green-50 dark:bg-green-950/30'
            : hasDown
              ? 'bg-red-50 dark:bg-red-950/30'
              : hasDegraded
                ? 'bg-yellow-50 dark:bg-yellow-950/30'
                : 'bg-gray-50 dark:bg-gray-900'
        }`}
      >
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
              <span className="text-lg text-gray-500">Checking system status...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-3 mb-2">
                {allUp ? (
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                ) : hasDown ? (
                  <XCircle className="h-8 w-8 text-red-500" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                )}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {allUp
                    ? 'All Systems Operational'
                    : hasDown
                      ? 'System Outage'
                      : 'Degraded Performance'}
                </h1>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last checked: {services[0]?.lastCheckedAt ? timeAgo(services[0].lastCheckedAt) : 'N/A'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Service Grid */}
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Services
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <motion.div
                key={service.serviceName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {service.displayName || service.serviceName}
                  </span>
                  <StatusIcon status={service.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {service.latency !== null ? `${service.latency}ms` : '--'}
                  </span>
                  <span>{Number(service.uptimePercentage).toFixed(2)}% uptime</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Active Incidents */}
        <AnimatePresence>
          {activeIncidents.length > 0 && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Active Incidents
              </h2>
              <div className="space-y-3">
                {activeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {incident.title}
                      </span>
                    </div>
                    {incident.timeline.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {incident.timeline[incident.timeline.length - 1].update}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      <Clock className="inline h-3 w-3 mr-1" />
                      Started {timeAgo(incident.startedAt)}
                      {incident.timeline.length > 0 &&
                        ` · Updated ${timeAgo(incident.timeline[incident.timeline.length - 1].timestamp)}`}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Incident History */}
        <section>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white mb-4 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Incident History (90 days)
            {showHistory ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {historyData && historyData.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-4">
                    {historyData.map((incident) => (
                      <div key={incident.id} className="relative">
                        <div className="absolute -left-[calc(1.5rem+5px)] top-1 w-2.5 h-2.5 rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-950" />
                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <SeverityBadge severity={incident.severity} />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {incident.title}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(incident.startedAt).toLocaleDateString()}
                            {incident.resolvedAt &&
                              ` — Resolved ${timeAgo(incident.resolvedAt)}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No incidents in the last 90 days.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
