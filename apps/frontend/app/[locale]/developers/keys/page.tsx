"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Check,
  AlertTriangle,
  RotateCw,
  Trash2,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Activity,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  ArrowLeft,
  Terminal,
  Server,
  TestTube,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, Badge, Input, Switch } from "@ktblog/ui/components";
import { cn } from "@ktblog/ui/components";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useRotateApiKey,
} from "@/hooks/use-developer";
import {
  ApiKeyEnvironment,
  ApiKeyStatus,
  API_SCOPES,
} from "@/types/developer";
import type { CreateApiKeyRequest } from "@/types/developer";

// =============================================================================
// Animation Variants
// =============================================================================

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

// =============================================================================
// Helpers
// =============================================================================

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatRelative(dateString?: string) {
  if (!dateString) return "Never";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateString);
}

// =============================================================================
// Create Key Modal
// =============================================================================

function CreateKeyModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>(
    ApiKeyEnvironment.TEST,
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createKey = useCreateApiKey();

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const handleCreate = async () => {
    if (!name.trim() || selectedScopes.length === 0) return;
    const payload: CreateApiKeyRequest = {
      name: name.trim(),
      environment,
      scopes: selectedScopes,
    };
    try {
      const result = await createKey.mutateAsync(payload);
      setCreatedKey(result.fullKey);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setEnvironment(ApiKeyEnvironment.TEST);
    setSelectedScopes([]);
    setCreatedKey(null);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                {createdKey ? "API Key Created" : "Create New API Key"}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {createdKey ? (
                /* Key created -- show full key */
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                        Save this key now
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        This is the only time you will see the full API key.
                        Store it securely -- you will not be able to retrieve it
                        again.
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="p-4 bg-neutral-950 rounded-xl font-mono text-sm text-green-400 break-all select-all">
                      {createdKey}
                    </div>
                    <button
                      onClick={handleCopy}
                      className="absolute top-3 right-3 p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Creation form */
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                      Key Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., My App Production"
                      className="w-full"
                    />
                    <p className="text-xs text-neutral-500 mt-1.5">
                      A descriptive name to identify this key.
                    </p>
                  </div>

                  {/* Environment toggle */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                      Environment
                    </label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEnvironment(ApiKeyEnvironment.TEST)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium",
                          environment === ApiKeyEnvironment.TEST
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300",
                        )}
                      >
                        <TestTube className="h-4 w-4" />
                        Test
                      </button>
                      <button
                        onClick={() => setEnvironment(ApiKeyEnvironment.LIVE)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all text-sm font-medium",
                          environment === ApiKeyEnvironment.LIVE
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300"
                            : "border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:border-neutral-300",
                        )}
                      >
                        <Server className="h-4 w-4" />
                        Live
                      </button>
                    </div>
                  </div>

                  {/* Scopes */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                      Permissions
                    </label>
                    <div className="space-y-2">
                      {API_SCOPES.map((scope) => (
                        <button
                          key={scope.value}
                          onClick={() => toggleScope(scope.value)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                            selectedScopes.includes(scope.value)
                              ? "border-[#1E4DB7]/50 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10"
                              : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600",
                          )}
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                              selectedScopes.includes(scope.value)
                                ? "border-[#1E4DB7] bg-[#1E4DB7]"
                                : "border-neutral-300 dark:border-neutral-600",
                            )}
                          >
                            {selectedScopes.includes(scope.value) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">
                              {scope.label}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {scope.description}
                            </p>
                          </div>
                          <code className="text-xs text-neutral-400 dark:text-neutral-500 font-mono hidden sm:block">
                            {scope.value}
                          </code>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
              {createdKey ? (
                <Button onClick={handleClose} className="rounded-xl">
                  Done
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={
                      !name.trim() ||
                      selectedScopes.length === 0 ||
                      createKey.isPending
                    }
                    className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl"
                  >
                    {createKey.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Create Key
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Confirm Dialog
// =============================================================================

function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  variant = "danger",
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  variant?: "danger" | "warning";
  isLoading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                variant === "danger"
                  ? "bg-red-100 dark:bg-red-950/30"
                  : "bg-amber-100 dark:bg-amber-950/30",
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-6 w-6",
                  variant === "danger"
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400",
                )}
              />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
              {description}
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "rounded-xl text-white",
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-600 hover:bg-amber-700",
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Key Row Component
// =============================================================================

function ApiKeyRow({ apiKey }: { apiKey: any }) {
  const [expanded, setExpanded] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [showRotate, setShowRotate] = useState(false);
  const [copiedPrefix, setCopiedPrefix] = useState(false);

  const revokeKey = useRevokeApiKey();
  const rotateKey = useRotateApiKey();
  const [newRotatedKey, setNewRotatedKey] = useState<string | null>(null);
  const [copiedRotated, setCopiedRotated] = useState(false);

  const handleRevoke = async () => {
    try {
      await revokeKey.mutateAsync(apiKey.id);
      setShowRevoke(false);
    } catch {
      // handled
    }
  };

  const handleRotate = async () => {
    try {
      const result = await rotateKey.mutateAsync(apiKey.id);
      setNewRotatedKey(result.fullKey);
      setShowRotate(false);
    } catch {
      // handled
    }
  };

  const copyPrefix = () => {
    navigator.clipboard.writeText(apiKey.keyPrefix + "...");
    setCopiedPrefix(true);
    setTimeout(() => setCopiedPrefix(false), 2000);
  };

  const copyRotated = () => {
    if (newRotatedKey) {
      navigator.clipboard.writeText(newRotatedKey);
      setCopiedRotated(true);
      setTimeout(() => setCopiedRotated(false), 2000);
    }
  };

  const usagePercent = apiKey.monthlyRequestLimit
    ? Math.min(
        100,
        Math.round(
          (apiKey.monthlyRequestCount / apiKey.monthlyRequestLimit) * 100,
        ),
      )
    : 0;

  return (
    <>
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden"
      >
        {/* Main row */}
        <div
          className="flex items-center gap-4 p-4 md:p-5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Icon */}
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              apiKey.status === ApiKeyStatus.ACTIVE
                ? "bg-emerald-100 dark:bg-emerald-950/30"
                : "bg-neutral-100 dark:bg-neutral-800",
            )}
          >
            <Key
              className={cn(
                "h-5 w-5",
                apiKey.status === ApiKeyStatus.ACTIVE
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-neutral-400",
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                {apiKey.name}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5",
                  apiKey.environment === ApiKeyEnvironment.LIVE
                    ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                    : "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400",
                )}
              >
                {apiKey.environment}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5",
                  apiKey.status === ApiKeyStatus.ACTIVE
                    ? "border-green-300 text-green-700 dark:border-green-700 dark:text-green-400"
                    : "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400",
                )}
              >
                {apiKey.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <code className="text-xs text-neutral-500 font-mono">
                {apiKey.keyPrefix}...
              </code>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  copyPrefix();
                }}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {copiedPrefix ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3 text-neutral-400" />
                )}
              </button>
            </div>
          </div>

          {/* Metadata (desktop) */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-neutral-500">Last used</p>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {formatRelative(apiKey.lastUsedAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500">Requests</p>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {(apiKey.requestCount ?? 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Expand chevron */}
          <div className="flex-shrink-0">
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-neutral-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-neutral-400" />
            )}
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                {/* Rotated key alert */}
                {newRotatedKey && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                          New key generated -- save it now!
                        </p>
                        <div className="relative">
                          <code className="block p-3 bg-neutral-950 rounded-lg text-green-400 text-xs font-mono break-all select-all">
                            {newRotatedKey}
                          </code>
                          <button
                            onClick={copyRotated}
                            className="absolute top-2 right-2 p-1.5 rounded bg-neutral-800 hover:bg-neutral-700"
                          >
                            {copiedRotated ? (
                              <Check className="h-3.5 w-3.5 text-green-400" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-neutral-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-3.5 w-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">
                        Monthly Usage
                      </p>
                    </div>
                    <p className="text-lg font-bold text-neutral-900 dark:text-white">
                      {(apiKey.monthlyRequestCount ?? 0).toLocaleString()}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          usagePercent > 90
                            ? "bg-red-500"
                            : usagePercent > 70
                              ? "bg-amber-500"
                              : "bg-[#1E4DB7]",
                        )}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1">
                      {usagePercent}% of{" "}
                      {(apiKey.monthlyRequestLimit ?? 0).toLocaleString()} limit
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">Created</p>
                    </div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatDate(apiKey.createdAt)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="h-3.5 w-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">Rate Limit</p>
                    </div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {apiKey.rateLimit ?? 1000}/min
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      <p className="text-xs text-neutral-500">Expires</p>
                    </div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {apiKey.expiresAt
                        ? formatDate(apiKey.expiresAt)
                        : "Never"}
                    </p>
                  </div>
                </div>

                {/* Scopes */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Scopes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(apiKey.scopes ?? []).map((scope: string) => (
                      <Badge
                        key={scope}
                        variant="secondary"
                        className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                {apiKey.status === ApiKeyStatus.ACTIVE && (
                  <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRotate(true)}
                      className="rounded-lg text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950/30"
                    >
                      <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                      Rotate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowRevoke(true)}
                      className="rounded-lg text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Revoke
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={showRevoke}
        onClose={() => setShowRevoke(false)}
        onConfirm={handleRevoke}
        title="Revoke API Key"
        description={`Are you sure you want to revoke "${apiKey.name}"? This action cannot be undone. Any applications using this key will immediately lose access.`}
        confirmText="Revoke Key"
        variant="danger"
        isLoading={revokeKey.isPending}
      />

      <ConfirmDialog
        open={showRotate}
        onClose={() => setShowRotate(false)}
        onConfirm={handleRotate}
        title="Rotate API Key"
        description={`This will generate a new key for "${apiKey.name}" and invalidate the current one. Make sure to update your applications with the new key immediately.`}
        confirmText="Rotate Key"
        variant="warning"
        isLoading={rotateKey.isPending}
      />
    </>
  );
}

// =============================================================================
// Empty State
// =============================================================================

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 md:py-24"
    >
      <div className="w-20 h-20 rounded-2xl bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center mx-auto mb-6">
        <Key className="h-10 w-10 text-[#1E4DB7]" />
      </div>
      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
        No API Keys Yet
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-sm mx-auto">
        Create your first API key to start integrating with the KTBlog
        platform.
      </p>
      <Button
        onClick={onCreateClick}
        className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl px-6"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Key
      </Button>
    </motion.div>
  );
}

// =============================================================================
// Loading Skeleton
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2" />
              <div className="h-3 w-48 bg-neutral-100 dark:bg-neutral-800/50 rounded animate-pulse" />
            </div>
            <div className="hidden md:block h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// API Keys Page
// =============================================================================

export default function ApiKeysPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: apiKeys, isLoading, error } = useApiKeys();

  const keys = Array.isArray(apiKeys) ? apiKeys : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href="/developers"
                  className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 text-neutral-500" />
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 rounded-full">
                  <Terminal className="h-3.5 w-3.5 text-[#1E4DB7]" />
                  <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                    Developer Portal
                  </span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-1">
                API Keys
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage your API keys for authenticating requests.
              </p>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Mobile create button */}
          <div className="sm:hidden mb-4">
            <Button
              onClick={() => setShowCreate(true)}
              className="w-full bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/30">
            <Shield className="h-5 w-5 text-[#1E4DB7] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Keep your API keys secure
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Never expose API keys in client-side code or public
                repositories. Use environment variables and server-side proxy
                requests for production applications.
              </p>
            </div>
          </div>

          {/* Key list */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-16">
              <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              <p className="text-neutral-600 dark:text-neutral-400">
                Failed to load API keys. Please try again later.
              </p>
            </div>
          ) : keys.length === 0 ? (
            <EmptyState onCreateClick={() => setShowCreate(true)} />
          ) : (
            <div className="space-y-3">
              {keys.map((key: any) => (
                <ApiKeyRow key={key.id} apiKey={key} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateKeyModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
