"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Monitor,
  CheckCircle2,
  X,
} from "lucide-react";
import type { License, LicenseActivation } from "@/types/delivery";
import { useActivateLicense, useDeactivateLicense } from "@/hooks/use-delivery";

// =============================================================================
// Props
// =============================================================================

interface LicenseActivationManagerProps {
  license: License;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export default function LicenseActivationManager({
  license,
  className = "",
}: LicenseActivationManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [domainInput, setDomainInput] = useState("");
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(
    null,
  );

  const activateMutation = useActivateLicense();
  const deactivateMutation = useDeactivateLicense();

  const activations = (license.activations ?? []).filter((a) => a.isActive);
  const usagePercent =
    license.maxActivations > 0
      ? Math.round((license.activationCount / license.maxActivations) * 100)
      : 0;
  const canAddMore = license.activationCount < license.maxActivations;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleActivate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = domainInput.trim();
      if (!trimmed) return;

      await activateMutation.mutateAsync({
        licenseId: license.id,
        domain: trimmed,
      });

      setDomainInput("");
      setShowAddForm(false);
    },
    [domainInput, license.id, activateMutation],
  );

  const handleDeactivate = useCallback(
    async (activationId: string) => {
      await deactivateMutation.mutateAsync({
        licenseId: license.id,
        activationId,
      });
      setConfirmDeactivateId(null);
    },
    [license.id, deactivateMutation],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 ${className}`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
            Activations
          </h4>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {license.activationCount} / {license.maxActivations}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${
              usagePercent >= 90
                ? "bg-red-500"
                : usagePercent >= 70
                  ? "bg-amber-500"
                  : "bg-[#1E4DB7]"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(usagePercent, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Activation list */}
      <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
        <AnimatePresence>
          {activations.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400"
            >
              No active activations yet. Add a domain to get started.
            </motion.div>
          )}

          {activations.map((activation: LicenseActivation) => (
            <motion.div
              key={activation.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 py-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1E4DB7]/10 flex items-center justify-center">
                  {activation.domain ? (
                    <Globe className="h-4 w-4 text-[#1E4DB7]" />
                  ) : (
                    <Monitor className="h-4 w-4 text-[#1E4DB7]" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                    {activation.domain || activation.machineId || "Unknown"}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Activated{" "}
                    {new Date(activation.activatedAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    )}
                    {activation.ipAddress && ` from ${activation.ipAddress}`}
                  </p>
                </div>
              </div>

              {/* Deactivate / confirm */}
              <AnimatePresence mode="wait">
                {confirmDeactivateId === activation.id ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-1"
                  >
                    <button
                      onClick={() => handleDeactivate(activation.id)}
                      disabled={deactivateMutation.isPending}
                      className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                      title="Confirm deactivation"
                    >
                      {deactivateMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDeactivateId(null)}
                      className="p-1.5 rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
                      title="Cancel"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="deactivate"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setConfirmDeactivateId(activation.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Deactivate"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add activation form */}
      <div className="px-5 py-4 border-t border-neutral-100 dark:border-neutral-800">
        <AnimatePresence mode="wait">
          {showAddForm ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleActivate}
              className="space-y-3"
            >
              <div>
                <label
                  htmlFor={`domain-${license.id}`}
                  className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1"
                >
                  Domain
                </label>
                <input
                  id={`domain-${license.id}`}
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="example.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-colors"
                  autoFocus
                  required
                />
              </div>

              {activateMutation.isError && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>
                    {(activateMutation.error as Error)?.message ||
                      "Activation failed. Please try again."}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={activateMutation.isPending || !domainInput.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#1E4DB7] text-white hover:bg-[#143A8F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {activateMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Activate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setDomainInput("");
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(true)}
              disabled={!canAddMore}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1E4DB7] hover:text-[#143A8F] disabled:text-neutral-400 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4" />
              {canAddMore ? "Add Activation" : "Maximum activations reached"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
