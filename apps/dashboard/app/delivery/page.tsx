"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@ktblog/ui/components";
import {
    Download,
    Key,
    Bell,
    Shield,
    AlertTriangle,
    Eye,
    EyeOff,
    Copy,
    Check,
    RefreshCw,
    Trash2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    MoreHorizontal,
    Search,
    Loader2,
    X,
    HardDrive,
    Link2,
    Send,
    Globe,
    Clock,
    Ban,
    CheckCircle,
} from "lucide-react";
import {
    useDownloadAnalytics,
    useDownloadLinks,
    useRevokeDownloadLink,
    useAdminLicenses,
    useRevokeLicense,
    useProductUpdates,
    usePublishProductUpdate,
    useSendUpdateNotifications,
    usePendingNotifications,
    useSuspiciousDownloads,
    useDismissSuspiciousPattern,
    type DownloadLink,
    type License,
    type ProductUpdate,
    type SuspiciousPattern,
    type DownloadLinkFilters,
    type LicenseFilters,
} from "@/hooks/use-delivery";
import {
    useDigitalProducts,
    type DigitalProduct,
} from "@/hooks/use-digital-products";

// ─── Tab Types ───────────────────────────────────────────────────────────────

type TabId = "downloads" | "licenses" | "updates" | "abuse";

