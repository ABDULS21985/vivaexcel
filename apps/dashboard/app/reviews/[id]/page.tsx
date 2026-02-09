"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Textarea,
} from "@ktblog/ui/components";
import {
    Loader2,
    Star,
    CheckCircle,
    XCircle,
    Flag,
    Shield,
    ThumbsUp,
    ThumbsDown,
    ArrowLeft,
    Clock,
    Pencil,
    Eye,
    User,
    Package,
    Monitor,
    Globe,
    Calendar,
    MessageSquare,
    AlertTriangle,
    Send,
    Image as ImageIcon,
    X,
} from "lucide-react";
import {
    useReview,
    useModerateReview,
    useRespondToReview,
    useDismissReports,
    useRemoveReview,
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
    PENDING_MODERATION: "Pending Moderation",
    REJECTED: "Rejected",
    FLAGGED: "Flagged",
};

// ─── Helper Components ──────────────────────────────────────────────────────

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" | "lg" }) {
    const sizeClass = size === "sm" ? "h-3.5 w-3.5" : size === "md" ? "h-5 w-5" : "h-6 w-6";
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
        <span className={`px-3 py-1.5 text-sm font-medium rounded-full ${STATUS_BADGE_STYLES[status] || ""}`}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}

function InfoRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <div className="flex-shrink-0 mt-0.5 text-zinc-400 dark:text-zinc-500">{icon}</div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
                <div className="text-sm text-zinc-900 dark:text-white mt-0.5">{children}</div>
            </div>
        </div>
    );
}

