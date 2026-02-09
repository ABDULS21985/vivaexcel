"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@ktblog/ui/components";
import {
    ArrowLeft,
    Loader2,
    X,
    Copy,
    Check,
    ExternalLink,
    RotateCcw,
    CreditCard,
    User,
    Package,
    Calendar,
    Download,
    Clock,
    Shield,
    Mail,
    Hash,
    FileText,
    AlertCircle,
} from "lucide-react";
import {
    useOrder,
    useRefundOrder,
    type Order,
    type OrderItem,
    type DownloadToken,
    OrderStatus,
} from "@/hooks/use-orders";

// ─── Constants ───────────────────────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<string, string> = {
    completed:
        "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    pending:
        "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    processing:
        "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    failed: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    refunded:
        "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
    completed: "Completed",
    pending: "Pending",
    processing: "Processing",
    failed: "Failed",
    refunded: "Refunded",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
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

function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(dateString);
}

// ─── Copyable Text Component ─────────────────────────────────────────────────

function CopyableText({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
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

// ─── Section Card Component ──────────────────────────────────────────────────

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
                    <span className="text-zinc-500 dark:text-zinc-400">
                        {icon}
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {title}
                    </h3>
                </div>
                {actions && <div>{actions}</div>}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ─── Detail Row Component ────────────────────────────────────────────────────

function DetailRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5">
            <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 sm:w-40 flex-shrink-0">
                {label}
            </dt>
            <dd className="text-sm text-zinc-900 dark:text-white min-w-0">
                {children}
            </dd>
        </div>
    );
}

// ─── Download Token Status Component ─────────────────────────────────────────