interface Tab {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

const TABS: Tab[] = [
    { id: "downloads", label: "Downloads", icon: <Download className="h-4 w-4" /> },
    { id: "licenses", label: "Licenses", icon: <Key className="h-4 w-4" /> },
    { id: "updates", label: "Updates", icon: <Bell className="h-4 w-4" /> },
    { id: "abuse", label: "Abuse Detection", icon: <Shield className="h-4 w-4" /> },
];

// ─── Constants ───────────────────────────────────────────────────────────────

const DOWNLOAD_STATUS_COLORS: Record<string, string> = {
    active: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    expired: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
    revoked: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    exhausted: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
};

const LICENSE_STATUS_COLORS: Record<string, string> = {
    active: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    suspended: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    revoked: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    expired: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const LICENSE_TYPE_COLORS: Record<string, string> = {
    personal: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    commercial: "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
    extended: "bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300",
    enterprise: "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300",
    unlimited: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
};

const SUSPICIOUS_TYPE_COLORS: Record<string, string> = {
    rate_limit: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    geographic_anomaly: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    bulk_download: "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
};

const SUSPICIOUS_TYPE_LABELS: Record<string, string> = {
    rate_limit: "Rate Limit",
    geographic_anomaly: "Geo Anomaly",
    bulk_download: "Bulk Download",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function formatDatetime(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function maskLicenseKey(key: string): string {
    if (key.length <= 8) return key;
    return `${key.slice(0, 4)}${"*".repeat(Math.min(key.length - 8, 16))}${key.slice(-4)}`;
}

function relativeTime(dateString: string): string {
    const now = Date.now();
    const date = new Date(dateString).getTime();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateString);
}

// ─── Stats Card Component ────────────────────────────────────────────────────

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconBgClass: string;
    description?: string;
    trend?: { value: number; isUp: boolean };
}

function StatsCard({ label, value, icon, iconBgClass, description, trend }: StatsCardProps) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="flex items-center gap-4">
                <div
                    className={`h-11 w-11 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass}`}
                >
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">
                        {label}
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-0.5">
                            {value}
                        </p>
                        {trend && (
                            <span
                                className={`text-xs font-medium flex items-center gap-0.5 ${
                                    trend.isUp
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-red-600 dark:text-red-400"
                                }`}
                            >
                                {trend.isUp ? (
                                    <ChevronUp className="h-3 w-3" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                                {trend.value}%
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function DeliveryPage() {
    const { success, error: toastError } = useToast();

    // Tab state
    const [activeTab, setActiveTab] = React.useState<TabId>("downloads");

    // Downloads tab state
    const [dlSearch, setDlSearch] = React.useState("");
    const [dlStatusFilter, setDlStatusFilter] = React.useState("all");
    const [dlCursor, setDlCursor] = React.useState<string | undefined>(undefined);

    // Licenses tab state
    const [licSearch, setLicSearch] = React.useState("");
    const [licTypeFilter, setLicTypeFilter] = React.useState("all");
    const [licStatusFilter, setLicStatusFilter] = React.useState("all");
    const [licCursor, setLicCursor] = React.useState<string | undefined>(undefined);
    const [expandedLicenseId, setExpandedLicenseId] = React.useState<string | null>(null);
    const [revokeLicenseId, setRevokeLicenseId] = React.useState<string | null>(null);
    const [revokeReason, setRevokeReason] = React.useState("");
    const [isRevokeModalOpen, setIsRevokeModalOpen] = React.useState(false);

    // License key visibility
    const [visibleKeys, setVisibleKeys] = React.useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

    // Updates tab state
    const [updateProductId, setUpdateProductId] = React.useState("");
    const [updateVersion, setUpdateVersion] = React.useState("");
    const [updateReleaseNotes, setUpdateReleaseNotes] = React.useState("");
    const [updateIsBreaking, setUpdateIsBreaking] = React.useState(false);

    // Build download link filters
    const dlFilters = React.useMemo(() => {
        const filters: DownloadLinkFilters = {};
        if (dlSearch) filters.search = dlSearch;
        if (dlStatusFilter !== "all") filters.status = dlStatusFilter;
        if (dlCursor) filters.cursor = dlCursor;
        filters.limit = 20;
        return filters;
    }, [dlSearch, dlStatusFilter, dlCursor]);

    // Build license filters
    const licFilters = React.useMemo(() => {
        const filters: LicenseFilters = {};
        if (licSearch) filters.search = licSearch;
        if (licTypeFilter !== "all") filters.licenseType = licTypeFilter;
        if (licStatusFilter !== "all") filters.status = licStatusFilter;
        if (licCursor) filters.cursor = licCursor;
        filters.limit = 20;
        return filters;
    }, [licSearch, licTypeFilter, licStatusFilter, licCursor]);

    // Reset cursors on filter change
    React.useEffect(() => {
        setDlCursor(undefined);
    }, [dlSearch, dlStatusFilter]);

    React.useEffect(() => {
        setLicCursor(undefined);
    }, [licSearch, licTypeFilter, licStatusFilter]);

    // ─── Data Fetching ───────────────────────────────────────────────────────

    const {
        data: analyticsData,
        isLoading: isLoadingAnalytics,
    } = useDownloadAnalytics();

    const {
        data: dlData,
        isLoading: isLoadingDl,
    } = useDownloadLinks(dlFilters);
    const downloadLinks = dlData?.items ?? [];
    const dlMeta = dlData?.meta;

    const {
        data: licData,
        isLoading: isLoadingLic,
    } = useAdminLicenses(licFilters);
    const licenses = licData?.items ?? [];
    const licMeta = licData?.meta;

    const {
        data: updatesData,
        isLoading: isLoadingUpdates,
    } = useProductUpdates({});
    const productUpdates = updatesData?.items ?? [];

    const {
        data: pendingData,
    } = usePendingNotifications();
    const pendingNotifications = pendingData ?? [];

    const {
        data: suspiciousData,
        isLoading: isLoadingSuspicious,
    } = useSuspiciousDownloads();
    const suspiciousPatterns = suspiciousData?.items ?? [];

    const { data: productsData } = useDigitalProducts({ status: "published", limit: 100 });
    const allProducts = productsData?.items ?? [];

    // ─── Mutations ───────────────────────────────────────────────────────────

    const revokeDownloadLinkMutation = useRevokeDownloadLink();
    const revokeLicenseMutation = useRevokeLicense();
    const publishUpdateMutation = usePublishProductUpdate();
    const sendNotificationsMutation = useSendUpdateNotifications();
    const dismissPatternMutation = useDismissSuspiciousPattern();

    // ─── Download Actions ────────────────────────────────────────────────────

    const handleRevokeDownloadLink = (link: DownloadLink) => {
        revokeDownloadLinkMutation.mutate(link.id, {
            onSuccess: () => {
                success(
                    "Link revoked",
                    `Download link for "${link.product?.title || "product"}" has been revoked.`
                );
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to revoke download link.");
            },
        });
    };

    // ─── License Actions ─────────────────────────────────────────────────────

    const handleOpenRevokeModal = (licenseId: string) => {
        setRevokeLicenseId(licenseId);
        setRevokeReason("");
        setIsRevokeModalOpen(true);
    };

    const handleConfirmRevokeLicense = () => {
        if (!revokeLicenseId) return;
        revokeLicenseMutation.mutate(
            { id: revokeLicenseId, reason: revokeReason },
            {
                onSuccess: () => {
                    success("License revoked", "The license has been revoked successfully.");
                    setIsRevokeModalOpen(false);
                    setRevokeLicenseId(null);
                    setRevokeReason("");
                },
                onError: (err) => {
                    toastError("Error", err.message || "Failed to revoke license.");
                },
            }
        );
    };

    const toggleKeyVisibility = (licenseId: string) => {
        setVisibleKeys((prev) => {
            const next = new Set(prev);
            if (next.has(licenseId)) {
                next.delete(licenseId);
            } else {
                next.add(licenseId);
            }
            return next;
        });
    };

    const handleCopyKey = (licenseKey: string, licenseId: string) => {
        navigator.clipboard.writeText(licenseKey);
        setCopiedKey(licenseId);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleExpandLicense = (licenseId: string) => {
        setExpandedLicenseId((prev) => (prev === licenseId ? null : licenseId));
    };

    // ─── Update Actions ──────────────────────────────────────────────────────

    const handlePublishUpdate = () => {
        if (!updateProductId || !updateVersion || !updateReleaseNotes) {
            toastError("Validation", "Please fill in all required fields.");
            return;
        }

        publishUpdateMutation.mutate(
            {
                digitalProductId: updateProductId,
                version: updateVersion,
                releaseNotes: updateReleaseNotes,
                isBreaking: updateIsBreaking,
            },
            {
                onSuccess: () => {
                    success("Update published", `Version ${updateVersion} has been published.`);
                    setUpdateProductId("");
                    setUpdateVersion("");
                    setUpdateReleaseNotes("");
                    setUpdateIsBreaking(false);
                },
                onError: (err) => {
                    toastError("Error", err.message || "Failed to publish update.");
                },
            }
        );
    };

    const handleSendNotifications = (updateId: string) => {
        sendNotificationsMutation.mutate(updateId, {
            onSuccess: () => {
                success("Notifications sent", "All buyers have been notified of the update.");
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to send notifications.");
            },
        });
    };

    // ─── Abuse Actions ───────────────────────────────────────────────────────

    const handleDismissPattern = (pattern: SuspiciousPattern) => {
        dismissPatternMutation.mutate(pattern.id, {
            onSuccess: () => {
                success("Dismissed", "The suspicious pattern has been dismissed.");
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to dismiss pattern.");
            },
        });
    };

    // ─── Computed Values ─────────────────────────────────────────────────────

    const totalDownloads = analyticsData?.totalDownloads ?? 0;
    const activeLinks = analyticsData?.activeLinks ?? 0;
    const totalLicenses = analyticsData?.totalLicenses ?? 0;
    const totalBandwidth = analyticsData?.totalBandwidth ?? 0;
    const downloadsByProduct = analyticsData?.downloadsByProduct ?? [];
    const downloadsByCountry = analyticsData?.downloadsByCountry ?? [];

    const maxProductDownloads = Math.max(
        ...downloadsByProduct.map((d) => d.count),
        1
    );

    // ─── Render Helpers ──────────────────────────────────────────────────────

    const getStatusBadge = (status: string, colorMap: Record<string, string>) => {
        return (
            <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap capitalize ${colorMap[status] || ""}`}
            >
                {status.replace("_", " ")}
            </span>
        );
    };

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Delivery & Licensing"
                description="Manage download links, licenses, product updates, and monitor abuse"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Delivery" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        label="Total Downloads"
                        value={
                            isLoadingAnalytics
                                ? "..."
                                : totalDownloads.toLocaleString()
                        }
                        icon={<Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                        iconBgClass="bg-indigo-100 dark:bg-indigo-900/40"
                    />
                    <StatsCard
                        label="Active Links"
                        value={
                            isLoadingAnalytics
                                ? "..."
                                : activeLinks.toLocaleString()
                        }
                        icon={<Link2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                        iconBgClass="bg-emerald-100 dark:bg-emerald-900/40"
                    />
                    <StatsCard
                        label="Active Licenses"
                        value={
                            isLoadingAnalytics
                                ? "..."
                                : totalLicenses.toLocaleString()
                        }
                        icon={<Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        iconBgClass="bg-purple-100 dark:bg-purple-900/40"
                    />
                    <StatsCard
                        label="Bandwidth Used"
                        value={
                            isLoadingAnalytics
                                ? "..."
                                : formatBytes(totalBandwidth)
                        }
                        icon={<HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
                        iconBgClass="bg-amber-100 dark:bg-amber-900/40"
                    />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.id
                                        ? "border-primary text-primary"
                                        : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-600"
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.id === "abuse" && suspiciousPatterns.length > 0 && (
                                    <span className="ml-1 h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {suspiciousPatterns.length}
                                    </span>
                                )}
                                {tab.id === "updates" && pendingNotifications.length > 0 && (
                                    <span className="ml-1 h-5 min-w-[20px] px-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                                        {pendingNotifications.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-6">
                        {/* ─── Downloads Tab ──────────────────────────────── */}
                        {activeTab === "downloads" && (
                            <div className="space-y-6">
                                {/* Search and filters */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="relative w-full sm:w-96">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Search by product, user email, or token..."
                                            className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                            value={dlSearch}
                                            onChange={(e) => setDlSearch(e.target.value)}
                                        />
                                    </div>
                                    <Select value={dlStatusFilter} onValueChange={setDlStatusFilter}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                            <SelectItem value="revoked">Revoked</SelectItem>
                                            <SelectItem value="exhausted">Exhausted</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Download links table */}
                                {isLoadingDl ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                            Loading download links...
                                        </p>
                                    </div>
                                ) : downloadLinks.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Product
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            User
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                            Downloads
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                            Expires
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                            Last Downloaded
                                                        </th>
                                                        <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                    {downloadLinks.map((link) => (
                                                        <tr
                                                            key={link.id}
                                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    {link.product?.featuredImage ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img
                                                                            src={link.product.featuredImage}
                                                                            alt=""
                                                                            className="h-9 w-12 rounded object-cover flex-shrink-0 hidden sm:block"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-9 w-12 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 hidden sm:block">
                                                                            <Download className="h-4 w-4 text-zinc-400" />
                                                                        </div>
                                                                    )}
                                                                    <div className="min-w-0">
                                                                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                                            {link.product?.title || "Unknown Product"}
                                                                        </p>
                                                                        <p className="text-xs text-zinc-400 font-mono truncate">
                                                                            {link.shortCode}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="min-w-0">
                                                                    {link.user?.name && (
                                                                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                                            {link.user.name}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                                        {link.user?.email || "Unknown"}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 hidden md:table-cell">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex-1 max-w-[80px] h-1.5 bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={`h-full rounded-full transition-all ${
                                                                                link.downloadCount >= link.maxDownloads
                                                                                    ? "bg-red-500"
                                                                                    : link.downloadCount / link.maxDownloads > 0.7
                                                                                      ? "bg-amber-500"
                                                                                      : "bg-emerald-500"
                                                                            }`}
                                                                            style={{
                                                                                width: `${Math.min(
                                                                                    (link.downloadCount / link.maxDownloads) * 100,
                                                                                    100
                                                                                )}%`,
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                                        {link.downloadCount}/{link.maxDownloads}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                {getStatusBadge(link.status, DOWNLOAD_STATUS_COLORS)}
                                                            </td>
                                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                    {formatDate(link.expiresAt)}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 hidden xl:table-cell">
                                                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                                    {link.lastDownloadedAt
                                                                        ? relativeTime(link.lastDownloadedAt)
                                                                        : "Never"}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                {link.status === "active" && (
                                                                    <button
                                                                        onClick={() => handleRevokeDownloadLink(link)}
                                                                        disabled={revokeDownloadLinkMutation.isPending}
                                                                        className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                        title="Revoke link"
                                                                    >
                                                                        <Ban className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Load More */}
                                        {dlMeta?.hasNextPage && (
                                            <div className="flex justify-center pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setDlCursor(dlMeta.nextCursor)}
                                                    className="gap-1.5"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                    Load More
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                            <Download className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                            No download links found
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm max-w-sm mx-auto">
                                            {dlSearch || dlStatusFilter !== "all"
                                                ? "Try adjusting your search or filter criteria."
                                                : "Download links will appear here when customers purchase products."}
                                        </p>
                                    </div>
                                )}

                                {/* Downloads by Product Chart */}
                                {downloadsByProduct.length > 0 && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                                                Downloads by Product
                                            </h3>
                                            <div className="space-y-3">
                                                {downloadsByProduct.slice(0, 8).map((item) => (
                                                    <div key={item.productId} className="space-y-1">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-zinc-700 dark:text-zinc-300 truncate mr-3">
                                                                {item.productTitle}
                                                            </span>
                                                            <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs flex-shrink-0">
                                                                {item.count.toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500 rounded-full transition-all"
                                                                style={{
                                                                    width: `${(item.count / maxProductDownloads) * 100}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                                                Downloads by Country
                                            </h3>
                                            <div className="space-y-2.5">
                                                {downloadsByCountry.slice(0, 10).map((item) => (
                                                    <div
                                                        key={item.country}
                                                        className="flex items-center justify-between text-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-3.5 w-3.5 text-zinc-400" />
                                                            <span className="text-zinc-700 dark:text-zinc-300">
                                                                {item.country}
                                                            </span>
                                                        </div>
                                                        <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                                                            {item.count.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Licenses Tab ───────────────────────────────── */}
                        {activeTab === "licenses" && (
                            <div className="space-y-6">
                                {/* Search and filters */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                    <div className="relative w-full sm:w-96">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                        <Input
                                            placeholder="Search by license key, email, or product..."
                                            className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                            value={licSearch}
                                            onChange={(e) => setLicSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Select value={licTypeFilter} onValueChange={setLicTypeFilter}>
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Types</SelectItem>
                                                <SelectItem value="personal">Personal</SelectItem>
                                                <SelectItem value="commercial">Commercial</SelectItem>
                                                <SelectItem value="extended">Extended</SelectItem>
                                                <SelectItem value="enterprise">Enterprise</SelectItem>
                                                <SelectItem value="unlimited">Unlimited</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={licStatusFilter} onValueChange={setLicStatusFilter}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="revoked">Revoked</SelectItem>
                                                <SelectItem value="expired">Expired</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Licenses table */}
                                {isLoadingLic ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                            Loading licenses...
                                        </p>
                                    </div>
                                ) : licenses.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                        <th className="w-8 px-2 py-3" />
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            License Key
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                            Product
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                            User
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Type
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                            Activations
                                                        </th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                            Expires
                                                        </th>
                                                        <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                    {licenses.map((license) => (
                                                        <React.Fragment key={license.id}>
                                                            <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                                <td className="w-8 px-2 py-3">
                                                                    <button
                                                                        onClick={() => toggleExpandLicense(license.id)}
                                                                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                                    >
                                                                        {expandedLicenseId === license.id ? (
                                                                            <ChevronUp className="h-4 w-4" />
                                                                        ) : (
                                                                            <ChevronDown className="h-4 w-4" />
                                                                        )}
                                                                    </button>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <code className="text-sm font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                                                                            {visibleKeys.has(license.id)
                                                                                ? license.licenseKey
                                                                                : maskLicenseKey(license.licenseKey)}
                                                                        </code>
                                                                        <button
                                                                            onClick={() => toggleKeyVisibility(license.id)}
                                                                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                                            title={
                                                                                visibleKeys.has(license.id)
                                                                                    ? "Hide key"
                                                                                    : "Show key"
                                                                            }
                                                                        >
                                                                            {visibleKeys.has(license.id) ? (
                                                                                <EyeOff className="h-3.5 w-3.5" />
                                                                            ) : (
                                                                                <Eye className="h-3.5 w-3.5" />
                                                                            )}
                                                                        </button>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleCopyKey(license.licenseKey, license.id)
                                                                            }
                                                                            className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                                                                            title="Copy key"
                                                                        >
                                                                            {copiedKey === license.id ? (
                                                                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                                                                            ) : (
                                                                                <Copy className="h-3.5 w-3.5" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 hidden md:table-cell">
                                                                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate block max-w-[180px]">
                                                                        {license.product?.title || "Unknown"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                                    <div className="min-w-0">
                                                                        {license.user?.name && (
                                                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                                                {license.user.name}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                                            {license.user?.email || "Unknown"}
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {getStatusBadge(license.licenseType, LICENSE_TYPE_COLORS)}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    {getStatusBadge(license.status, LICENSE_STATUS_COLORS)}
                                                                </td>
                                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                        {license.activationCount}/{license.maxActivations}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 hidden xl:table-cell">
                                                                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                                        {license.expiresAt
                                                                            ? formatDate(license.expiresAt)
                                                                            : "Never"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    {license.status === "active" && (
                                                                        <button
                                                                            onClick={() => handleOpenRevokeModal(license.id)}
                                                                            className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                                            title="Revoke license"
                                                                        >
                                                                            <Ban className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                            {/* Expanded activation details */}
                                                            {expandedLicenseId === license.id && (
                                                                <tr>
                                                                    <td colSpan={9} className="px-4 py-4 bg-zinc-50 dark:bg-zinc-900/50">
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                                                <Key className="h-4 w-4" />
                                                                                Activation Details
                                                                            </div>
                                                                            {license.activatedDomains &&
                                                                            license.activatedDomains.length > 0 ? (
                                                                                <div className="space-y-1">
                                                                                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                                                        Activated Domains
                                                                                    </p>
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {license.activatedDomains.map(
                                                                                            (domain) => (
                                                                                                <span
                                                                                                    key={domain}
                                                                                                    className="px-2.5 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md"
                                                                                                >
                                                                                                    {domain}
                                                                                                </span>
                                                                                            )
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ) : null}

                                                                            {license.activations &&
                                                                            license.activations.length > 0 ? (
                                                                                <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700">
                                                                                    <table className="w-full text-sm">
                                                                                        <thead>
                                                                                            <tr className="bg-zinc-100 dark:bg-zinc-800">
                                                                                                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500 uppercase">
                                                                                                    Domain
                                                                                                </th>
                                                                                                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500 uppercase">
                                                                                                    Machine ID
                                                                                                </th>
                                                                                                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500 uppercase">
                                                                                                    IP Address
                                                                                                </th>
                                                                                                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500 uppercase">
                                                                                                    Activated
                                                                                                </th>
                                                                                                <th className="text-left px-3 py-2 text-xs font-medium text-zinc-500 uppercase">
                                                                                                    Status
                                                                                                </th>
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                                                            {license.activations.map(
                                                                                                (activation) => (
                                                                                                    <tr key={activation.id}>
                                                                                                        <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
                                                                                                            {activation.domain || "-"}
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                                                                                                            {activation.machineId
                                                                                                                ? activation.machineId.slice(0, 12) + "..."
                                                                                                                : "-"}
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 font-mono text-xs">
                                                                                                            {activation.ipAddress}
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2 text-zinc-500 dark:text-zinc-400 text-xs">
                                                                                                            {formatDatetime(activation.activatedAt)}
                                                                                                        </td>
                                                                                                        <td className="px-3 py-2">
                                                                                                            {activation.isActive ? (
                                                                                                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                                                                                                    <CheckCircle className="h-3 w-3" />
                                                                                                                    Active
                                                                                                                </span>
                                                                                                            ) : (
                                                                                                                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                                                                                                    <X className="h-3 w-3" />
                                                                                                                    Deactivated
                                                                                                                </span>
                                                                                                            )}
                                                                                                        </td>
                                                                                                    </tr>
                                                                                                )
                                                                                            )}
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            ) : (
                                                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                                                    No activations recorded for this license.
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Load More */}
                                        {licMeta?.hasNextPage && (
                                            <div className="flex justify-center pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setLicCursor(licMeta.nextCursor)}
                                                    className="gap-1.5"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                    Load More
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                            <Key className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                            No licenses found
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm max-w-sm mx-auto">
                                            {licSearch || licTypeFilter !== "all" || licStatusFilter !== "all"
                                                ? "Try adjusting your search or filter criteria."
                                                : "Licenses will appear here when customers purchase products."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Updates Tab ────────────────────────────────── */}
                        {activeTab === "updates" && (
                            <div className="space-y-6">
                                {/* Publish Update Form */}
                                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-700 p-5 space-y-4">
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Bell className="h-4 w-4 text-primary" />
                                        Publish Product Update
                                    </h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                Product *
                                            </label>
                                            <Select
                                                value={updateProductId}
                                                onValueChange={setUpdateProductId}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select product..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allProducts.map((product) => (
                                                        <SelectItem key={product.id} value={product.id}>
                                                            {product.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                Version *
                                            </label>
                                            <Input
                                                placeholder="e.g. 2.1.0"
                                                value={updateVersion}
                                                onChange={(e) => setUpdateVersion(e.target.value)}
                                                className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Release Notes *
                                        </label>
                                        <textarea
                                            placeholder="Describe what changed in this update..."
                                            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                                            value={updateReleaseNotes}
                                            onChange={(e) => setUpdateReleaseNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={updateIsBreaking}
                                                onChange={(e) => setUpdateIsBreaking(e.target.checked)}
                                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-red-500 focus:ring-red-500"
                                            />
                                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                Breaking change
                                            </span>
                                            {updateIsBreaking && (
                                                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 uppercase">
                                                    Breaking
                                                </span>
                                            )}
                                        </label>

                                        <Button
                                            onClick={handlePublishUpdate}
                                            disabled={
                                                publishUpdateMutation.isPending ||
                                                !updateProductId ||
                                                !updateVersion ||
                                                !updateReleaseNotes
                                            }
                                        >
                                            {publishUpdateMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Send className="h-4 w-4 mr-2" />
                                            )}
                                            Publish Update
                                        </Button>
                                    </div>
                                </div>

                                {/* Pending Notifications */}
                                {pendingNotifications.length > 0 && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/40 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                                Pending Notifications ({pendingNotifications.length})
                                            </h3>
                                        </div>
                                        <div className="space-y-2">
                                            {pendingNotifications.map((update) => (
                                                <div
                                                    key={update.id}
                                                    className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-md px-3 py-2 border border-amber-200/50 dark:border-amber-900/30"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                            {update.product?.title || "Unknown"}
                                                        </span>
                                                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex-shrink-0">
                                                            v{update.version}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSendNotifications(update.id)}
                                                        disabled={sendNotificationsMutation.isPending}
                                                        className="flex-shrink-0 ml-3 text-xs h-7"
                                                    >
                                                        {sendNotificationsMutation.isPending ? (
                                                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                        ) : (
                                                            <Send className="h-3 w-3 mr-1" />
                                                        )}
                                                        Send Notifications
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent Updates List */}
                                <div>
                                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
                                        Recent Updates
                                    </h3>
                                    {isLoadingUpdates ? (
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                                Loading updates...
                                            </p>
                                        </div>
                                    ) : productUpdates.length > 0 ? (
                                        <div className="space-y-3">
                                            {productUpdates.map((update) => (
                                                <div
                                                    key={update.id}
                                                    className="bg-white dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                    {update.product?.title || "Unknown Product"}
                                                                </span>
                                                                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                                                    v{update.version}
                                                                </span>
                                                                {update.isBreaking && (
                                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 uppercase">
                                                                        Breaking
                                                                    </span>
                                                                )}
                                                                {update.notifiedBuyers ? (
                                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 flex items-center gap-0.5">
                                                                        <Check className="h-2.5 w-2.5" />
                                                                        Notified
                                                                    </span>
                                                                ) : (
                                                                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-0.5">
                                                                        <Clock className="h-2.5 w-2.5" />
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
                                                                {update.releaseNotes}
                                                            </p>
                                                        </div>
                                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap flex-shrink-0">
                                                            {formatDate(update.publishedAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                                <Bell className="h-6 w-6 text-zinc-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                                No updates published
                                            </h3>
                                            <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm max-w-sm mx-auto">
                                                Publish your first product update using the form above.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── Abuse Detection Tab ────────────────────────── */}
                        {activeTab === "abuse" && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    <Shield className="h-4 w-4" />
                                    <span>
                                        Automated detection of suspicious download patterns. Review
                                        flagged activity and take action as needed.
                                    </span>
                                </div>

                                {isLoadingSuspicious ? (
                                    <div className="flex flex-col items-center justify-center py-16">
                                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-3" />
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                            Loading suspicious patterns...
                                        </p>
                                    </div>
                                ) : suspiciousPatterns.length > 0 ? (
                                    <div className="space-y-3">
                                        {suspiciousPatterns.map((pattern) => (
                                            <div
                                                key={pattern.id}
                                                className="bg-white dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-3 min-w-0">
                                                        <div className="h-9 w-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <AlertTriangle className="h-4.5 w-4.5 text-red-600 dark:text-red-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                    {pattern.userEmail || `User ${pattern.userId.slice(0, 8)}`}
                                                                </span>
                                                                <span
                                                                    className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                                                        SUSPICIOUS_TYPE_COLORS[pattern.type] || ""
                                                                    }`}
                                                                >
                                                                    {SUSPICIOUS_TYPE_LABELS[pattern.type] || pattern.type}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {pattern.details}
                                                            </p>
                                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                                Detected {relativeTime(pattern.detectedAt)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-shrink-0">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-xs h-8"
                                                            onClick={() => {
                                                                setActiveTab("downloads");
                                                                setDlSearch(pattern.userEmail || pattern.userId);
                                                            }}
                                                        >
                                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                                            Investigate
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs h-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                                            onClick={() => handleDismissPattern(pattern)}
                                                            disabled={dismissPatternMutation.isPending}
                                                        >
                                                            {dismissPatternMutation.isPending ? (
                                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            ) : (
                                                                <X className="h-3.5 w-3.5 mr-1" />
                                                            )}
                                                            Dismiss
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                            No suspicious activity detected
                                        </h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm max-w-sm mx-auto">
                                            The system is actively monitoring download patterns. Any
                                            suspicious activity will be flagged here automatically.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Revoke License Confirmation Modal */}
            <ConfirmModal
                open={isRevokeModalOpen}
                onOpenChange={setIsRevokeModalOpen}
                title="Revoke License"
                description="This action will permanently revoke the license. The user will no longer be able to use it. Please provide a reason."
                confirmLabel="Revoke License"
                cancelLabel="Cancel"
                onConfirm={handleConfirmRevokeLicense}
                isLoading={revokeLicenseMutation.isPending}
                variant="danger"
            >
                <div className="space-y-2 mt-3">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        Reason for revocation
                    </label>
                    <textarea
                        placeholder="e.g. License abuse, refund requested, terms violation..."
                        className="w-full min-h-[80px] px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                        value={revokeReason}
                        onChange={(e) => setRevokeReason(e.target.value)}
                    />
                </div>
            </ConfirmModal>
        </div>
    );
}