function SectionCard({ title, icon, children, className }: { title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 ${className || ""}`}>
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ReviewDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const reviewId = params.id as string;

    // ─── State ─────────────────────────────────────────────────────────
    const [sellerResponseText, setSellerResponseText] = React.useState("");
    const [isSubmittingResponse, setIsSubmittingResponse] = React.useState(false);
    const [confirmAction, setConfirmAction] = React.useState<
        "approve" | "reject" | "remove" | "dismiss" | null
    >(null);
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    // ─── Queries & Mutations ───────────────────────────────────────────
    const { data: review, isLoading, error } = useReview(reviewId);
    const moderateMutation = useModerateReview();
    const respondMutation = useRespondToReview();
    const dismissMutation = useDismissReports();
    const removeMutation = useRemoveReview();

    // ─── Actions ───────────────────────────────────────────────────────
    const handleConfirmAction = () => {
        if (!review || !confirmAction) return;

        if (confirmAction === "approve") {
            moderateMutation.mutate(
                { id: review.id, action: "APPROVED" },
                {
                    onSuccess: () => {
                        success("Review approved", "The review is now publicly visible.");
                        setConfirmAction(null);
                    },
                    onError: () => toastError("Error", "Failed to approve review."),
                }
            );
        } else if (confirmAction === "reject") {
            moderateMutation.mutate(
                { id: review.id, action: "REJECTED" },
                {
                    onSuccess: () => {
                        success("Review rejected", "The review has been rejected.");
                        setConfirmAction(null);
                    },
                    onError: () => toastError("Error", "Failed to reject review."),
                }
            );
        } else if (confirmAction === "dismiss") {
            dismissMutation.mutate(review.id, {
                onSuccess: () => {
                    success("Reports dismissed", "All reports for this review have been dismissed.");
                    setConfirmAction(null);
                },
                onError: () => toastError("Error", "Failed to dismiss reports."),
            });
        } else if (confirmAction === "remove") {
            removeMutation.mutate(review.id, {
                onSuccess: () => {
                    success("Review removed", "The review has been permanently removed.");
                    setConfirmAction(null);
                    router.push("/reviews");
                },
                onError: () => toastError("Error", "Failed to remove review."),
            });
        }
    };

    const handleSubmitResponse = () => {
        if (!review || !sellerResponseText.trim()) return;
        setIsSubmittingResponse(true);
        respondMutation.mutate(
            { id: review.id, response: sellerResponseText.trim() },
            {
                onSuccess: () => {
                    success("Response submitted", "Your response has been added to this review.");
                    setSellerResponseText("");
                    setIsSubmittingResponse(false);
                },
                onError: () => {
                    toastError("Error", "Failed to submit response.");
                    setIsSubmittingResponse(false);
                },
            }
        );
    };

    const getConfirmConfig = () => {
        switch (confirmAction) {
            case "approve":
                return { title: "Approve Review", description: "This review will become publicly visible.", variant: "success" as const, label: "Approve" };
            case "reject":
                return { title: "Reject Review", description: "This review will be hidden from public view.", variant: "danger" as const, label: "Reject" };
            case "dismiss":
                return { title: "Dismiss Reports", description: "All reports for this review will be dismissed.", variant: "info" as const, label: "Dismiss" };
            case "remove":
                return { title: "Remove Review", description: "This review will be permanently removed. This cannot be undone.", variant: "danger" as const, label: "Remove" };
            default:
                return { title: "", description: "", variant: "info" as const, label: "Confirm" };
        }
    };

    const confirmConfig = getConfirmConfig();

    // ─── Loading State ─────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Review Details"
                    backHref="/reviews"
                    backLabel="Back to Reviews"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Reviews", href: "/reviews" },
                        { label: "Loading..." },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading review details...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Error State ───────────────────────────────────────────────────
    if (error || !review) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Review Details"
                    backHref="/reviews"
                    backLabel="Back to Reviews"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Reviews", href: "/reviews" },
                        { label: "Error" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load review</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {error?.message || "The review could not be found or an error occurred."}
                        </p>
                        <Link href="/reviews">
                            <Button className="mt-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />Back to Reviews
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title={review.title || "Untitled Review"}
                backHref="/reviews"
                backLabel="Back to Reviews"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Reviews", href: "/reviews" },
                    { label: review.title || "Review Detail" },
                ]}
                actions={
                    <div className="flex items-center gap-2">
                        {review.status !== "APPROVED" && (
                            <Button
                                variant="outline"
                                onClick={() => setConfirmAction("approve")}
                                className="text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />Approve
                            </Button>
                        )}
                        {review.status !== "REJECTED" && (
                            <Button
                                variant="outline"
                                onClick={() => setConfirmAction("reject")}
                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                            >
                                <XCircle className="h-4 w-4 mr-2" />Reject
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => setConfirmAction("remove")}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                            <X className="h-4 w-4 mr-2" />Remove
                        </Button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ─── Main Content (Left Column) ───────────────────────── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Review Content */}
                        <SectionCard title="Review Content" icon={<MessageSquare className="h-4 w-4 text-zinc-400" />}>
                            <div className="space-y-4">
                                {/* Rating and Status */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    <StarRating rating={review.rating} size="lg" />
                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">{review.rating}/5</span>
                                    <StatusBadge status={review.status} />
                                    {review.isVerifiedPurchase && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 px-2 py-1 bg-green-100/50 dark:bg-green-900/20 rounded-full">
                                            <CheckCircle className="h-3.5 w-3.5" />Verified Purchase
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                    {review.title || "No title provided"}
                                </h2>

                                {/* Body */}
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {review.body}
                                </p>

                                {/* Pros & Cons */}
                                {(review.pros?.length || review.cons?.length) ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        {review.pros && review.pros.length > 0 && (
                                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30">
                                                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                                                    <ThumbsUp className="h-3.5 w-3.5" />Pros
                                                </p>
                                                <ul className="space-y-1">
                                                    {review.pros.map((pro, i) => (
                                                        <li key={i} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-1.5">
                                                            <span className="text-green-500 mt-1">+</span>
                                                            {pro}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {review.cons && review.cons.length > 0 && (
                                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                                                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                                                    <ThumbsDown className="h-3.5 w-3.5" />Cons
                                                </p>
                                                <ul className="space-y-1">
                                                    {review.cons.map((con, i) => (
                                                        <li key={i} className="text-sm text-red-800 dark:text-red-300 flex items-start gap-1.5">
                                                            <span className="text-red-500 mt-1">-</span>
                                                            {con}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : null}

                                {/* Helpful counts */}
                                <div className="flex items-center gap-4 pt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                    <span className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        {review.helpfulCount} found helpful
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ThumbsDown className="h-4 w-4" />
                                        {review.notHelpfulCount} found unhelpful
                                    </span>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                            <SectionCard title="Review Images" icon={<ImageIcon className="h-4 w-4 text-zinc-400" />}>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {review.images.map((image, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(image)}
                                            className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 hover:opacity-80 transition-opacity"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={image}
                                                alt={`Review image ${i + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>

                                {/* Image Lightbox */}
                                {selectedImage && (
                                    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                                        <button
                                            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                                            onClick={() => setSelectedImage(null)}
                                        >
                                            <X className="h-6 w-6" />
                                        </button>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={selectedImage}
                                            alt="Review image"
                                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                )}
                            </SectionCard>
                        )}

                        {/* Seller Response */}
                        <SectionCard title="Seller Response" icon={<Send className="h-4 w-4 text-zinc-400" />}>
                            {review.sellerResponse ? (
                                <div className="space-y-3">
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                        {review.sellerResponse}
                                    </p>
                                    {review.sellerRespondedAt && (
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                            Responded on {new Date(review.sellerRespondedAt).toLocaleDateString()} at {new Date(review.sellerRespondedAt).toLocaleTimeString()}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        No response has been submitted yet. Write a response below to address this review.
                                    </p>
                                    <Textarea
                                        placeholder="Write your response to this review..."
                                        className="min-h-[120px] bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                        value={sellerResponseText}
                                        onChange={(e) => setSellerResponseText(e.target.value)}
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSubmitResponse}
                                            disabled={!sellerResponseText.trim() || isSubmittingResponse}
                                        >
                                            {isSubmittingResponse ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4 mr-2" />
                                            )}
                                            Submit Response
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </SectionCard>

                        {/* Report History */}
                        {review.reports && review.reports.length > 0 && (
                            <SectionCard title="Report History" icon={<AlertTriangle className="h-4 w-4 text-orange-500" />}>
                                <div className="space-y-3">
                                    {review.reports.map((report) => (
                                        <div key={report.id} className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                    {report.reporter?.name || "Anonymous Reporter"}
                                                </span>
                                                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                                                    {report.reason}
                                                </span>
                                                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                                                    report.status === "PENDING"
                                                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                                                        : report.status === "REVIEWED"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                                                }`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            {report.details && (
                                                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{report.details}</p>
                                            )}
                                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                                {new Date(report.createdAt).toLocaleDateString()} at {new Date(report.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))}
                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setConfirmAction("dismiss")}
                                        >
                                            Dismiss All Reports
                                        </Button>
                                    </div>
                                </div>
                            </SectionCard>
                        )}

                        {/* AI Moderation Analysis */}
                        {review.aiModeration && (
                            <SectionCard title="AI Moderation Analysis" icon={<Shield className="h-4 w-4 text-purple-500" />}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Quality Score */}
                                        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Quality Score</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-2xl font-bold ${
                                                    review.aiModeration.qualityScore >= 70
                                                        ? "text-green-600 dark:text-green-400"
                                                        : review.aiModeration.qualityScore >= 40
                                                        ? "text-yellow-600 dark:text-yellow-400"
                                                        : "text-red-600 dark:text-red-400"
                                                }`}>
                                                    {review.aiModeration.qualityScore}
                                                </span>
                                                <span className="text-sm text-zinc-400">/100</span>
                                            </div>
                                        </div>

                                        {/* Recommendation */}
                                        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Recommendation</p>
                                            <span className={`text-sm font-bold ${
                                                review.aiModeration.recommendation === "APPROVE"
                                                    ? "text-green-600 dark:text-green-400"
                                                    : review.aiModeration.recommendation === "REJECT"
                                                    ? "text-red-600 dark:text-red-400"
                                                    : "text-yellow-600 dark:text-yellow-400"
                                            }`}>
                                                {review.aiModeration.recommendation.replace("_", " ")}
                                            </span>
                                        </div>

                                        {/* Analyzed At */}
                                        {review.aiModeration.analyzedAt && (
                                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
                                                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Analyzed</p>
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                    {new Date(review.aiModeration.analyzedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Flags */}
                                    {review.aiModeration.flags && review.aiModeration.flags.length > 0 && (
                                        <div>
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">Flags</p>
                                            <div className="flex flex-wrap gap-2">
                                                {review.aiModeration.flags.map((flag, i) => (
                                                    <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300">
                                                        {flag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reasoning */}
                                    {review.aiModeration.reasoning && (
                                        <div>
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Reasoning</p>
                                            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                                                {review.aiModeration.reasoning}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </SectionCard>
                        )}
                    </div>

                    {/* ─── Sidebar (Right Column) ───────────────────────────── */}
                    <div className="space-y-6">
                        {/* User Info */}
                        <SectionCard title="Reviewer" icon={<User className="h-4 w-4 text-zinc-400" />}>
                            <div className="flex items-center gap-3 mb-4">
                                {review.user?.avatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={review.user.avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center">
                                        <span className="text-lg font-medium text-zinc-600 dark:text-zinc-300">
                                            {(review.user?.name || "U").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                        {review.user?.name || "Anonymous"}
                                    </p>
                                    {review.user?.email && (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{review.user.email}</p>
                                    )}
                                </div>
                            </div>
                        </SectionCard>

                        {/* Product Info */}
                        <SectionCard title="Product" icon={<Package className="h-4 w-4 text-zinc-400" />}>
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                                    {review.digitalProduct?.title || "Unknown Product"}
                                </p>
                                {review.digitalProduct?.slug && (
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                        /{review.digitalProduct.slug}
                                    </p>
                                )}
                            </div>
                        </SectionCard>

                        {/* Metadata */}
                        {review.metadata && (
                            <SectionCard title="Metadata" icon={<Monitor className="h-4 w-4 text-zinc-400" />}>
                                <div className="space-y-1">
                                    {review.metadata.browser && (
                                        <InfoRow icon={<Globe className="h-3.5 w-3.5" />} label="Browser">
                                            {review.metadata.browser}
                                        </InfoRow>
                                    )}
                                    {review.metadata.os && (
                                        <InfoRow icon={<Monitor className="h-3.5 w-3.5" />} label="OS">
                                            {review.metadata.os}
                                        </InfoRow>
                                    )}
                                </div>
                            </SectionCard>
                        )}

                        {/* Timeline */}
                        <SectionCard title="Timeline" icon={<Clock className="h-4 w-4 text-zinc-400" />}>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Created</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {new Date(review.createdAt).toLocaleDateString()} at {new Date(review.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                {review.editedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Edited</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {new Date(review.editedAt).toLocaleDateString()} at {new Date(review.editedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <div className={`h-2 w-2 rounded-full ${
                                            review.status === "APPROVED"
                                                ? "bg-green-500"
                                                : review.status === "REJECTED"
                                                ? "bg-red-500"
                                                : review.status === "FLAGGED"
                                                ? "bg-orange-500"
                                                : "bg-yellow-500"
                                        }`} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                            Status: {STATUS_LABELS[review.status]}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            {new Date(review.updatedAt).toLocaleDateString()} at {new Date(review.updatedAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                {review.sellerRespondedAt && (
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Seller Responded</p>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {new Date(review.sellerRespondedAt).toLocaleDateString()} at {new Date(review.sellerRespondedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                </div>
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
