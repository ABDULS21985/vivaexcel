"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Textarea,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@ktblog/ui/components";
import {
    Search,
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    ExternalLink,
    Eye,
    ChevronLeft,
    ChevronRight,
    FileText,
    UserCheck,
    UserX,
    Briefcase,
    Tag,
    Link2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import {
    useSellerApplications,
    useReviewApplication,
} from "@/hooks/use-sellers";

// ─── Types ───────────────────────────────────────────────────────────────────

type ApplicationStatus = "pending" | "approved" | "rejected";

interface SellerApplicationUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
}

interface SellerApplication {
    id: string;
    displayName: string;
    bio: string;
    specialties: string[];
    portfolioUrl?: string;
    sampleWorkUrls?: string[];
    experience?: string;
    requestedCategories?: string[];
    status: ApplicationStatus;
    reviewNotes?: string;
    createdAt: string;
    updatedAt: string;
    user: SellerApplicationUser;
}

interface ApplicationsMeta {
    total?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    nextCursor?: string;
    previousCursor?: string;
}

type RejectionReason =
    | "quality_concerns"
    | "incomplete_information"
    | "policy_violation"
    | "other";

const REJECTION_REASON_LABELS: Record<RejectionReason, string> = {
    quality_concerns: "Quality concerns",
    incomplete_information: "Incomplete information",
    policy_violation: "Policy violation",
    other: "Other",
};

// ─── Avatar Color Palette ────────────────────────────────────────────────────

const AVATAR_COLORS = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-cyan-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Helper Components ───────────────────────────────────────────────────────

function RelativeTime({ date }: { date: string }) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);

    let relative: string;
    if (diffMinutes < 1) {
        relative = "just now";
    } else if (diffMinutes < 60) {
        relative = `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
        relative = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
        relative = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else if (diffWeeks < 5) {
        relative = `${diffWeeks} week${diffWeeks !== 1 ? "s" : ""} ago`;
    } else {
        relative = `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
    }

    return (
        <span
            className="text-xs text-zinc-400 dark:text-zinc-500"
            title={then.toLocaleString()}
        >
            Applied {relative}
        </span>
    );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
    const styles: Record<ApplicationStatus, string> = {
        pending:
            "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
        approved:
            "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
        rejected:
            "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    };

    const labels: Record<ApplicationStatus, string> = {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
    };

    return (
        <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}
        >
            {labels[status] || status}
        </span>
    );
}

function ExpandableText({
    text,
    maxLines = 3,
}: {
    text: string;
    maxLines?: number;
}) {
    const [expanded, setExpanded] = React.useState(false);
    const textRef = React.useRef<HTMLParagraphElement>(null);
    const [isClamped, setIsClamped] = React.useState(false);

    React.useEffect(() => {
        const el = textRef.current;
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight + 1);
        }
    }, [text]);

    return (
        <div>
            <p
                ref={textRef}
                className={`text-sm text-zinc-600 dark:text-zinc-400 ${
                    !expanded ? `line-clamp-${maxLines}` : ""
                }`}
                style={
                    !expanded
                        ? {
                              display: "-webkit-box",
                              WebkitLineClamp: maxLines,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                          }
                        : undefined
                }
            >
                {text}
            </p>
            {(isClamped || expanded) && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="mt-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-0.5"
                >
                    {expanded ? (
                        <>
                            Show less <ChevronUp className="h-3 w-3" />
                        </>
                    ) : (
                        <>
                            Show more <ChevronDown className="h-3 w-3" />
                        </>
                    )}
                </button>
            )}
        </div>
    );
}

function CardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => (
                <div
                    key={i}
                    className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 animate-pulse"
                >
                    <div className="flex items-start gap-4">
                        {/* Avatar skeleton */}
                        <div className="h-11 w-11 bg-zinc-200 dark:bg-zinc-700 rounded-full flex-shrink-0" />

                        {/* Content skeleton */}
                        <div className="flex-1 space-y-3">
                            {/* Name + email */}
                            <div className="flex items-center gap-3">
                                <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                <div className="h-3 w-44 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            </div>
                            {/* Date */}
                            <div className="h-3 w-28 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            {/* Display name */}
                            <div className="h-4 w-40 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            {/* Bio lines */}
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
                                <div className="h-3 w-5/6 bg-zinc-200 dark:bg-zinc-700 rounded" />
                                <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            </div>
                            {/* Tags */}
                            <div className="flex gap-2">
                                <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                                <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                                <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                            </div>
                        </div>

                        {/* Action buttons skeleton */}
                        <div className="flex-shrink-0 hidden sm:flex flex-col gap-2">
                            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                            <div className="h-9 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Stats Card ──────────────────────────────────────────────────────────────

function StatsCard({
    label,
    value,
    icon,
    iconBg,
    iconColor,
    highlight,
    isLoading,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    highlight?: boolean;
    isLoading: boolean;
}) {
    return (
        <div
            className={`bg-white dark:bg-zinc-800 rounded-xl border p-5 ${
                highlight
                    ? "border-amber-300 dark:border-amber-700 ring-1 ring-amber-200 dark:ring-amber-800/50"
                    : "border-zinc-200 dark:border-zinc-700"
            }`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}
                >
                    <span className={iconColor}>{icon}</span>
                </div>
                <div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                        {isLoading ? (
                            <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                        ) : (
                            value.toLocaleString()
                        )}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {label}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
    const { success, error: toastError } = useToast();

    // ─── Tab and filter state ───────────────────────────────────────────
    const [activeTab, setActiveTab] = React.useState<string>("pending");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");

    // ─── Modal state ────────────────────────────────────────────────────
    const [approveTarget, setApproveTarget] =
        React.useState<SellerApplication | null>(null);
    const [rejectTarget, setRejectTarget] =
        React.useState<SellerApplication | null>(null);
    const [approveNotes, setApproveNotes] = React.useState("");
    const [rejectNotes, setRejectNotes] = React.useState("");
    const [rejectionReason, setRejectionReason] = React.useState<string>("");
    const [rejectValidationError, setRejectValidationError] =
        React.useState(false);

    // ─── Pagination state ───────────────────────────────────────────────
    const [pendingCursor, setPendingCursor] = React.useState<
        string | undefined
    >(undefined);
    const [approvedCursor, setApprovedCursor] = React.useState<
        string | undefined
    >(undefined);
    const [rejectedCursor, setRejectedCursor] = React.useState<
        string | undefined
    >(undefined);
    const [allCursor, setAllCursor] = React.useState<string | undefined>(
        undefined
    );

    // ─── Debounced search ───────────────────────────────────────────────
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPendingCursor(undefined);
            setApprovedCursor(undefined);
            setRejectedCursor(undefined);
            setAllCursor(undefined);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ─── Queries ────────────────────────────────────────────────────────
    const {
        data: pendingData,
        isLoading: isLoadingPending,
        error: pendingError,
    } = useSellerApplications({ status: "pending" });
    const {
        data: approvedData,
        isLoading: isLoadingApproved,
        error: approvedError,
    } = useSellerApplications({ status: "approved" });
    const {
        data: rejectedData,
        isLoading: isLoadingRejected,
        error: rejectedError,
    } = useSellerApplications({ status: "rejected" });
    const {
        data: allData,
        isLoading: isLoadingAll,
        error: allError,
    } = useSellerApplications({});

    const pendingApplications = (pendingData?.data ?? []) as SellerApplication[];
    const approvedApplications = (approvedData?.data ?? []) as SellerApplication[];
    const rejectedApplications = (rejectedData?.data ?? []) as SellerApplication[];
    const allApplications = (allData?.data ?? []) as SellerApplication[];

    const pendingMeta = (pendingData?.meta ?? {}) as ApplicationsMeta;
    const approvedMeta = (approvedData?.meta ?? {}) as ApplicationsMeta;
    const rejectedMeta = (rejectedData?.meta ?? {}) as ApplicationsMeta;
    const allMeta = (allData?.meta ?? {}) as ApplicationsMeta;

    // ─── Derived counts ─────────────────────────────────────────────────
    const pendingCount =
        pendingMeta.total ?? pendingApplications.length;
    const approvedCount =
        approvedMeta.total ?? approvedApplications.length;
    const rejectedCount =
        rejectedMeta.total ?? rejectedApplications.length;

    // ─── Mutation ───────────────────────────────────────────────────────
    const reviewMutation = useReviewApplication();

    // ─── Search filter ──────────────────────────────────────────────────
    const filterBySearch = React.useCallback(
        (apps: SellerApplication[]): SellerApplication[] => {
            if (!debouncedSearch) return apps;
            const query = debouncedSearch.toLowerCase();
            return apps.filter((app) => {
                const fullName =
                    `${app.user?.firstName ?? ""} ${app.user?.lastName ?? ""}`.toLowerCase();
                const email = (app.user?.email ?? "").toLowerCase();
                const displayName = (app.displayName ?? "").toLowerCase();
                return (
                    fullName.includes(query) ||
                    email.includes(query) ||
                    displayName.includes(query)
                );
            });
        },
        [debouncedSearch]
    );

    // ─── Actions ────────────────────────────────────────────────────────
    const handleApprove = () => {
        if (!approveTarget) return;
        reviewMutation.mutate(
            {
                id: approveTarget.id,
                decision: "approve",
                reviewNotes: approveNotes || undefined,
            },
            {
                onSuccess: () => {
                    success(
                        "Application approved",
                        `${approveTarget.user.firstName} ${approveTarget.user.lastName} has been approved as a seller.`
                    );
                    setApproveTarget(null);
                    setApproveNotes("");
                },
                onError: (err: Error) => {
                    toastError(
                        "Approval failed",
                        err.message || "Failed to approve application."
                    );
                },
            }
        );
    };

    const handleReject = () => {
        if (!rejectTarget) return;

        // Build the combined rejection reason text
        const reasonLabel = rejectionReason
            ? REJECTION_REASON_LABELS[rejectionReason as RejectionReason]
            : "";
        const combinedNotes = [reasonLabel, rejectNotes]
            .filter(Boolean)
            .join(": ");

        if (!combinedNotes.trim()) {
            setRejectValidationError(true);
            return;
        }

        reviewMutation.mutate(
            {
                id: rejectTarget.id,
                decision: "reject",
                reviewNotes: combinedNotes,
            },
            {
                onSuccess: () => {
                    success(
                        "Application rejected",
                        `${rejectTarget.user.firstName} ${rejectTarget.user.lastName}'s application has been rejected.`
                    );
                    setRejectTarget(null);
                    setRejectNotes("");
                    setRejectionReason("");
                    setRejectValidationError(false);
                },
                onError: (err: Error) => {
                    toastError(
                        "Rejection failed",
                        err.message || "Failed to reject application."
                    );
                },
            }
        );
    };

    // ─── Render application card ────────────────────────────────────────
    const renderApplicationCard = (app: SellerApplication) => {
        const fullName = `${app.user?.firstName ?? ""} ${app.user?.lastName ?? ""}`.trim();
        const initials = `${(app.user?.firstName ?? "")[0] ?? ""}${(app.user?.lastName ?? "")[0] ?? ""}`.toUpperCase();
        const avatarColor = getAvatarColor(fullName || app.id);

        return (
            <div
                key={app.id}
                className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 hover:shadow-md transition-shadow"
            >
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Left: Avatar */}
                    <div className="flex-shrink-0">
                        {app.user?.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={app.user.avatar}
                                alt={fullName}
                                className="h-11 w-11 rounded-full object-cover"
                            />
                        ) : (
                            <div
                                className={`h-11 w-11 rounded-full ${avatarColor} flex items-center justify-center`}
                            >
                                <span className="text-sm font-bold text-white">
                                    {initials || "?"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Center: Content */}
                    <div className="flex-1 min-w-0 space-y-3">
                        {/* Name, email, status */}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {fullName || "Unknown Applicant"}
                            </h3>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                {app.user?.email}
                            </span>
                            <StatusBadge status={app.status} />
                        </div>

                        {/* Date + relative time */}
                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                                {new Date(app.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                    }
                                )}
                            </span>
                            <span className="text-zinc-300 dark:text-zinc-600">
                                |
                            </span>
                            <RelativeTime date={app.createdAt} />
                        </div>

                        {/* Display name */}
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                Seller name:{" "}
                                <span className="font-medium text-zinc-900 dark:text-white">
                                    {app.displayName}
                                </span>
                            </span>
                        </div>

                        {/* Bio / Experience */}
                        {(app.bio || app.experience) && (
                            <ExpandableText
                                text={app.bio || app.experience || ""}
                                maxLines={3}
                            />
                        )}

                        {/* Specialties */}
                        {app.specialties && app.specialties.length > 0 && (
                            <div className="flex items-start gap-2">
                                <Tag className="h-3.5 w-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                <div className="flex flex-wrap gap-1.5">
                                    {app.specialties.map((spec) => (
                                        <span
                                            key={spec}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Portfolio URL */}
                        {app.portfolioUrl && (
                            <div className="flex items-center gap-2">
                                <Link2 className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                <a
                                    href={app.portfolioUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 truncate max-w-md"
                                >
                                    {app.portfolioUrl.replace(
                                        /^https?:\/\/(www\.)?/,
                                        ""
                                    )}
                                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                </a>
                            </div>
                        )}

                        {/* Sample work URLs */}
                        {app.sampleWorkUrls &&
                            app.sampleWorkUrls.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <FileText className="h-3.5 w-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-wrap gap-2">
                                        {app.sampleWorkUrls.map(
                                            (url, index) => (
                                                <a
                                                    key={url}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                                                >
                                                    Sample {index + 1}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Requested categories */}
                        {app.requestedCategories &&
                            app.requestedCategories.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <Tag className="h-3.5 w-3.5 text-zinc-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex flex-wrap gap-1.5">
                                        {app.requestedCategories.map(
                                            (category) => (
                                                <span
                                                    key={category}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-200/50 dark:border-violet-800/50"
                                                >
                                                    {category}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Previous review notes (for approved/rejected) */}
                        {app.reviewNotes && app.status !== "pending" && (
                            <div className="mt-2 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                                    Review Notes
                                </p>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                                    {app.reviewNotes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Action buttons */}
                    <div className="flex sm:flex-col items-center sm:items-stretch gap-2 flex-shrink-0 w-full sm:w-auto">
                        {app.status === "pending" ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setApproveTarget(app)}
                                    className="flex-1 sm:flex-initial text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                                >
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    Approve
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRejectTarget(app)}
                                    className="flex-1 sm:flex-initial text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                >
                                    <XCircle className="h-4 w-4 mr-1.5" />
                                    Reject
                                </Button>
                                <Link
                                    href={`/sellers/applications/${app.id}`}
                                    className="flex-1 sm:flex-initial"
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full"
                                    >
                                        <Eye className="h-4 w-4 mr-1.5" />
                                        Details
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <Link href={`/sellers/applications/${app.id}`}>
                                <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4 mr-1.5" />
                                    View Details
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ─── Render application list for a tab ───────────────────────────────
    const renderApplicationList = (
        applications: SellerApplication[],
        isLoading: boolean,
        error: Error | null,
        emptyIcon: React.ReactNode,
        emptyTitle: string,
        emptyDescription: string,
        meta: ApplicationsMeta,
        cursor: string | undefined,
        setCursorFn: (c: string | undefined) => void
    ) => {
        const filtered = filterBySearch(applications);

        if (isLoading) {
            return <CardSkeleton count={4} />;
        }

        if (error) {
            return (
                <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                        <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                        Failed to load applications
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        {error.message ||
                            "An error occurred while fetching applications."}
                    </p>
                </div>
            );
        }

        if (filtered.length === 0) {
            return (
                <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                        {emptyIcon}
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                        {debouncedSearch
                            ? "No matching applications"
                            : emptyTitle}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                        {debouncedSearch
                            ? "Try adjusting your search query to find what you are looking for."
                            : emptyDescription}
                    </p>
                    {debouncedSearch && (
                        <Button
                            variant="ghost"
                            onClick={() => setSearchQuery("")}
                            className="mt-4 text-primary"
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <>
                <div className="space-y-4">
                    {filtered.map(renderApplicationCard)}
                </div>

                {/* Pagination */}
                {(meta.hasPreviousPage || meta.hasNextPage) && (
                    <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            {meta.total
                                ? `${meta.total} total applications`
                                : `${filtered.length} applications`}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!meta.hasPreviousPage}
                                onClick={() =>
                                    setCursorFn(meta.previousCursor)
                                }
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!meta.hasNextPage}
                                onClick={() => setCursorFn(meta.nextCursor)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Seller Applications"
                description="Review and manage seller applications"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Sellers", href: "/sellers" },
                    { label: "Applications" },
                ]}
                backHref="/sellers"
                backLabel="Back to Sellers"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatsCard
                        label="Pending Applications"
                        value={pendingCount}
                        icon={<Clock className="h-5 w-5" />}
                        iconBg="bg-amber-100 dark:bg-amber-900/30"
                        iconColor="text-amber-600 dark:text-amber-400"
                        highlight={pendingCount > 0}
                        isLoading={isLoadingPending}
                    />
                    <StatsCard
                        label="Approved This Month"
                        value={approvedCount}
                        icon={<UserCheck className="h-5 w-5" />}
                        iconBg="bg-green-100 dark:bg-green-900/30"
                        iconColor="text-green-600 dark:text-green-400"
                        isLoading={isLoadingApproved}
                    />
                    <StatsCard
                        label="Rejected This Month"
                        value={rejectedCount}
                        icon={<UserX className="h-5 w-5" />}
                        iconBg="bg-red-100 dark:bg-red-900/30"
                        iconColor="text-red-600 dark:text-red-400"
                        isLoading={isLoadingRejected}
                    />
                </div>

                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList>
                        <TabsTrigger value="pending">
                            Pending
                            {pendingCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-white">
                                    {pendingCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>

                    {/* Search bar */}
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search by name, email, or display name..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Pending Tab */}
                    <TabsContent value="pending" className="space-y-4">
                        {renderApplicationList(
                            pendingApplications,
                            isLoadingPending,
                            pendingError as Error | null,
                            <Shield className="h-6 w-6 text-zinc-400" />,
                            "No pending applications",
                            "All applications have been reviewed. Check back later for new submissions.",
                            pendingMeta,
                            pendingCursor,
                            setPendingCursor
                        )}
                    </TabsContent>

                    {/* Approved Tab */}
                    <TabsContent value="approved" className="space-y-4">
                        {renderApplicationList(
                            approvedApplications,
                            isLoadingApproved,
                            approvedError as Error | null,
                            <UserCheck className="h-6 w-6 text-zinc-400" />,
                            "No approved applications",
                            "No applications have been approved yet.",
                            approvedMeta,
                            approvedCursor,
                            setApprovedCursor
                        )}
                    </TabsContent>

                    {/* Rejected Tab */}
                    <TabsContent value="rejected" className="space-y-4">
                        {renderApplicationList(
                            rejectedApplications,
                            isLoadingRejected,
                            rejectedError as Error | null,
                            <UserX className="h-6 w-6 text-zinc-400" />,
                            "No rejected applications",
                            "No applications have been rejected.",
                            rejectedMeta,
                            rejectedCursor,
                            setRejectedCursor
                        )}
                    </TabsContent>

                    {/* All Tab */}
                    <TabsContent value="all" className="space-y-4">
                        {renderApplicationList(
                            allApplications,
                            isLoadingAll,
                            allError as Error | null,
                            <FileText className="h-6 w-6 text-zinc-400" />,
                            "No applications",
                            "No seller applications have been submitted yet.",
                            allMeta,
                            allCursor,
                            setAllCursor
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* ─── Approve Modal ──────────────────────────────────────────── */}
            <ConfirmModal
                open={!!approveTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setApproveTarget(null);
                        setApproveNotes("");
                    }
                }}
                title="Approve Application"
                description={
                    approveTarget
                        ? `Are you sure you want to approve ${approveTarget.user.firstName} ${approveTarget.user.lastName}'s seller application? They will be able to list products on the marketplace.`
                        : ""
                }
                onConfirm={handleApprove}
                isLoading={reviewMutation.isPending}
                variant="success"
                confirmLabel="Approve"
                cancelLabel="Cancel"
            >
                <div className="px-4 pb-2">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        Notes (optional)
                    </label>
                    <Textarea
                        placeholder="Add any notes for this approval..."
                        value={approveNotes}
                        onChange={(e) => setApproveNotes(e.target.value)}
                        rows={3}
                        className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                    />
                </div>
            </ConfirmModal>

            {/* ─── Reject Modal ───────────────────────────────────────────── */}
            <ConfirmModal
                open={!!rejectTarget}
                onOpenChange={(open) => {
                    if (!open) {
                        setRejectTarget(null);
                        setRejectNotes("");
                        setRejectionReason("");
                        setRejectValidationError(false);
                    }
                }}
                title="Reject Application"
                description={
                    rejectTarget
                        ? `Are you sure you want to reject ${rejectTarget.user.firstName} ${rejectTarget.user.lastName}'s seller application?`
                        : ""
                }
                onConfirm={handleReject}
                isLoading={reviewMutation.isPending}
                variant="danger"
                confirmLabel="Reject"
                cancelLabel="Cancel"
            >
                <div className="px-4 pb-2 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Rejection reason{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={rejectionReason}
                            onValueChange={(v) => {
                                setRejectionReason(v);
                                setRejectValidationError(false);
                            }}
                        >
                            <SelectTrigger
                                className={`bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 ${
                                    rejectValidationError && !rejectionReason
                                        ? "border-red-500 ring-1 ring-red-500"
                                        : ""
                                }`}
                            >
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="quality_concerns">
                                    Quality concerns
                                </SelectItem>
                                <SelectItem value="incomplete_information">
                                    Incomplete information
                                </SelectItem>
                                <SelectItem value="policy_violation">
                                    Policy violation
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                            Additional details
                        </label>
                        <Textarea
                            placeholder="Provide additional context for the rejection..."
                            value={rejectNotes}
                            onChange={(e) => {
                                setRejectNotes(e.target.value);
                                setRejectValidationError(false);
                            }}
                            rows={3}
                            className={`bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 ${
                                rejectValidationError &&
                                !rejectionReason &&
                                !rejectNotes.trim()
                                    ? "border-red-500 ring-1 ring-red-500"
                                    : ""
                            }`}
                        />
                    </div>

                    {rejectValidationError && (
                        <p className="text-xs text-red-500 font-medium">
                            Please select a rejection reason or provide
                            additional details.
                        </p>
                    )}
                </div>
            </ConfirmModal>
        </div>
    );
}
