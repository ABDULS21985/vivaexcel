"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook,
  Plus,
  Trash2,
  Send,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  ArrowLeft,
  Terminal,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RotateCw,
  Globe,
  Activity,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, Badge, Input } from "@ktblog/ui/components";
import { cn } from "@ktblog/ui/components";
import {
  useWebhookEndpoints,
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useDeleteWebhookEndpoint,
  useTestWebhook,
  useWebhookDeliveries,
  useRetryDelivery,
} from "@/hooks/use-developer";
import { WEBHOOK_EVENTS } from "@/types/developer";
import type {
  WebhookEndpoint,
  WebhookDelivery,
  CreateWebhookRequest,
} from "@/types/developer";

// =============================================================================
// Animation Variants
// =============================================================================

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
    hour: "2-digit",
    minute: "2-digit",
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

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500";
    case "FAILING":
      return "bg-amber-500";
    case "DISABLED":
      return "bg-red-500";
    default:
      return "bg-neutral-500";
  }
}

function getDeliveryStatusConfig(status: string) {
  switch (status) {
    case "DELIVERED":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/30",
        label: "Delivered",
      };
    case "FAILED":
      return {
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-50 dark:bg-red-950/30",
        label: "Failed",
      };
    case "RETRIED":
      return {
        icon: RotateCw,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-950/30",
        label: "Retried",
      };
    case "PENDING":
    default:
      return {
        icon: Clock,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/30",
        label: "Pending",
      };
  }
}

// =============================================================================
// Create Endpoint Modal
// =============================================================================

function CreateEndpointModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [urlError, setUrlError] = useState("");

  const createEndpoint = useCreateWebhookEndpoint();

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event],
    );
  };

  const selectAll = () => {
    setSelectedEvents(WEBHOOK_EVENTS.map((e) => e.value));
  };

  const deselectAll = () => {
    setSelectedEvents([]);
  };

  const validateUrl = (value: string) => {
    if (!value) {
      setUrlError("");
      return;
    }
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") {
        setUrlError("URL must use HTTPS");
      } else {
        setUrlError("");
      }
    } catch {
      setUrlError("Please enter a valid URL");
    }
  };

  const handleCreate = async () => {
    if (!url.trim() || selectedEvents.length === 0 || urlError) return;
    const payload: CreateWebhookRequest = {
      url: url.trim(),
      events: selectedEvents,
    };
    try {
      await createEndpoint.mutateAsync(payload);
      handleClose();
    } catch {
      // Error handled by mutation state
    }
  };

  const handleClose = () => {
    setUrl("");
    setSelectedEvents([]);
    setUrlError("");
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
                Add Webhook Endpoint
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-6">
              {/* URL */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                  Endpoint URL
                </label>
                <Input
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    validateUrl(e.target.value);
                  }}
                  placeholder="https://your-domain.com/webhooks/ktblog"
                  className={cn("w-full", urlError && "border-red-500")}
                />
                {urlError ? (
                  <p className="text-xs text-red-500 mt-1.5">{urlError}</p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-1.5">
                    Must be an HTTPS URL that can accept POST requests.
                  </p>
                )}
              </div>

              {/* Events */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Events to Subscribe
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={selectAll}
                      className="text-xs text-[#1E4DB7] hover:underline"
                    >
                      Select all
                    </button>
                    <span className="text-xs text-neutral-300">/</span>
                    <button
                      onClick={deselectAll}
                      className="text-xs text-neutral-500 hover:underline"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {WEBHOOK_EVENTS.map((event) => (
                    <button
                      key={event.value}
                      onClick={() => toggleEvent(event.value)}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-lg border transition-all text-left text-sm",
                        selectedEvents.includes(event.value)
                          ? "border-[#1E4DB7]/50 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300",
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          selectedEvents.includes(event.value)
                            ? "border-[#1E4DB7] bg-[#1E4DB7]"
                            : "border-neutral-300 dark:border-neutral-600",
                        )}
                      >
                        {selectedEvents.includes(event.value) && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-neutral-700 dark:text-neutral-300 text-xs">
                        {event.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-800">
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
                  !url.trim() ||
                  !!urlError ||
                  selectedEvents.length === 0 ||
                  createEndpoint.isPending
                }
                className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl"
              >
                {createEndpoint.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Webhook className="h-4 w-4 mr-2" />
                    Create Endpoint
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Endpoint Card
// =============================================================================

function EndpointCard({ endpoint }: { endpoint: WebhookEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const deleteEndpoint = useDeleteWebhookEndpoint();
  const testWebhook = useTestWebhook();
  const updateEndpoint = useUpdateWebhookEndpoint();

  const handleDelete = async () => {
    try {
      await deleteEndpoint.mutateAsync(endpoint.id);
      setShowDelete(false);
    } catch {
      // handled
    }
  };

  const handleTest = () => {
    testWebhook.mutate({ id: endpoint.id, event: "order.created" });
  };

  const handleToggleStatus = () => {
    updateEndpoint.mutate({
      id: endpoint.id,
      status: endpoint.status === "ACTIVE" ? "DISABLED" : "ACTIVE",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 overflow-hidden"
      >
        {/* Main row */}
        <div
          className="flex items-center gap-4 p-4 md:p-5 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Status indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Globe className="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
            </div>
            <div
              className={cn(
                "absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-neutral-900",
                getStatusColor(endpoint.status),
              )}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-mono text-neutral-900 dark:text-white truncate">
                {endpoint.url}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-neutral-500">
              <span>{endpoint.events.length} events</span>
              <span>-</span>
              <span>Last delivery: {formatRelative(endpoint.lastDeliveryAt)}</span>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 py-0 h-5 hidden sm:flex",
              endpoint.status === "ACTIVE"
                ? "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400"
                : endpoint.status === "FAILING"
                  ? "border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400"
                  : "border-red-300 text-red-700 dark:border-red-700 dark:text-red-400",
            )}
          >
            {endpoint.status}
          </Badge>

          {/* Expand */}
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
              <div className="px-4 md:px-5 pb-5 border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-5">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <p className="text-xs text-neutral-500 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          getStatusColor(endpoint.status),
                        )}
                      />
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {endpoint.status}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <p className="text-xs text-neutral-500 mb-1">Failures</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {endpoint.failureCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <p className="text-xs text-neutral-500 mb-1">
                      Last Success
                    </p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatRelative(endpoint.lastSuccessAt)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                    <p className="text-xs text-neutral-500 mb-1">Created</p>
                    <p className="text-sm font-medium text-neutral-900 dark:text-white">
                      {formatDate(endpoint.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Signing secret */}
                {endpoint.secret && (
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                      Signing Secret
                    </p>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
                      <code className="flex-1 text-sm font-mono text-neutral-300">
                        {showSecret
                          ? endpoint.secret
                          : "whsec_" + "*".repeat(32)}
                      </code>
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="p-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        {showSecret ? (
                          <EyeOff className="h-4 w-4 text-neutral-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-neutral-500" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Events */}
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                    Subscribed Events
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {endpoint.events.map((event) => (
                      <Badge
                        key={event}
                        variant="secondary"
                        className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTest}
                    disabled={testWebhook.isPending}
                    className="rounded-lg text-[#1E4DB7] border-[#1E4DB7]/30 hover:bg-[#1E4DB7]/5"
                  >
                    {testWebhook.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Send Test Event
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={updateEndpoint.isPending}
                    className={cn(
                      "rounded-lg",
                      endpoint.status === "ACTIVE"
                        ? "text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800"
                        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800",
                    )}
                  >
                    {endpoint.status === "ACTIVE" ? "Disable" : "Enable"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDelete(true)}
                    className="rounded-lg text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete confirmation */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDelete(false);
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                Delete Webhook Endpoint
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Are you sure you want to delete this endpoint? All delivery
                history will be permanently lost and events will no longer be
                sent.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDelete(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleteEndpoint.isPending}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleteEndpoint.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// =============================================================================
// Delivery Log Row
// =============================================================================

function DeliveryRow({ delivery }: { delivery: WebhookDelivery }) {
  const [expanded, setExpanded] = useState(false);
  const retryDelivery = useRetryDelivery();
  const config = getDeliveryStatusConfig(delivery.status);
  const StatusIcon = config.icon;

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 md:p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Status icon */}
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            config.bg,
          )}
        >
          <StatusIcon className={cn("h-4 w-4", config.color)} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="text-[10px] font-mono bg-neutral-100 dark:bg-neutral-800"
            >
              {delivery.event}
            </Badge>
            {delivery.responseStatus && (
              <span
                className={cn(
                  "text-xs font-mono",
                  delivery.responseStatus >= 200 &&
                    delivery.responseStatus < 300
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400",
                )}
              >
                {delivery.responseStatus}
              </span>
            )}
          </div>
        </div>

        {/* Duration */}
        {delivery.duration !== undefined && (
          <span className="text-xs text-neutral-500 hidden sm:block">
            {delivery.duration}ms
          </span>
        )}

        {/* Time */}
        <span className="text-xs text-neutral-500 flex-shrink-0">
          {formatRelative(delivery.createdAt)}
        </span>

        {/* Expand */}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-3">
              {/* Metadata */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-neutral-500 mb-0.5">Status</p>
                  <p className={cn("font-medium", config.color)}>
                    {config.label}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-0.5">Attempts</p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {delivery.attempts}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-0.5">Duration</p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {delivery.duration ? `${delivery.duration}ms` : "--"}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-500 mb-0.5">Delivered At</p>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {delivery.deliveredAt
                      ? formatDate(delivery.deliveredAt)
                      : "--"}
                  </p>
                </div>
              </div>

              {/* Payload */}
              <div>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Request Payload
                </p>
                <pre className="p-3 rounded-lg bg-neutral-950 text-xs text-neutral-300 font-mono overflow-x-auto max-h-40">
                  {JSON.stringify(delivery.payload, null, 2)}
                </pre>
              </div>

              {/* Response */}
              {delivery.responseBody && (
                <div>
                  <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                    Response Body
                  </p>
                  <pre className="p-3 rounded-lg bg-neutral-950 text-xs text-neutral-300 font-mono overflow-x-auto max-h-40">
                    {delivery.responseBody}
                  </pre>
                </div>
              )}

              {/* Retry button */}
              {(delivery.status === "FAILED" ||
                delivery.status === "RETRIED") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => retryDelivery.mutate(delivery.id)}
                  disabled={retryDelivery.isPending}
                  className="rounded-lg"
                >
                  {retryDelivery.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Retry Delivery
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
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
              <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse mb-2" />
              <div className="h-3 w-40 bg-neutral-100 dark:bg-neutral-800/50 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// Webhooks Page
// =============================================================================

export default function WebhooksPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | undefined>(
    undefined,
  );
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");
  const [eventFilter, setEventFilter] = useState<string | "all">("all");

  const {
    data: endpoints,
    isLoading: endpointsLoading,
    error: endpointsError,
  } = useWebhookEndpoints();
  const { data: deliveries, isLoading: deliveriesLoading } =
    useWebhookDeliveries(selectedEndpoint);

  const endpointsList = Array.isArray(endpoints) ? endpoints : [];
  const deliveriesList = Array.isArray(deliveries) ? deliveries : [];

  const filteredDeliveries = useMemo(() => {
    let result = deliveriesList;
    if (statusFilter !== "all") {
      result = result.filter((d: WebhookDelivery) => d.status === statusFilter);
    }
    if (eventFilter !== "all") {
      result = result.filter((d: WebhookDelivery) => d.event === eventFilter);
    }
    return result;
  }, [deliveriesList, statusFilter, eventFilter]);

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
                Webhooks
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage webhook endpoints and monitor event deliveries.
              </p>
            </div>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Mobile create button */}
          <div className="sm:hidden">
            <Button
              onClick={() => setShowCreate(true)}
              className="w-full bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </div>

          {/* ============================================================= */}
          {/* ENDPOINTS SECTION */}
          {/* ============================================================= */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Webhook className="h-5 w-5 text-[#1E4DB7]" />
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Endpoints
              </h2>
              {endpointsList.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-neutral-100 dark:bg-neutral-800"
                >
                  {endpointsList.length}
                </Badge>
              )}
            </div>

            {endpointsLoading ? (
              <LoadingSkeleton />
            ) : endpointsError ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <p className="text-neutral-600 dark:text-neutral-400">
                  Failed to load endpoints. Please try again later.
                </p>
              </div>
            ) : endpointsList.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mx-auto mb-4">
                  <Webhook className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  No Webhook Endpoints
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 max-w-sm mx-auto">
                  Create your first endpoint to start receiving real-time event
                  notifications.
                </p>
                <Button
                  onClick={() => setShowCreate(true)}
                  className="bg-[#1E4DB7] hover:bg-[#143A8F] text-white rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Endpoint
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {endpointsList.map((endpoint: WebhookEndpoint) => (
                  <EndpointCard key={endpoint.id} endpoint={endpoint} />
                ))}
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* DELIVERY LOG SECTION */}
          {/* ============================================================= */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#F59A23]" />
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Delivery Log
                </h2>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedEndpoint ?? "all"}
                  onChange={(e) =>
                    setSelectedEndpoint(
                      e.target.value === "all" ? undefined : e.target.value,
                    )
                  }
                  className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <option value="all">All Endpoints</option>
                  {endpointsList.map((ep: WebhookEndpoint) => (
                    <option key={ep.id} value={ep.id}>
                      {new URL(ep.url).hostname}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  <option value="all">All Status</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="FAILED">Failed</option>
                  <option value="PENDING">Pending</option>
                  <option value="RETRIED">Retried</option>
                </select>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="text-xs py-1.5 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hidden md:block"
                >
                  <option value="all">All Events</option>
                  {WEBHOOK_EVENTS.map((evt) => (
                    <option key={evt.value} value={evt.value}>
                      {evt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {deliveriesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800/50 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredDeliveries.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <Clock className="h-8 w-8 text-neutral-400 mx-auto mb-3" />
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  No deliveries found. Send a test event to see delivery logs.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDeliveries.map((delivery: WebhookDelivery) => (
                  <DeliveryRow key={delivery.id} delivery={delivery} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateEndpointModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </div>
  );
}
