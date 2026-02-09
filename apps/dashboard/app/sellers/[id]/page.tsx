"use client";

import * as React from "react";
import Link from "next/link";
import { use } from "react";
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
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Textarea,
} from "@ktblog/ui/components";
import {
    DollarSign,
    ShoppingCart,
    Package,
    Star,
    Percent,
    Wallet,
    ExternalLink,
    Shield,
    ShieldOff,
    Edit3,
    Save,
    Loader2,
    X,
    CheckCircle,
    Clock,
    AlertTriangle,
    User,
    Mail,
    Calendar,
    CreditCard,
    TrendingUp,
    BarChart3,
    FileText,
    MessageSquare,
    ArrowUpRight,
    RefreshCw,
    Eye,
    Copy,
    Check,
} from "lucide-react";
import {
    useAdminSeller,
    useUpdateSeller,
    useSuspendSeller,
    useReinstateSeller,
} from "../../../hooks/use-sellers";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SellerUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}

interface SellerProduct {
    id: string;
    title: string;
    slug: string;
    price: number;
    currency: string;
    status: string;
    thumbnailUrl: string | null;
    totalSales: number;
    averageRating: number;
    createdAt: string;
}

interface SellerOrder {
    id: string;
    orderNumber: string;
    total: number;
    currency: string;
    status: string;
    createdAt: string;
    buyerEmail: string;
}

interface SellerPayout {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    processedAt: string | null;
}

interface SellerReview {
    id: string;
    rating: number;
    title: string;
    body: string;
    userName: string;
    userAvatar: string | null;
    productTitle: string;
    createdAt: string;
}

interface Seller {
    id: string;
    displayName: string;
    slug: string;
    bio: string | null;
    status: string;
    verificationStatus: string;
    commissionRate: number;
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
    totalProducts: number;
    payoutBalance: number;
    payoutSchedule: string;
    stripeOnboardingComplete: boolean;
    createdAt: string;
    updatedAt: string;
    user: SellerUser;
    products?: SellerProduct[];
    recentOrders?: SellerOrder[];
    payouts?: SellerPayout[];
    reviews?: SellerReview[];
    adminNotes?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_BADGE_MAP: Record<string, { label: string; className: string }> = {
    approved: {
        label: "Approved",
        className: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    },
    pending_review: {
        label: "Pending Review",
        className: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    },
    suspended: {
        label: "Suspended",
        className: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    },
    rejected: {
        label: "Rejected",
        className: "bg-zinc-100/90 text-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-300",
    },
};

const VERIFICATION_BADGE_MAP: Record<string, { label: string; className: string }> = {
    verified: {
        label: "Verified",
        className: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    },
    pending: {
        label: "Pending Verification",
        className: "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    },
    unverified: {
        label: "Unverified",
        className: "bg-zinc-100/90 text-zinc-600 dark:bg-zinc-700/80 dark:text-zinc-300",
    },
};

const ORDER_STATUS_COLORS: Record<string, string> = {
    completed: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    pending: "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    processing: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    failed: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    refunded: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const PAYOUT_STATUS_COLORS: Record<string, string> = {
    completed: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    pending: "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    processing: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    failed: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(amount);
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

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;
    if (diffMonths < 12) return `${diffMonths} months ago`;
    return formatDate(dateString);
}

function getInitials(seller: Seller): string {
    if (seller.user?.firstName && seller.user?.lastName) {
        return `${seller.user.firstName.charAt(0)}${seller.user.lastName.charAt(0)}`.toUpperCase();
    }
    if (seller.displayName) {
        const parts = seller.displayName.split(" ");
        if (parts.length >= 2) {
            return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
        }
        return seller.displayName.charAt(0).toUpperCase();
    }
    return "S";
}

// ─── Helper Components ───────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={`${sizeClass} ${
                        i < Math.round(rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-300 dark:text-zinc-600"
                    }`}
                />
            ))}
        </div>
    );
}

function CopyableText({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-zinc-700 dark:text-zinc-300 truncate">
                {text}
            </span>
            <button
                onClick={handleCopy}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors flex-shrink-0"
                title={copied ? "Copied!" : `Copy ${label || "text"}`}
            >
                {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                    <Copy className="h-3.5 w-3.5" />
                )}
            </button>
        </div>
    );
}

function StatCard({
    icon,
    iconBg,
    iconColor,
    value,
    label,
}: {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    value: string;
    label: string;
}) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <span className={iconColor}>{icon}</span>
                </div>
                <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
                </div>
            </div>
        </div>
    );
}

function TimelineItem({
    label,
    description,
    date,
    dotColor,
    isLast = false,
}: {
    label: string;
    description?: string;
    date: string;
    dotColor: string;
    isLast?: boolean;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
                <div className={`h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                {!isLast && <div className="w-px h-full bg-zinc-200 dark:bg-zinc-700 min-h-[16px]" />}
            </div>
            <div className={isLast ? "" : "pb-4"}>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{label}</p>
                {description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
                )}
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    {formatDatetime(date)}
                </p>
            </div>
        </div>
    );
}