function TokenStatus({ token }: { token: DownloadToken }) {
    const isExpired = new Date(token.expiresAt) < new Date();
    const isMaxed =
        token.maxDownloads > 0 &&
        token.downloadCount >= token.maxDownloads;
    const isDisabled = !token.isActive || isExpired || isMaxed;

    let statusLabel = "Active";
    let statusColor =
        "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300";

    if (!token.isActive) {
        statusLabel = "Disabled";
        statusColor =
            "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300";
    } else if (isExpired) {
        statusLabel = "Expired";
        statusColor =
            "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300";
    } else if (isMaxed) {
        statusLabel = "Limit Reached";
        statusColor =
            "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300";
    }

    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
                <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${statusColor}`}
                >
                    {statusLabel}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {token.downloadCount}
                    {token.maxDownloads > 0
                        ? ` / ${token.maxDownloads}`
                        : ""}{" "}
                    downloads
                </span>
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                Expires: {formatDate(token.expiresAt)}
            </span>
        </div>
    );
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function OrderDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const { success, error: toastError } = useToast();

    // Refund confirmation state
    const [isRefundOpen, setIsRefundOpen] = React.useState(false);

    // Fetch order data
    const {
        data: order,
        isLoading,
        error: fetchError,
    } = useOrder(params.id);

    // Mutations
    const refundOrderMutation = useRefundOrder();

    // ─── Actions ─────────────────────────────────────────────────────────────

    const handleRefundClick = () => {
        setIsRefundOpen(true);
    };

    const handleConfirmRefund = () => {
        if (!order) return;

        refundOrderMutation.mutate(order.id, {
            onSuccess: () => {
                success(
                    "Order refunded",
                    `Order ${order.orderNumber} has been refunded successfully.`
                );
                setIsRefundOpen(false);
            },
            onError: (err) => {
                toastError(
                    "Refund failed",
                    err.message || "Failed to refund order. Please try again."
                );
            },
        });
    };

    // ─── Loading State ───────────────────────────────────────────────────────

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Order Details"
                    description="Loading order..."
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Orders", href: "/orders" },
                        { label: "Order Details" },
                    ]}
                    backHref="/orders"
                    backLabel="Back to Orders"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading order details...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error State ─────────────────────────────────────────────────────────

    if (fetchError || !order) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Order Details"
                    description="Failed to load order"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Orders", href: "/orders" },
                        { label: "Order Details" },
                    ]}
                    backHref="/orders"
                    backLabel="Back to Orders"
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load order
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {fetchError?.message ||
                                "The order could not be found or an error occurred."}
                        </p>
                        <button
                            onClick={() => router.push("/orders")}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Computed values ─────────────────────────────────────────────────────

    const canRefund = order.status === OrderStatus.COMPLETED;
    const customerName =
        order.billingName ||
        (order.user
            ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim()
            : null);

    // ─── Render ──────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title={`Order ${order.orderNumber}`}
                description={`Placed ${formatRelativeDate(order.createdAt)}`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Orders", href: "/orders" },
                    { label: order.orderNumber },
                ]}
                backHref="/orders"
                backLabel="Back to Orders"
                actions={
                    canRefund ? (
                        <Button
                            variant="destructive"
                            onClick={handleRefundClick}
                            disabled={refundOrderMutation.isPending}
                        >
                            {refundOrderMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <RotateCcw className="h-4 w-4 mr-2" />
                            )}
                            Refund Order
                        </Button>
                    ) : undefined
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Header Card */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Hash className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold font-mono text-zinc-900 dark:text-white">
                                            {order.orderNumber}
                                        </h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Order ID: {order.id}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full self-start ${ORDER_STATUS_COLORS[order.status] || ""}`}
                                >
                                    {ORDER_STATUS_LABELS[order.status] ||
                                        order.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                    <Calendar className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Created
                                        </p>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {formatDatetime(order.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {order.completedAt && (
                                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                Completed
                                            </p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                {formatDatetime(
                                                    order.completedAt
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                                    <Clock className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Last Updated
                                        </p>
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                            {formatDatetime(order.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <SectionCard
                            title={`Items (${order.items.length})`}
                            icon={<Package className="h-4 w-4" />}
                        >
                            {order.items.length === 0 ? (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 py-4 text-center">
                                    No items in this order.
                                </p>
                            ) : (
                                <div className="overflow-x-auto -mx-6">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700">
                                                <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Product
                                                </th>
                                                <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden sm:table-cell">
                                                    Variant
                                                </th>
                                                <th className="text-right px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="text-left px-6 py-2.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                    Downloads
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                            {order.items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="min-w-0">
                                                            <Link
                                                                href={`/products/digital/${item.digitalProductId}`}
                                                                className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                                                            >
                                                                {
                                                                    item.productTitle
                                                                }
                                                            </Link>
                                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                                                /
                                                                {
                                                                    item.productSlug
                                                                }
                                                            </p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 hidden sm:table-cell">
                                                        {item.variantId ? (
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {item.variantId}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                --
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white whitespace-nowrap">
                                                            {formatPrice(
                                                                item.price,
                                                                item.currency
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 hidden md:table-cell">
                                                        {item.downloadTokens &&
                                                        item.downloadTokens
                                                            .length > 0 ? (
                                                            <div className="space-y-2">
                                                                {item.downloadTokens.map(
                                                                    (token) => (
                                                                        <TokenStatus
                                                                            key={
                                                                                token.id
                                                                            }
                                                                            token={
                                                                                token
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-zinc-400 dark:text-zinc-500">
                                                                No tokens
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </SectionCard>

                        {/* Payment Details */}
                        <SectionCard
                            title="Payment Details"
                            icon={<CreditCard className="h-4 w-4" />}
                        >
                            <dl className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                                <DetailRow label="Payment Method">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-zinc-400" />
                                        <span>Stripe</span>
                                    </div>
                                </DetailRow>
                                {order.stripePaymentIntentId && (
                                    <DetailRow label="Payment Intent ID">
                                        <CopyableText
                                            text={
                                                order.stripePaymentIntentId
                                            }
                                            label="Payment Intent ID"
                                        />
                                    </DetailRow>
                                )}
                                {order.stripeSessionId && (
                                    <DetailRow label="Session ID">
                                        <CopyableText
                                            text={order.stripeSessionId}
                                            label="Session ID"
                                        />
                                    </DetailRow>
                                )}
                                <DetailRow label="Subtotal">
                                    <span className="font-medium">
                                        {formatPrice(
                                            order.subtotal,
                                            order.currency
                                        )}
                                    </span>
                                </DetailRow>
                                {order.discountAmount > 0 && (
                                    <DetailRow label="Discount">
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            -
                                            {formatPrice(
                                                order.discountAmount,
                                                order.currency
                                            )}
                                        </span>
                                    </DetailRow>
                                )}
                                <DetailRow label="Total">
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                        {formatPrice(
                                            order.total,
                                            order.currency
                                        )}
                                    </span>
                                </DetailRow>
                                <DetailRow label="Currency">
                                    <span className="uppercase font-mono text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded">
                                        {order.currency}
                                    </span>
                                </DetailRow>
                            </dl>
                        </SectionCard>
                    </div>

                    {/* Sidebar Column (1/3 width) */}
                    <div className="space-y-6">
                        {/* Customer Section */}
                        <SectionCard
                            title="Customer"
                            icon={<User className="h-4 w-4" />}
                            actions={
                                order.user ? (
                                    <Link
                                        href={`/subscribers?search=${encodeURIComponent(order.user.email)}`}
                                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                                    >
                                        View Profile
                                    </Link>
                                ) : undefined
                            }
                        >
                            <div className="space-y-4">
                                {customerName && (
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-primary">
                                                {customerName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                                {customerName}
                                            </p>
                                            {order.user && (
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    Account user
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2.5 text-sm">
                                        <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <a
                                            href={`mailto:${order.billingEmail}`}
                                            className="text-zinc-700 dark:text-zinc-300 hover:text-primary transition-colors truncate"
                                        >
                                            {order.billingEmail}
                                        </a>
                                    </div>
                                    {order.userId && (
                                        <div className="flex items-center gap-2.5 text-sm">
                                            <Hash className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                            <span className="text-zinc-500 dark:text-zinc-400 font-mono text-xs truncate">
                                                {order.userId}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        {/* Order Status Timeline */}
                        <SectionCard
                            title="Status"
                            icon={<FileText className="h-4 w-4" />}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`px-3 py-1.5 text-sm font-medium rounded-full ${ORDER_STATUS_COLORS[order.status] || ""}`}
                                    >
                                        {ORDER_STATUS_LABELS[order.status] ||
                                            order.status}
                                    </span>
                                </div>

                                {/* Status timeline */}
                                <div className="space-y-3 pt-2">
                                    <TimelineItem
                                        label="Order Created"
                                        date={order.createdAt}
                                        isActive
                                        dotColor="bg-primary"
                                    />
                                    {(order.status === OrderStatus.PROCESSING ||
                                        order.status ===
                                            OrderStatus.COMPLETED ||
                                        order.status ===
                                            OrderStatus.REFUNDED) && (
                                        <TimelineItem
                                            label="Processing"
                                            date={order.createdAt}
                                            isActive
                                            dotColor="bg-blue-500"
                                        />
                                    )}
                                    {(order.status === OrderStatus.COMPLETED ||
                                        order.status ===
                                            OrderStatus.REFUNDED) && (
                                        <TimelineItem
                                            label="Completed"
                                            date={
                                                order.completedAt ||
                                                order.updatedAt
                                            }
                                            isActive
                                            dotColor="bg-emerald-500"
                                        />
                                    )}
                                    {order.status === OrderStatus.REFUNDED && (
                                        <TimelineItem
                                            label="Refunded"
                                            date={order.updatedAt}
                                            isActive
                                            dotColor="bg-zinc-500"
                                        />
                                    )}
                                    {order.status === OrderStatus.FAILED && (
                                        <TimelineItem
                                            label="Failed"
                                            date={order.updatedAt}
                                            isActive
                                            dotColor="bg-red-500"
                                        />
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        {/* Order Metadata */}
                        {order.metadata &&
                            Object.keys(order.metadata).length > 0 && (
                                <SectionCard
                                    title="Metadata"
                                    icon={<FileText className="h-4 w-4" />}
                                >
                                    <div className="space-y-2">
                                        {Object.entries(order.metadata).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between py-1.5"
                                                >
                                                    <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                        {key}
                                                    </span>
                                                    <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 truncate ml-4 max-w-[180px]">
                                                        {String(value)}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </SectionCard>
                            )}

                        {/* Refund Action (alternative placement) */}
                        {canRefund && (
                            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800/30 p-5">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div className="space-y-3">
                                        <div>
                                            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
                                                Refund this order
                                            </h4>
                                            <p className="text-xs text-red-600/80 dark:text-red-400/70 mt-1">
                                                Issue a full refund of{" "}
                                                {formatPrice(
                                                    order.total,
                                                    order.currency
                                                )}{" "}
                                                through Stripe. Download access
                                                will be revoked. This cannot be
                                                undone.
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleRefundClick}
                                            disabled={
                                                refundOrderMutation.isPending
                                            }
                                            className="w-full"
                                        >
                                            {refundOrderMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                            )}
                                            Refund{" "}
                                            {formatPrice(
                                                order.total,
                                                order.currency
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Refund Confirmation Modal */}
            <ConfirmModal
                open={isRefundOpen}
                onOpenChange={setIsRefundOpen}
                title="Confirm Refund"
                description={`You are about to refund order ${order.orderNumber} for ${formatPrice(order.total, order.currency)}. This will issue a full refund through Stripe and revoke download access for all items. This action cannot be undone.`}
                confirmLabel="Refund Order"
                cancelLabel="Cancel"
                onConfirm={handleConfirmRefund}
                isLoading={refundOrderMutation.isPending}
                variant="danger"
            />
        </div>
    );
}

// ─── Timeline Item Component ─────────────────────────────────────────────────

function TimelineItem({
    label,
    date,
    isActive,
    dotColor,
}: {
    label: string;
    date: string;
    isActive: boolean;
    dotColor: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
                <div
                    className={`h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                        isActive ? dotColor : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                />
                <div className="w-px h-full bg-zinc-200 dark:bg-zinc-700 min-h-[16px]" />
            </div>
            <div className="pb-3">
                <p
                    className={`text-sm font-medium ${
                        isActive
                            ? "text-zinc-900 dark:text-white"
                            : "text-zinc-400 dark:text-zinc-500"
                    }`}
                >
                    {label}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {formatDatetime(date)}
                </p>
            </div>
        </div>
    );
}
