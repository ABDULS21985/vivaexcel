"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
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
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Badge,
    Textarea,
} from "@ktblog/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";
import {
    Search,
    MoreHorizontal,
    Loader2,
    X,
    Star,
    Eye,
    CheckCircle,
    XCircle,
    Flag,
    Shield,
    ThumbsUp,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Trophy,
    Clock,
    MessageSquare,
} from "lucide-react";
import {
    useReviews,
    useReviewStats,
    useModerateReview,
    useModerationQueue,
    useFlaggedReviews,
    useTopReviewers,
    useDismissReports,
    useRemoveReview,
    type Review,
    type ReviewStatus,
} from "@/hooks/use-reviews";

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_BADGE_STYLES: Record<ReviewStatus, string> = {
    APPROVED: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    PENDING_MODERATION: "bg-yellow-100/90 text-yellow-700 dark:bg-yellow-900/80 dark:text-yellow-300",
    REJECTED: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    FLAGGED: "bg-orange-100/90 text-orange-700 dark:bg-orange-900/80 dark:text-orange-300",
};

const STATUS_LABELS: Record<ReviewStatus, string> = {
    APPROVED: "Approved",
    PENDING_MODERATION: "Pending",
    REJECTED: "Rejected",
    FLAGGED: "Flagged",
};