function SectionCard({
    title,
    icon,
    children,
    actions,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
}) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 dark:text-zinc-400">{icon}</span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</h3>
                </div>
                {actions && <div>{actions}</div>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="text-center py-12">
            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                {icon}
            </div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-white">{title}</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {description}
            </p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// ─── Skeleton Components ─────────────────────────────────────────────────────

function ProfileSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            {/* Banner + Avatar */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                <div className="h-32 bg-zinc-200 dark:bg-zinc-700" />
                <div className="px-6 pb-6">
                    <div className="flex items-end gap-4 -mt-10">
                        <div className="h-20 w-20 rounded-full bg-zinc-300 dark:bg-zinc-600 border-4 border-white dark:border-zinc-800" />
                        <div className="flex-1 pt-12 space-y-2">
                            <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        </div>
                        <div className="flex gap-2 pt-12">
                            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }, (_, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
                            <div className="space-y-2">
                                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                <div className="h-3 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Skeleton */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                <div className="flex gap-2">
                    {Array.from({ length: 6 }, (_, i) => (
                        <div key={i} className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                    ))}
                </div>
                <div className="space-y-3">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SellerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { success, error: toastError } = useToast();

    // ─── Data ────────────────────────────────────────────────────────────────
    const { data: seller, isLoading, error: fetchError, refetch } = useAdminSeller(id);
    const updateSeller = useUpdateSeller();
    const suspendSeller = useSuspendSeller();
    const reinstateSeller = useReinstateSeller();

    // ─── Local State ─────────────────────────────────────────────────────────
    const [showSuspendModal, setShowSuspendModal] = React.useState(false);
    const [showReinstateModal, setShowReinstateModal] = React.useState(false);
    const [isEditingCommission, setIsEditingCommission] = React.useState(false);
    const [commissionRate, setCommissionRate] = React.useState<number | null>(null);
    const [adminNotes, setAdminNotes] = React.useState("");
    const [isSavingNotes, setIsSavingNotes] = React.useState(false);
    const [statusToSet, setStatusToSet] = React.useState<string | null>(null);
    const [showStatusConfirm, setShowStatusConfirm] = React.useState(false);

    // Sync admin notes when seller data loads
    React.useEffect(() => {
        if (seller?.adminNotes) {
            setAdminNotes(seller.adminNotes);
        }
    }, [seller?.adminNotes]);

    // ─── Computed ────────────────────────────────────────────────────────────
    const typedSeller = seller as Seller | undefined;
    const currentRate = commissionRate ?? Number(typedSeller?.commissionRate ?? 0);
    const isSuspended = typedSeller?.status === "suspended";
    const isApproved = typedSeller?.status === "approved";
    const statusInfo = STATUS_BADGE_MAP[typedSeller?.status ?? ""] ?? {
        label: typedSeller?.status ?? "Unknown",
        className: "bg-zinc-100 text-zinc-600",
    };
    const verificationInfo = VERIFICATION_BADGE_MAP[typedSeller?.verificationStatus ?? ""] ?? {
        label: typedSeller?.verificationStatus ?? "Unknown",
        className: "bg-zinc-100 text-zinc-600",
    };

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleSaveCommission = async () => {
        if (!typedSeller) return;
        try {
            await updateSeller.mutateAsync({ id, data: { commissionRate: currentRate } });
            success("Commission updated", `Commission rate set to ${currentRate}% for ${typedSeller.displayName}.`);
            setIsEditingCommission(false);
            setCommissionRate(null);
        } catch (err) {
            toastError("Update failed", "Failed to update commission rate. Please try again.");
        }
    };

    const handleSuspend = () => {
        if (!typedSeller) return;
        suspendSeller.mutate(id, {
            onSuccess: () => {
                success("Seller suspended", `${typedSeller.displayName} has been suspended.`);
                setShowSuspendModal(false);
            },
            onError: () => {
                toastError("Action failed", "Failed to suspend seller. Please try again.");
            },
        });
    };

    const handleReinstate = () => {
        if (!typedSeller) return;
        reinstateSeller.mutate(id, {
            onSuccess: () => {
                success("Seller reinstated", `${typedSeller.displayName} has been reinstated.`);
                setShowReinstateModal(false);
            },
            onError: () => {
                toastError("Action failed", "Failed to reinstate seller. Please try again.");
            },
        });
    };

    const handleSaveAdminNotes = async () => {
        if (!typedSeller) return;
        setIsSavingNotes(true);
        try {
            await updateSeller.mutateAsync({ id, data: { adminNotes } });
            success("Notes saved", "Admin notes have been updated.");
        } catch (err) {
            toastError("Save failed", "Failed to save admin notes.");
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (newStatus === typedSeller?.status) return;
        setStatusToSet(newStatus);
        setShowStatusConfirm(true);
    };

    const handleConfirmStatusChange = async () => {
        if (!typedSeller || !statusToSet) return;
        try {
            await updateSeller.mutateAsync({ id, data: { status: statusToSet } });
            success("Status updated", `Seller status changed to ${statusToSet.replace("_", " ")}.`);
            setShowStatusConfirm(false);
            setStatusToSet(null);
        } catch (err) {
            toastError("Update failed", "Failed to update seller status.");
        }
    };

    // ─── Loading State ───────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Seller Details"
                    description="Loading seller information..."
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Sellers", href: "/sellers" },
                        { label: "Details" },
                    ]}
                    backHref="/sellers"
                    backLabel="Back to Sellers"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ProfileSkeleton />
                </div>
            </div>
        );
    }

    // ─── Error State ─────────────────────────────────────────────────────────

    if (fetchError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Seller Details"
                    description="Failed to load seller"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Sellers", href: "/sellers" },
                        { label: "Error" },
                    ]}
                    backHref="/sellers"
                    backLabel="Back to Sellers"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load seller
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {fetchError.message || "An error occurred while loading the seller details."}
                        </p>
                        <div className="flex items-center justify-center gap-3 mt-6">
                            <Button variant="outline" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Retry
                            </Button>
                            <Link href="/sellers">
                                <Button variant="default">Back to Sellers</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Not Found State ─────────────────────────────────────────────────────

    if (!typedSeller) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Seller Details"
                    description="Seller not found"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Sellers", href: "/sellers" },
                        { label: "Not Found" },
                    ]}
                    backHref="/sellers"
                    backLabel="Back to Sellers"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                            <User className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Seller not found
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            The seller you are looking for does not exist or has been removed.
                        </p>
                        <Link href="/sellers">
                            <Button variant="default" className="mt-6">
                                Back to Sellers
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Derived Data ────────────────────────────────────────────────────────

    const products: SellerProduct[] = typedSeller.products ?? [];
    const recentOrders: SellerOrder[] = typedSeller.recentOrders ?? [];
    const payouts: SellerPayout[] = typedSeller.payouts ?? [];
    const reviews: SellerReview[] = typedSeller.reviews ?? [];
    const topProducts = [...products]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title={typedSeller.displayName}
                description={`Seller account managed since ${formatDate(typedSeller.createdAt)}`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Sellers", href: "/sellers" },
                    { label: typedSeller.displayName },
                ]}
                backHref="/sellers"
                backLabel="Back to Sellers"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* ─── Profile Header ─────────────────────────────────────────── */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    {/* Gradient Banner */}
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
                        {isSuspended && (
                            <div className="absolute top-3 right-3">
                                <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-red-500 text-white">
                                    ACCOUNT SUSPENDED
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {typedSeller.user?.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={typedSeller.user.avatar}
                                        alt={typedSeller.displayName}
                                        className="h-20 w-20 rounded-full border-4 border-white dark:border-zinc-800 object-cover bg-zinc-200"
                                    />
                                ) : (
                                    <div className="h-20 w-20 rounded-full border-4 border-white dark:border-zinc-800 bg-primary/10 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-primary">
                                            {getInitials(typedSeller)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 pt-2 sm:pt-12 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white truncate">
                                        {typedSeller.displayName}
                                    </h2>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                                        {statusInfo.label}
                                    </span>
                                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${verificationInfo.className}`}>
                                        {verificationInfo.label}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    {typedSeller.slug && (
                                        <span className="font-mono">@{typedSeller.slug}</span>
                                    )}
                                    {typedSeller.user?.email && (
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            {typedSeller.user.email}
                                        </span>
                                    )}
                                    {typedSeller.stripeOnboardingComplete && (
                                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                            <CreditCard className="h-3.5 w-3.5" />
                                            Stripe Connected
                                        </span>
                                    )}
                                    {!typedSeller.stripeOnboardingComplete && (
                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                            <AlertTriangle className="h-3.5 w-3.5" />
                                            Stripe Not Connected
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-12">
                                {isApproved && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowSuspendModal(true)}
                                    >
                                        <ShieldOff className="h-4 w-4 mr-1.5" />
                                        Suspend
                                    </Button>
                                )}
                                {isSuspended && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => setShowReinstateModal(true)}
                                    >
                                        <Shield className="h-4 w-4 mr-1.5" />
                                        Reinstate
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingCommission(true)}
                                >
                                    <Percent className="h-4 w-4 mr-1.5" />
                                    Edit Commission
                                </Button>
                                <Link
                                    href={`/store/sellers/${typedSeller.slug}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline" size="sm">
                                        <ExternalLink className="h-4 w-4 mr-1.5" />
                                        View Public Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Bio */}
                        {typedSeller.bio && (
                            <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl whitespace-pre-line">
                                {typedSeller.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* ─── Stats Grid ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        icon={<DollarSign className="h-5 w-5" />}
                        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                        value={formatPrice(Number(typedSeller.totalRevenue))}
                        label="Total Revenue"
                    />
                    <StatCard
                        icon={<ShoppingCart className="h-5 w-5" />}
                        iconBg="bg-blue-100 dark:bg-blue-900/30"
                        iconColor="text-blue-600 dark:text-blue-400"
                        value={String(typedSeller.totalSales ?? 0)}
                        label="Total Sales"
                    />
                    <StatCard
                        icon={<Package className="h-5 w-5" />}
                        iconBg="bg-purple-100 dark:bg-purple-900/30"
                        iconColor="text-purple-600 dark:text-purple-400"
                        value={String(typedSeller.totalProducts ?? 0)}
                        label="Products"
                    />
                    <StatCard
                        icon={<Star className="h-5 w-5" />}
                        iconBg="bg-amber-100 dark:bg-amber-900/30"
                        iconColor="text-amber-600 dark:text-amber-400"
                        value={Number(typedSeller.averageRating).toFixed(1)}
                        label="Average Rating"
                    />
                    <StatCard
                        icon={<Percent className="h-5 w-5" />}
                        iconBg="bg-indigo-100 dark:bg-indigo-900/30"
                        iconColor="text-indigo-600 dark:text-indigo-400"
                        value={`${Number(typedSeller.commissionRate)}%`}
                        label="Commission Rate"
                    />
                    <StatCard
                        icon={<Wallet className="h-5 w-5" />}
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600 dark:text-green-400"
                        value={formatPrice(Number(typedSeller.payoutBalance ?? 0))}
                        label="Payout Balance"
                    />
                </div>

                {/* ─── Inline Commission Editor ───────────────────────────────── */}
                {isEditingCommission && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-200 dark:border-indigo-800/30 p-5">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                <Percent className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400">
                                        Edit Commission Rate
                                    </h4>
                                    <p className="text-xs text-indigo-600/80 dark:text-indigo-400/70 mt-1">
                                        Set the platform commission percentage for this seller. Current rate: {Number(typedSeller.commissionRate)}%.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-32">
                                        <Input
                                            type="number"
                                            min={0}
                                            max={100}
                                            step={0.5}
                                            value={currentRate}
                                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                                            className="pr-8"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                                            %
                                        </span>
                                    </div>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleSaveCommission}
                                        disabled={updateSeller.isPending}
                                    >
                                        {updateSeller.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-1.5" />
                                        )}
                                        Save
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setIsEditingCommission(false);
                                            setCommissionRate(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Tabs ───────────────────────────────────────────────────── */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="products">
                            Products
                            {products.length > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500 text-white">
                                    {products.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="payouts">Payouts</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    {/* ─── Overview Tab ──────────────────────────────────────── */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Column */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Revenue Chart Placeholder */}
                                <SectionCard
                                    title="Revenue Over Time"
                                    icon={<TrendingUp className="h-4 w-4" />}
                                    actions={
                                        <Link href={`/analytics/marketplace?sellerId=${id}`}>
                                            <Button variant="ghost" size="sm">
                                                <BarChart3 className="h-4 w-4 mr-1.5" />
                                                Full Analytics
                                            </Button>
                                        </Link>
                                    }
                                >
                                    <div className="h-48 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-600">
                                        <div className="text-center">
                                            <BarChart3 className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                                                Revenue Chart
                                            </p>
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                Integrate with Recharts for interactive revenue visualization
                                            </p>
                                        </div>
                                    </div>
                                </SectionCard>

                                {/* Recent Orders */}
                                <SectionCard
                                    title={`Recent Orders (${recentOrders.length})`}
                                    icon={<ShoppingCart className="h-4 w-4" />}
                                    actions={
                                        recentOrders.length > 0 ? (
                                            <Link href={`/orders?sellerId=${id}`}>
                                                <Button variant="ghost" size="sm">
                                                    View All
                                                    <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                                                </Button>
                                            </Link>
                                        ) : undefined
                                    }
                                >
                                    {recentOrders.length > 0 ? (
                                        <div className="overflow-x-auto -mx-6">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                                        <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Order
                                                        </th>
                                                        <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Customer
                                                        </th>
                                                        <th className="text-right px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Total
                                                        </th>
                                                        <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden sm:table-cell">
                                                            Date
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                                    {recentOrders.slice(0, 5).map((order) => (
                                                        <tr key={order.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20 transition-colors">
                                                            <td className="px-6 py-3">
                                                                <Link
                                                                    href={`/orders/${order.id}`}
                                                                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                                                >
                                                                    {order.orderNumber}
                                                                </Link>
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[160px]">
                                                                {order.buyerEmail}
                                                            </td>
                                                            <td className="px-6 py-3 text-right text-sm font-medium text-zinc-900 dark:text-white">
                                                                {formatPrice(order.total, order.currency)}
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                                                                {formatRelativeTime(order.createdAt)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={<ShoppingCart className="h-6 w-6 text-zinc-400" />}
                                            title="No orders yet"
                                            description="This seller has not received any orders."
                                        />
                                    )}
                                </SectionCard>

                                {/* Top Products */}
                                <SectionCard
                                    title="Top Products"
                                    icon={<Package className="h-4 w-4" />}
                                >
                                    {topProducts.length > 0 ? (
                                        <div className="space-y-3">
                                            {topProducts.map((product, index) => (
                                                <div
                                                    key={product.id}
                                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                >
                                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-700 text-xs font-bold text-zinc-600 dark:text-zinc-300 flex-shrink-0">
                                                        {index + 1}
                                                    </div>
                                                    {product.thumbnailUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={product.thumbnailUrl}
                                                            alt={product.title}
                                                            className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                                            <Package className="h-4 w-4 text-zinc-400" />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={`/products/digital/${product.id}`}
                                                            className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors truncate block"
                                                        >
                                                            {product.title}
                                                        </Link>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                {product.totalSales} sales
                                                            </span>
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                {formatPrice(product.price, product.currency)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <StarRating rating={product.averageRating} />
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                                                            {Number(product.averageRating).toFixed(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState
                                            icon={<Package className="h-6 w-6 text-zinc-400" />}
                                            title="No products"
                                            description="This seller has not listed any products yet."
                                        />
                                    )}
                                </SectionCard>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Account Details */}
                                <SectionCard
                                    title="Account Details"
                                    icon={<User className="h-4 w-4" />}
                                >
                                    <dl className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Seller ID</dt>
                                            <dd><CopyableText text={typedSeller.id} label="Seller ID" /></dd>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Email</dt>
                                            <dd className="text-zinc-900 dark:text-white truncate max-w-[180px]">
                                                {typedSeller.user?.email}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Full Name</dt>
                                            <dd className="text-zinc-900 dark:text-white">
                                                {typedSeller.user?.firstName} {typedSeller.user?.lastName}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Payout Schedule</dt>
                                            <dd className="text-zinc-900 dark:text-white capitalize">
                                                {typedSeller.payoutSchedule}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Stripe</dt>
                                            <dd>
                                                {typedSeller.stripeOnboardingComplete ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-sm">
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Connected
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 text-sm">
                                                        <AlertTriangle className="h-3.5 w-3.5" />
                                                        Not Connected
                                                    </span>
                                                )}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Joined</dt>
                                            <dd className="text-zinc-900 dark:text-white">
                                                {formatDate(typedSeller.createdAt)}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <dt className="text-zinc-500 dark:text-zinc-400">Last Updated</dt>
                                            <dd className="text-zinc-900 dark:text-white">
                                                {formatRelativeTime(typedSeller.updatedAt)}
                                            </dd>
                                        </div>
                                    </dl>
                                </SectionCard>

                                {/* Activity Timeline */}
                                <SectionCard
                                    title="Activity Timeline"
                                    icon={<Clock className="h-4 w-4" />}
                                >
                                    <div className="space-y-0">
                                        {typedSeller.updatedAt !== typedSeller.createdAt && (
                                            <TimelineItem
                                                label="Profile Updated"
                                                description="Account details were modified"
                                                date={typedSeller.updatedAt}
                                                dotColor="bg-blue-500"
                                            />
                                        )}
                                        {isSuspended && (
                                            <TimelineItem
                                                label="Account Suspended"
                                                description="Seller account was suspended by admin"
                                                date={typedSeller.updatedAt}
                                                dotColor="bg-red-500"
                                            />
                                        )}
                                        {typedSeller.stripeOnboardingComplete && (
                                            <TimelineItem
                                                label="Stripe Connected"
                                                description="Completed Stripe onboarding"
                                                date={typedSeller.updatedAt}
                                                dotColor="bg-emerald-500"
                                            />
                                        )}
                                        {typedSeller.status === "approved" && (
                                            <TimelineItem
                                                label="Application Approved"
                                                description="Seller application was approved"
                                                date={typedSeller.createdAt}
                                                dotColor="bg-green-500"
                                            />
                                        )}
                                        <TimelineItem
                                            label="Account Created"
                                            description="Seller account was registered"
                                            date={typedSeller.createdAt}
                                            dotColor="bg-primary"
                                            isLast
                                        />
                                    </div>
                                </SectionCard>
                            </div>
                        </div>
                    </TabsContent>

                    {/* ─── Products Tab ──────────────────────────────────────── */}
                    <TabsContent value="products" className="space-y-4">
                        {products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:border-primary/50 transition-colors"
                                    >
                                        {product.thumbnailUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={product.thumbnailUrl}
                                                alt={product.title}
                                                className="w-full h-36 object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-36 bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                                <Package className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <Link
                                                    href={`/products/digital/${product.id}`}
                                                    className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-2"
                                                >
                                                    {product.title}
                                                </Link>
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${
                                                    product.status === "published"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900/80 dark:text-green-300"
                                                        : product.status === "draft"
                                                        ? "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                                                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300"
                                                }`}>
                                                    {product.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-3">
                                                /{product.slug}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                    {formatPrice(product.price, product.currency)}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span>{product.totalSales} sales</span>
                                                    <div className="flex items-center gap-0.5">
                                                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                        <span>{Number(product.averageRating).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <EmptyState
                                    icon={<Package className="h-6 w-6 text-zinc-400" />}
                                    title="No products listed"
                                    description="This seller has not created any products yet."
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Orders Tab ────────────────────────────────────────── */}
                    <TabsContent value="orders" className="space-y-4">
                        {recentOrders.length > 0 ? (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Order</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
                                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {recentOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <Link
                                                            href={`/orders/${order.id}`}
                                                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                                        >
                                                            {order.orderNumber}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                                                        {order.buyerEmail}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-white">
                                                        {formatPrice(order.total, order.currency)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${ORDER_STATUS_COLORS[order.status] || ""}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">
                                                        {formatDate(order.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link href={`/orders/${order.id}`}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <EmptyState
                                    icon={<ShoppingCart className="h-6 w-6 text-zinc-400" />}
                                    title="No orders found"
                                    description="This seller has not received any orders yet."
                                    action={
                                        <Link href={`/orders?sellerId=${id}`}>
                                            <Button variant="outline" size="sm">
                                                View All Orders
                                                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                                            </Button>
                                        </Link>
                                    }
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Payouts Tab ───────────────────────────────────────── */}
                    <TabsContent value="payouts" className="space-y-4">
                        {/* Balance Summary */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Current Balance</p>
                                    <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">
                                        {formatPrice(Number(typedSeller.payoutBalance ?? 0))}
                                    </p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 capitalize">
                                        Schedule: {typedSeller.payoutSchedule}
                                    </p>
                                </div>
                                <Link href={`/sellers/payouts?sellerId=${id}`}>
                                    <Button variant="outline" size="sm">
                                        <Wallet className="h-4 w-4 mr-1.5" />
                                        Manage Payouts
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Payout History */}
                        {payouts.length > 0 ? (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Payout ID</th>
                                                <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Requested</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden sm:table-cell">Processed</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {payouts.map((payout) => (
                                                <tr key={payout.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="px-4 py-3 text-sm font-mono text-zinc-600 dark:text-zinc-400 truncate max-w-[120px]">
                                                        {payout.id.slice(0, 8)}...
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-white">
                                                        {formatPrice(payout.amount, payout.currency)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${PAYOUT_STATUS_COLORS[payout.status] || ""}`}>
                                                            {payout.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                                                        {formatDate(payout.createdAt)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden sm:table-cell">
                                                        {payout.processedAt ? formatDate(payout.processedAt) : "--"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <EmptyState
                                    icon={<Wallet className="h-6 w-6 text-zinc-400" />}
                                    title="No payouts yet"
                                    description="No payouts have been processed for this seller."
                                    action={
                                        <Link href={`/sellers/payouts?sellerId=${id}`}>
                                            <Button variant="outline" size="sm">
                                                View Payouts Page
                                                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
                                            </Button>
                                        </Link>
                                    }
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Reviews Tab ───────────────────────────────────────── */}
                    <TabsContent value="reviews" className="space-y-4">
                        {reviews.length > 0 ? (
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5"
                                    >
                                        <div className="flex items-start gap-4">
                                            {review.userAvatar ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={review.userAvatar}
                                                    alt=""
                                                    className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                                        {(review.userName || "U").charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {review.userName || "Anonymous"}
                                                    </span>
                                                    <StarRating rating={review.rating} />
                                                </div>
                                                {review.title && (
                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                                                        {review.title}
                                                    </p>
                                                )}
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                                                    {review.body}
                                                </p>
                                                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                                                    <span>For: {review.productTitle}</span>
                                                    <span>{formatRelativeTime(review.createdAt)}</span>
                                                </div>
                                            </div>
                                            <Link href={`/reviews/${review.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <EmptyState
                                    icon={<MessageSquare className="h-6 w-6 text-zinc-400" />}
                                    title="No reviews yet"
                                    description="This seller's products have not received any reviews."
                                />
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Settings Tab ──────────────────────────────────────── */}
                    <TabsContent value="settings" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Commission Rate */}
                            <SectionCard
                                title="Commission Rate"
                                icon={<Percent className="h-4 w-4" />}
                            >
                                <div className="space-y-4">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Set the platform commission percentage for this seller. This rate is applied
                                        to every transaction and deducted before seller payout.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-32">
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                step={0.5}
                                                value={currentRate}
                                                onChange={(e) => setCommissionRate(Number(e.target.value))}
                                                className="pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                                                %
                                            </span>
                                        </div>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleSaveCommission}
                                            disabled={updateSeller.isPending}
                                        >
                                            {updateSeller.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                            ) : (
                                                <Save className="h-4 w-4 mr-1.5" />
                                            )}
                                            Save Rate
                                        </Button>
                                    </div>
                                </div>
                            </SectionCard>

                            {/* Status Management */}
                            <SectionCard
                                title="Status Management"
                                icon={<Shield className="h-4 w-4" />}
                            >
                                <div className="space-y-4">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Change the seller's account status. Suspending a seller will prevent them from
                                        receiving new orders.
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <Select
                                            value={typedSeller.status}
                                            onValueChange={handleStatusChange}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="pending_review">Pending Review</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Current:</span>
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>

                        {/* Admin Notes */}
                        <SectionCard
                            title="Admin Notes"
                            icon={<FileText className="h-4 w-4" />}
                            actions={
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSaveAdminNotes}
                                    disabled={isSavingNotes}
                                >
                                    {isSavingNotes ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                                    ) : (
                                        <Save className="h-4 w-4 mr-1.5" />
                                    )}
                                    Save Notes
                                </Button>
                            }
                        >
                            <div className="space-y-3">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Internal notes about this seller. These notes are only visible to admins.
                                </p>
                                <Textarea
                                    placeholder="Add admin notes about this seller..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    rows={5}
                                    className="resize-y"
                                />
                            </div>
                        </SectionCard>

                        {/* Danger Zone */}
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30 p-6">
                            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                                Danger Zone
                            </h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-4">
                                These actions have significant consequences. Please be certain before proceeding.
                            </p>
                            <div className="flex items-center gap-3">
                                {isApproved && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setShowSuspendModal(true)}
                                    >
                                        <ShieldOff className="h-4 w-4 mr-1.5" />
                                        Suspend Seller
                                    </Button>
                                )}
                                {isSuspended && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => setShowReinstateModal(true)}
                                    >
                                        <Shield className="h-4 w-4 mr-1.5" />
                                        Reinstate Seller
                                    </Button>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* ─── Modals ─────────────────────────────────────────────────────── */}

            {/* Suspend Confirmation */}
            <ConfirmModal
                open={showSuspendModal}
                onOpenChange={setShowSuspendModal}
                title="Suspend Seller"
                description={`Are you sure you want to suspend ${typedSeller.displayName}? This will prevent them from receiving new orders and hide their products from the marketplace.`}
                confirmLabel="Suspend Seller"
                cancelLabel="Cancel"
                onConfirm={handleSuspend}
                isLoading={suspendSeller.isPending}
                variant="danger"
            />

            {/* Reinstate Confirmation */}
            <ConfirmModal
                open={showReinstateModal}
                onOpenChange={setShowReinstateModal}
                title="Reinstate Seller"
                description={`Are you sure you want to reinstate ${typedSeller.displayName}? Their products will become visible again and they will be able to receive new orders.`}
                confirmLabel="Reinstate Seller"
                cancelLabel="Cancel"
                onConfirm={handleReinstate}
                isLoading={reinstateSeller.isPending}
                variant="success"
            />

            {/* Status Change Confirmation */}
            <ConfirmModal
                open={showStatusConfirm}
                onOpenChange={(open) => {
                    if (!open) {
                        setShowStatusConfirm(false);
                        setStatusToSet(null);
                    }
                }}
                title="Change Seller Status"
                description={`Are you sure you want to change the status of ${typedSeller.displayName} from "${typedSeller.status?.replace("_", " ")}" to "${statusToSet?.replace("_", " ")}"? This may affect the seller's ability to operate on the platform.`}
                confirmLabel="Change Status"
                cancelLabel="Cancel"
                onConfirm={handleConfirmStatusChange}
                isLoading={updateSeller.isPending}
                variant="warning"
            />
        </div>
    );
}
