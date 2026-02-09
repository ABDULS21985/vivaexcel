"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    Check,
    X,
    AlertTriangle,
    Trash2,
    CheckCircle,
    MessageCircle,
    Loader2,
} from "lucide-react";
import {
    useAllComments,
    useApproveComment,
    useRejectComment,
    useSpamComment,
    useDeleteComment,
    type Comment,
} from "@/hooks/use-comments";

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    spam: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function CommentsPage() {
    const { success, error: toastError } = useToast();
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<Comment | null>(null);

    // ─── Data fetching ──────────────────────────────────────────────────────────
    const filters = React.useMemo(
        () => (statusFilter !== "all" ? { status: statusFilter } : undefined),
        [statusFilter],
    );
    const { data: comments = [], isLoading, isError, error: fetchError } = useAllComments(filters);

    // ─── Mutations ──────────────────────────────────────────────────────────────
    const approveMutation = useApproveComment();
    const rejectMutation = useRejectComment();
    const spamMutation = useSpamComment();
    const deleteMutation = useDeleteComment();

    const isMutating =
        approveMutation.isPending ||
        rejectMutation.isPending ||
        spamMutation.isPending ||
        deleteMutation.isPending;

    // ─── Helpers to derive display fields from API comment ──────────────────────
    const getAuthorName = (item: Comment) =>
        item.authorName ||
        (item.author
            ? `${item.author.firstName} ${item.author.lastName}`.trim()
            : "Anonymous");

    const getAuthorEmail = (item: Comment) =>
        item.authorEmail || "";

    const getPostTitle = (item: Comment) =>
        item.post?.title || "Unknown Post";

    // ─── Single-item actions ────────────────────────────────────────────────────
    const handleApprove = (item: Comment) => {
        approveMutation.mutate(
            { postId: item.postId, commentId: item.id },
            {
                onSuccess: () =>
                    success("Comment approved", "The comment is now visible on the post."),
                onError: (err) =>
                    toastError("Error", err.message || "Failed to approve comment."),
            },
        );
    };

    const handleReject = (item: Comment) => {
        rejectMutation.mutate(
            { postId: item.postId, commentId: item.id },
            {
                onSuccess: () =>
                    success("Comment rejected", "The comment has been rejected."),
                onError: (err) =>
                    toastError("Error", err.message || "Failed to reject comment."),
            },
        );
    };

    const handleMarkSpam = (item: Comment) => {
        spamMutation.mutate(
            { postId: item.postId, commentId: item.id },
            {
                onSuccess: () =>
                    success("Marked as spam", "The comment has been marked as spam."),
                onError: (err) =>
                    toastError("Error", err.message || "Failed to mark comment as spam."),
            },
        );
    };

    const handleDelete = (item: Comment) => {
        setDeleteTarget(item);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        deleteMutation.mutate(
            { postId: deleteTarget.postId, commentId: deleteTarget.id },
            {
                onSuccess: () => {
                    success("Comment deleted", "The comment has been permanently removed.");
                    setIsDeleteOpen(false);
                    setDeleteTarget(null);
                },
                onError: (err) => {
                    toastError("Error", err.message || "Failed to delete the comment.");
                },
            },
        );
    };

    // ─── Bulk actions ───────────────────────────────────────────────────────────
    const handleBulkApprove = () => {
        const targets = comments.filter((c) => selectedIds.has(c.id));
        let completed = 0;
        targets.forEach((c) => {
            approveMutation.mutate(
                { postId: c.postId, commentId: c.id },
                {
                    onSuccess: () => {
                        completed++;
                        if (completed === targets.length) {
                            success("Comments approved", `${targets.length} comments have been approved.`);
                            setSelectedIds(new Set());
                        }
                    },
                    onError: (err) =>
                        toastError("Error", err.message || "Failed to approve a comment."),
                },
            );
        });
    };

    const handleBulkSpam = () => {
        const targets = comments.filter((c) => selectedIds.has(c.id));
        let completed = 0;
        targets.forEach((c) => {
            spamMutation.mutate(
                { postId: c.postId, commentId: c.id },
                {
                    onSuccess: () => {
                        completed++;
                        if (completed === targets.length) {
                            success("Marked as spam", `${targets.length} comments marked as spam.`);
                            setSelectedIds(new Set());
                        }
                    },
                    onError: (err) =>
                        toastError("Error", err.message || "Failed to mark a comment as spam."),
                },
            );
        });
    };

    const handleBulkDelete = () => {
        const targets = comments.filter((c) => selectedIds.has(c.id));
        let completed = 0;
        targets.forEach((c) => {
            deleteMutation.mutate(
                { postId: c.postId, commentId: c.id },
                {
                    onSuccess: () => {
                        completed++;
                        if (completed === targets.length) {
                            success("Comments deleted", `${targets.length} comments have been deleted.`);
                            setSelectedIds(new Set());
                        }
                    },
                    onError: (err) =>
                        toastError("Error", err.message || "Failed to delete a comment."),
                },
            );
        });
    };

    // ─── Selection ──────────────────────────────────────────────────────────────
    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === comments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(comments.map((c) => c.id)));
        }
    };

    // ─── Table columns ──────────────────────────────────────────────────────────
    const columns: Column<Comment>[] = [
        {
            key: "select",
            header: "",
            className: "w-10",
            render: (item) => (
                <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                />
            ),
        },
        {
            key: "author",
            header: "Author",
            sortable: true,
            render: (item) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">
                        {getAuthorName(item)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {getAuthorEmail(item)}
                    </p>
                </div>
            ),
        },
        {
            key: "content",
            header: "Comment",
            render: (item) => (
                <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2 max-w-md">
                    {item.content}
                </p>
            ),
        },
        {
            key: "postTitle",
            header: "Post",
            sortable: true,
            render: (item) => (
                <span className="text-sm text-primary font-medium hover:underline cursor-pointer">
                    {getPostTitle(item)}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[item.status] ?? ""}`}
                >
                    {item.status}
                </span>
            ),
        },
        {
            key: "createdAt",
            header: "Date",
            sortable: true,
            render: (item) => (
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                </span>
            ),
        },
    ];

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen">
            <PageHeader
                title="Comments"
                description="Review and manage comments across all blog posts"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Comments" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Error Banner */}
                {isError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-red-700 dark:text-red-400 text-sm">
                        Failed to load comments: {fetchError?.message || "Unknown error"}
                    </div>
                )}

                {/* Filters & Bulk Actions */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Comments</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="spam">Spam</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === comments.length && comments.length > 0}
                                onChange={toggleSelectAll}
                                className="rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                Select all
                            </span>
                        </div>
                    </div>

                    {selectedIds.size > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">
                                {selectedIds.size} selected
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkApprove}
                                disabled={isMutating}
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkSpam}
                                disabled={isMutating}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Spam
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkDelete}
                                disabled={isMutating}
                                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                        <span className="ml-3 text-zinc-500 dark:text-zinc-400">Loading comments...</span>
                    </div>
                ) : (
                    /* Comments Table */
                    <DataTable
                        columns={columns}
                        data={comments}
                        keyField="id"
                        searchable
                        searchPlaceholder="Search comments..."
                        emptyMessage="No comments found"
                        emptyDescription="There are no comments matching your filters."
                        actions={(item) => (
                            <div className="flex items-center gap-1">
                                {item.status !== "approved" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleApprove(item)}
                                        disabled={isMutating}
                                        title="Approve"
                                    >
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    </Button>
                                )}
                                {item.status !== "rejected" && item.status !== "spam" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleReject(item)}
                                        disabled={isMutating}
                                        title="Reject"
                                    >
                                        <X className="h-4 w-4 text-orange-500" />
                                    </Button>
                                )}
                                {item.status !== "spam" && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => handleMarkSpam(item)}
                                        disabled={isMutating}
                                        title="Mark as Spam"
                                    >
                                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDelete(item)}
                                    disabled={isMutating}
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        )}
                    />
                )}
            </div>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                onConfirm={confirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