// ─── Helper Components ──────────────────────────────────────────────────────

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
    const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    className={`${sizeClass} ${
                        i < rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-zinc-300 dark:text-zinc-600"
                    }`}
                />
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_BADGE_STYLES[status] || ""}`}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {Array.from({ length: rows }, (_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-4 animate-pulse">
                        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        <div className="flex gap-0.5">
                            {Array.from({ length: 5 }, (_, j) => (
                                <div key={j} className="h-3.5 w-3.5 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            ))}
                        </div>
                        <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded flex-1" />
                        <div className="h-6 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                        <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5 animate-pulse">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-full" />
                        <div className="flex-1 space-y-3">
                            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-700 rounded" />
                            <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-700 rounded" />
                            <div className="h-3 w-3/4 bg-zinc-200 dark:bg-zinc-700 rounded" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ReviewsPage() {
    const { success, error: toastError } = useToast();

    // ─── All Reviews tab state ─────────────────────────────────────────
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [ratingFilter, setRatingFilter] = React.useState("all");
    const [cursor, setCursor] = React.useState<string | undefined>(undefined);

    // ─── Moderation queue state ────────────────────────────────────────
    const [modCursor, setModCursor] = React.useState<string | undefined>(undefined);

    // ─── Flagged tab state ─────────────────────────────────────────────
    const [flagCursor, setFlagCursor] = React.useState<string | undefined>(undefined);

    // ─── Modal state ───────────────────────────────────────────────────
    const [confirmAction, setConfirmAction] = React.useState<{
        type: "approve" | "reject" | "remove" | "dismiss";
        review: Review;
    } | null>(null);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCursor(undefined);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: Record<string, unknown> = {};
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (ratingFilter !== "all") filters.rating = Number(ratingFilter);
        if (cursor) filters.cursor = cursor;
        filters.sortBy = "createdAt";
        filters.sortOrder = "DESC";
        return filters;
    }, [debouncedSearch, statusFilter, ratingFilter, cursor]);

    // ─── Queries ───────────────────────────────────────────────────────
    const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = useReviews(apiFilters);
    const reviews = reviewsData?.items ?? [];
    const meta = reviewsData?.meta;

    const { data: statsData, isLoading: isLoadingStats } = useReviewStats();
    const { data: modQueueData, isLoading: isLoadingModQueue } = useModerationQueue(modCursor, 20);
    const modReviews = modQueueData?.items ?? [];
    const modMeta = modQueueData?.meta;

    const { data: flaggedData, isLoading: isLoadingFlagged } = useFlaggedReviews(flagCursor, 20);
    const flaggedReviews = flaggedData?.items ?? [];
    const flaggedMeta = flaggedData?.meta;

    const { data: topReviewersData, isLoading: isLoadingTopReviewers } = useTopReviewers(20);
    const topReviewers = topReviewersData?.items ?? [];

    // ─── Mutations ─────────────────────────────────────────────────────
    const moderateMutation = useModerateReview();
    const dismissMutation = useDismissReports();
    const removeMutation = useRemoveReview();

    // ─── Actions ───────────────────────────────────────────────────────
    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        const { type, review } = confirmAction;

        if (type === "approve") {
            moderateMutation.mutate(
                { id: review.id, action: "APPROVED" },
                {
                    onSuccess: () => {
                        success("Review approved", `The review by ${review.user?.name || "user"} has been approved.`);
                        setConfirmAction(null);
                    },
                    onError: () => {
                        toastError("Error", "Failed to approve review.");
                    },
                }
            );
        } else if (type === "reject") {
            moderateMutation.mutate(
                { id: review.id, action: "REJECTED" },
                {
                    onSuccess: () => {
                        success("Review rejected", `The review by ${review.user?.name || "user"} has been rejected.`);
                        setConfirmAction(null);
                    },
                    onError: () => {
                        toastError("Error", "Failed to reject review.");
                    },
                }
            );
        } else if (type === "dismiss") {
            dismissMutation.mutate(review.id, {
                onSuccess: () => {
                    success("Reports dismissed", "All reports for this review have been dismissed.");
                    setConfirmAction(null);
                },
                onError: () => {
                    toastError("Error", "Failed to dismiss reports.");
                },
            });
        } else if (type === "remove") {
            removeMutation.mutate(review.id, {
                onSuccess: () => {
                    success("Review removed", "The review has been permanently removed.");
                    setConfirmAction(null);
                },
                onError: () => {
                    toastError("Error", "Failed to remove review.");
                },
            });
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("all");
        setRatingFilter("all");
        setCursor(undefined);
    };

    const hasActiveFilters = statusFilter !== "all" || ratingFilter !== "all";

    // ─── Pagination handlers ───────────────────────────────────────────
    const handleNextPage = () => {
        if (meta?.nextCursor) setCursor(meta.nextCursor);
    };
    const handlePrevPage = () => {
        if (meta?.previousCursor) setCursor(meta.previousCursor);
    };

    const getConfirmModalConfig = () => {
        if (!confirmAction) return { title: "", description: "", variant: "info" as const, label: "Confirm" };
        switch (confirmAction.type) {
            case "approve":
                return {
                    title: "Approve Review",
                    description: "Are you sure you want to approve this review? It will become publicly visible.",
                    variant: "success" as const,
                    label: "Approve",
                };
            case "reject":
                return {
                    title: "Reject Review",
                    description: "Are you sure you want to reject this review? It will be hidden from public view.",
                    variant: "danger" as const,
                    label: "Reject",
                };
            case "dismiss":
                return {
                    title: "Dismiss Reports",
                    description: "Are you sure you want to dismiss all reports for this review? The review will remain visible.",
                    variant: "info" as const,
                    label: "Dismiss Reports",
                };
            case "remove":
                return {
                    title: "Remove Review",
                    description: "Are you sure you want to permanently remove this review? This action cannot be undone.",
                    variant: "danger" as const,
                    label: "Remove",
                };
        }
    };

    const confirmConfig = getConfirmModalConfig();

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Reviews"
                description="Manage customer reviews and ratings"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Reviews" },
                ]}
                actions={
                    <Link href="/reviews/analytics">
                        <PageHeaderButton variant="outline" icon={<BarChart3 className="h-4 w-4" />}>
                            Analytics
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.totalReviews ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Reviews</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.averageRating ?? 0).toFixed(1)
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Average Rating</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.pendingModeration ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending Moderation</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.flaggedCount ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Flagged</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="all">All Reviews</TabsTrigger>
                        <TabsTrigger value="moderation">
                            Moderation Queue
                            {statsData && statsData.pendingModeration > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-yellow-500 text-white">
                                    {statsData.pendingModeration}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="flagged">
                            Flagged
                            {statsData && statsData.flaggedCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-orange-500 text-white">
                                    {statsData.flaggedCount}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="top-reviewers">Top Reviewers</TabsTrigger>
                    </TabsList>

                    {/* ─── All Reviews Tab ────────────────────────────────────── */}
                    <TabsContent value="all" className="space-y-4">
                        {/* Search and Filters */}
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <div className="relative w-full sm:w-96">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                    <Input
                                        placeholder="Search reviews by title or content..."
                                        className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCursor(undefined); }}>
                                        <SelectTrigger className="w-[150px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="PENDING_MODERATION">Pending</SelectItem>
                                            <SelectItem value="APPROVED">Approved</SelectItem>
                                            <SelectItem value="REJECTED">Rejected</SelectItem>
                                            <SelectItem value="FLAGGED">Flagged</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={ratingFilter} onValueChange={(v) => { setRatingFilter(v); setCursor(undefined); }}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Ratings</SelectItem>
                                            <SelectItem value="5">5 Stars</SelectItem>
                                            <SelectItem value="4">4 Stars</SelectItem>
                                            <SelectItem value="3">3 Stars</SelectItem>
                                            <SelectItem value="2">2 Stars</SelectItem>
                                            <SelectItem value="1">1 Star</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {hasActiveFilters && (
                                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-10">
                                            <X className="h-4 w-4 mr-1" />
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Loading */}
                        {isLoadingReviews && <TableSkeleton rows={8} />}

                        {/* Error */}
                        {!isLoadingReviews && reviewsError && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                                    <X className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load reviews</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {reviewsError.message || "An error occurred while fetching reviews."}
                                </p>
                            </div>
                        )}

                        {/* Reviews Table */}
                        {!isLoadingReviews && !reviewsError && (
                            <>
                                {reviews.length > 0 ? (
                                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Product</th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Reviewer</th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Rating</th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                                        <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                                        <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                    {reviews.map((review) => (
                                                        <tr key={review.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[180px]">
                                                                        {review.digitalProduct?.title || "Unknown Product"}
                                                                    </p>
                                                                    {review.isVerifiedPurchase && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
                                                                            <CheckCircle className="h-3 w-3" />
                                                                            Verified
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-2">
                                                                    {review.user?.avatar ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img
                                                                            src={review.user.avatar}
                                                                            alt=""
                                                                            className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center flex-shrink-0">
                                                                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                                                {(review.user?.name || "U").charAt(0).toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                                                                        {review.user?.name || "Anonymous"}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <StarRating rating={review.rating} />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <p className="text-sm text-zinc-900 dark:text-white truncate max-w-[200px]">
                                                                    {review.title || "No title"}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <StatusBadge status={review.status} />
                                                            </td>
                                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Link
                                                                        href={`/reviews/${review.id}`}
                                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                        title="View"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Link>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                                <MoreHorizontal className="h-4 w-4" />
                                                                            </button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem asChild>
                                                                                <Link href={`/reviews/${review.id}`}>
                                                                                    <Eye className="mr-2 h-4 w-4" />View Details
                                                                                </Link>
                                                                            </DropdownMenuItem>
                                                                            {review.status !== "APPROVED" && (
                                                                                <DropdownMenuItem onClick={() => setConfirmAction({ type: "approve", review })}>
                                                                                    <CheckCircle className="mr-2 h-4 w-4" />Approve
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            {review.status !== "REJECTED" && (
                                                                                <DropdownMenuItem onClick={() => setConfirmAction({ type: "reject", review })}>
                                                                                    <XCircle className="mr-2 h-4 w-4" />Reject
                                                                                </DropdownMenuItem>
                                                                            )}
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                className="text-red-600 focus:text-red-600"
                                                                                onClick={() => setConfirmAction({ type: "remove", review })}
                                                                            >
                                                                                <X className="mr-2 h-4 w-4" />Remove
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="h-6 w-6 text-zinc-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No reviews found</h3>
                                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                            {hasActiveFilters || debouncedSearch
                                                ? "Try adjusting your search or filters to find what you are looking for."
                                                : "No customer reviews have been submitted yet."}
                                        </p>
                                        {hasActiveFilters && (
                                            <Button variant="ghost" onClick={clearFilters} className="mt-4 text-primary">Clear all filters</Button>
                                        )}
                                    </div>
                                )}

                                {/* Pagination */}
                                {reviews.length > 0 && (meta?.hasPreviousPage || meta?.hasNextPage) && (
                                    <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {meta?.total ? `${meta.total} total reviews` : `${reviews.length} reviews`}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" disabled={!meta?.hasPreviousPage} onClick={handlePrevPage}>
                                                <ChevronLeft className="h-4 w-4 mr-1" />Previous
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={!meta?.hasNextPage} onClick={handleNextPage}>
                                                Next<ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    {/* ─── Moderation Queue Tab ───────────────────────────────── */}
                    <TabsContent value="moderation" className="space-y-4">
                        {isLoadingModQueue && <CardSkeleton count={5} />}

                        {!isLoadingModQueue && modReviews.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                    <Shield className="h-6 w-6 text-green-500" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Moderation queue is empty</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    All reviews have been moderated. Great work!
                                </p>
                            </div>
                        )}

                        {!isLoadingModQueue && modReviews.length > 0 && (
                            <div className="space-y-4">
                                {modReviews.map((review) => (
                                    <div key={review.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                        <div className="flex items-start gap-4">
                                            {/* User Avatar */}
                                            <div className="flex-shrink-0">
                                                {review.user?.avatar ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={review.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                                            {(review.user?.name || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Review Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {review.user?.name || "Anonymous"}
                                                    </span>
                                                    <StarRating rating={review.rating} />
                                                    {review.isVerifiedPurchase && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 dark:text-green-400">
                                                            <CheckCircle className="h-3 w-3" />Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                                                    {review.title}
                                                </p>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-3">
                                                    {review.body}
                                                </p>
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                                    For: <span className="font-medium text-zinc-600 dark:text-zinc-300">{review.digitalProduct?.title || "Unknown Product"}</span>
                                                    {" "}&middot;{" "}
                                                    {new Date(review.createdAt).toLocaleDateString()}
                                                </p>

                                                {/* AI Moderation Suggestion */}
                                                {review.aiModeration && (
                                                    <div className="mt-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Shield className="h-3.5 w-3.5 text-purple-500" />
                                                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">AI Moderation Suggestion</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
                                                            <span>
                                                                Quality: <span className="font-bold">{review.aiModeration.qualityScore}/100</span>
                                                            </span>
                                                            <span>
                                                                Recommendation:{" "}
                                                                <span className={`font-bold ${
                                                                    review.aiModeration.recommendation === "APPROVE"
                                                                        ? "text-green-600 dark:text-green-400"
                                                                        : review.aiModeration.recommendation === "REJECT"
                                                                        ? "text-red-600 dark:text-red-400"
                                                                        : "text-yellow-600 dark:text-yellow-400"
                                                                }`}>
                                                                    {review.aiModeration.recommendation.replace("_", " ")}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        {review.aiModeration.reasoning && (
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                                                {review.aiModeration.reasoning}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmAction({ type: "approve", review })}
                                                    className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                                                >
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmAction({ type: "reject", review })}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                                >
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Reject
                                                </Button>
                                                <Link href={`/reviews/${review.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Moderation Pagination */}
                                {(modMeta?.hasPreviousPage || modMeta?.hasNextPage) && (
                                    <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {modMeta?.total ? `${modMeta.total} pending reviews` : `${modReviews.length} reviews`}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" disabled={!modMeta?.hasPreviousPage} onClick={() => setModCursor(modMeta?.previousCursor)}>
                                                <ChevronLeft className="h-4 w-4 mr-1" />Previous
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={!modMeta?.hasNextPage} onClick={() => setModCursor(modMeta?.nextCursor)}>
                                                Next<ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Flagged Tab ────────────────────────────────────────── */}
                    <TabsContent value="flagged" className="space-y-4">
                        {isLoadingFlagged && <CardSkeleton count={5} />}

                        {!isLoadingFlagged && flaggedReviews.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                                    <Flag className="h-6 w-6 text-green-500" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No flagged reviews</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    There are currently no flagged reviews that need attention.
                                </p>
                            </div>
                        )}

                        {!isLoadingFlagged && flaggedReviews.length > 0 && (
                            <div className="space-y-4">
                                {flaggedReviews.map((review) => (
                                    <div key={review.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-orange-200 dark:border-orange-800/50 p-5">
                                        <div className="flex items-start gap-4">
                                            {/* User Avatar */}
                                            <div className="flex-shrink-0">
                                                {review.user?.avatar ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={review.user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center">
                                                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                                                            {(review.user?.name || "U").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                        {review.user?.name || "Anonymous"}
                                                    </span>
                                                    <StarRating rating={review.rating} />
                                                    <StatusBadge status={review.status} />
                                                </div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white mb-1">
                                                    {review.title}
                                                </p>
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-3">
                                                    {review.body}
                                                </p>

                                                {/* Report Details */}
                                                {review.reports && review.reports.length > 0 && (
                                                    <div className="space-y-2 mt-3">
                                                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                                            <AlertTriangle className="h-3.5 w-3.5" />
                                                            {review.reports.length} report{review.reports.length !== 1 ? "s" : ""}
                                                        </p>
                                                        {review.reports.slice(0, 3).map((report) => (
                                                            <div key={report.id} className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                                        {report.reporter?.name || "Anonymous Reporter"}
                                                                    </span>
                                                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                                                        {report.reason}
                                                                    </span>
                                                                </div>
                                                                {report.details && (
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{report.details}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {review.reports.length > 3 && (
                                                            <p className="text-xs text-zinc-400">
                                                                +{review.reports.length - 3} more reports
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-2 flex-shrink-0">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmAction({ type: "dismiss", review })}
                                                >
                                                    Dismiss Reports
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setConfirmAction({ type: "remove", review })}
                                                    className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                                                >
                                                    Remove Review
                                                </Button>
                                                <Link href={`/reviews/${review.id}`}>
                                                    <Button variant="ghost" size="sm" className="w-full">
                                                        <Eye className="h-4 w-4 mr-1" />View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Flagged Pagination */}
                                {(flaggedMeta?.hasPreviousPage || flaggedMeta?.hasNextPage) && (
                                    <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {flaggedMeta?.total ? `${flaggedMeta.total} flagged reviews` : `${flaggedReviews.length} reviews`}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm" disabled={!flaggedMeta?.hasPreviousPage} onClick={() => setFlagCursor(flaggedMeta?.previousCursor)}>
                                                <ChevronLeft className="h-4 w-4 mr-1" />Previous
                                            </Button>
                                            <Button variant="outline" size="sm" disabled={!flaggedMeta?.hasNextPage} onClick={() => setFlagCursor(flaggedMeta?.nextCursor)}>
                                                Next<ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    {/* ─── Top Reviewers Tab ──────────────────────────────────── */}
                    <TabsContent value="top-reviewers" className="space-y-4">
                        {isLoadingTopReviewers && <TableSkeleton rows={10} />}

                        {!isLoadingTopReviewers && topReviewers.length === 0 && (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No reviewers yet</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    The leaderboard will populate as customers submit reviews.
                                </p>
                            </div>
                        )}

                        {!isLoadingTopReviewers && topReviewers.length > 0 && (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-16">Rank</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Reviewer</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Reviews</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Helpful Votes</th>
                                                <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avg Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                            {topReviewers.map((reviewer, index) => (
                                                <tr key={reviewer.userId} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center justify-center">
                                                            {index < 3 ? (
                                                                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                                                    index === 0
                                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                        : index === 1
                                                                        ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-300"
                                                                        : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                                }`}>
                                                                    {index + 1}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{index + 1}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {reviewer.avatar ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={reviewer.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center">
                                                                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                                                        {(reviewer.name || "U").charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {reviewer.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                            {reviewer.totalReviews}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-1">
                                                            <ThumbsUp className="h-3.5 w-3.5 text-zinc-400" />
                                                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                                {reviewer.helpfulVotes}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <StarRating rating={Math.round(reviewer.averageRating)} />
                                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                {reviewer.averageRating.toFixed(1)}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                open={!!confirmAction}
                onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
                title={confirmConfig.title}
                description={confirmConfig.description}
                onConfirm={handleConfirmAction}
                isLoading={moderateMutation.isPending || dismissMutation.isPending || removeMutation.isPending}
                variant={confirmConfig.variant}
                confirmLabel={confirmConfig.label}
            />
        </div>
    );
}
