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
} from "lucide-react";

interface Comment {
    id: string;
    author: string;
    authorEmail: string;
    content: string;
    postTitle: string;
    postId: string;
    status: "pending" | "approved" | "spam";
    createdAt: string;
}

const initialComments: Comment[] = [
    {
        id: "1",
        author: "Sarah Connor",
        authorEmail: "sarah@example.com",
        content: "This is a fantastic article! Really helped me understand the topic better. Keep up the great work!",
        postTitle: "React Best Practices for 2024",
        postId: "1",
        status: "approved",
        createdAt: "2024-03-15T10:30:00Z",
    },
    {
        id: "2",
        author: "John Matrix",
        authorEmail: "john@example.com",
        content: "I have a question about the third section - could you elaborate on the performance optimizations?",
        postTitle: "TypeScript Tips You Need to Know",
        postId: "2",
        status: "pending",
        createdAt: "2024-03-15T14:15:00Z",
    },
    {
        id: "3",
        author: "SpamBot3000",
        authorEmail: "spam@fake.com",
        content: "Buy cheap products at amazing prices! Visit our website for discounts!!!",
        postTitle: "Complete Next.js 15 Guide",
        postId: "3",
        status: "spam",
        createdAt: "2024-03-14T08:00:00Z",
    },
    {
        id: "4",
        author: "Alice Wonderland",
        authorEmail: "alice@example.com",
        content: "Thanks for the detailed explanation. The code examples were particularly helpful.",
        postTitle: "Mastering CSS Grid Layout",
        postId: "4",
        status: "approved",
        createdAt: "2024-03-14T16:45:00Z",
    },
    {
        id: "5",
        author: "Bob Builder",
        authorEmail: "bob@example.com",
        content: "Would love to see a follow-up post that goes deeper into advanced patterns.",
        postTitle: "React Best Practices for 2024",
        postId: "1",
        status: "pending",
        createdAt: "2024-03-13T11:20:00Z",
    },
    {
        id: "6",
        author: "Grace Hopper",
        authorEmail: "grace@example.com",
        content: "The security tips in this post are spot on. I've implemented several of them already.",
        postTitle: "Node.js Security Essentials",
        postId: "5",
        status: "approved",
        createdAt: "2024-03-12T09:10:00Z",
    },
    {
        id: "7",
        author: "TestUser",
        authorEmail: "test@spam.net",
        content: "Free crypto giveaway! Click here now to claim your prize!!! Limited time only!!!",
        postTitle: "TypeScript Tips You Need to Know",
        postId: "2",
        status: "spam",
        createdAt: "2024-03-11T22:00:00Z",
    },
    {
        id: "8",
        author: "David Kim",
        authorEmail: "david@example.com",
        content: "I found a small typo in the third paragraph. Otherwise, excellent content!",
        postTitle: "Complete Next.js 15 Guide",
        postId: "3",
        status: "pending",
        createdAt: "2024-03-10T15:30:00Z",
    },
];

const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    spam: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function CommentsPage() {
    const { success, error } = useToast();
    const [comments, setComments] = React.useState<Comment[]>(initialComments);
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const filteredComments = React.useMemo(() => {
        if (statusFilter === "all") return comments;
        return comments.filter((c) => c.status === statusFilter);
    }, [comments, statusFilter]);

    const handleApprove = (id: string) => {
        setComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
        );
        success("Comment approved", "The comment is now visible on the post.");
    };

    const handleMarkSpam = (id: string) => {
        setComments((prev) =>
            prev.map((c) => (c.id === id ? { ...c, status: "spam" as const } : c))
        );
        success("Marked as spam", "The comment has been marked as spam.");
    };

    const handleDelete = (id: string) => {
        setDeleteTarget(id);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setComments((prev) => prev.filter((c) => c.id !== deleteTarget));
            success("Comment deleted", "The comment has been permanently removed.");
            setIsDeleteOpen(false);
            setDeleteTarget(null);
        } catch {
            error("Error", "Failed to delete the comment.");
        } finally {
            setIsLoading(false);
        }
    };

    // Bulk actions
    const handleBulkApprove = () => {
        setComments((prev) =>
            prev.map((c) =>
                selectedIds.has(c.id) ? { ...c, status: "approved" as const } : c
            )
        );
        success("Comments approved", `${selectedIds.size} comments have been approved.`);
        setSelectedIds(new Set());
    };

    const handleBulkSpam = () => {
        setComments((prev) =>
            prev.map((c) =>
                selectedIds.has(c.id) ? { ...c, status: "spam" as const } : c
            )
        );
        success("Marked as spam", `${selectedIds.size} comments marked as spam.`);
        setSelectedIds(new Set());
    };

    const handleBulkDelete = () => {
        setComments((prev) => prev.filter((c) => !selectedIds.has(c.id)));
        success("Comments deleted", `${selectedIds.size} comments have been deleted.`);
        setSelectedIds(new Set());
    };

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
        if (selectedIds.size === filteredComments.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredComments.map((c) => c.id)));
        }
    };

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
                        {item.author}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {item.authorEmail}
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
                    {item.postTitle}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[item.status]}`}
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
                                <SelectItem value="spam">Spam</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={selectedIds.size === filteredComments.length && filteredComments.length > 0}
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
                                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkSpam}
                                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                            >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Spam
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleBulkDelete}
                                className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                {/* Comments Table */}
                <DataTable
                    columns={columns}
                    data={filteredComments}
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
                                    onClick={() => handleApprove(item.id)}
                                    title="Approve"
                                >
                                    <Check className="h-4 w-4 text-emerald-500" />
                                </Button>
                            )}
                            {item.status !== "spam" && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleMarkSpam(item.id)}
                                    title="Mark as Spam"
                                >
                                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                        </div>
                    )}
                />
            </div>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                onConfirm={confirmDelete}
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
