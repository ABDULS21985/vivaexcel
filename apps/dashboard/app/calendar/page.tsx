"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ktblog/ui/components";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Filter,
    LayoutGrid,
    Rows3,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import type { CalendarPost, PostStatus } from "@/components/calendar/calendar-post-card";
import { useBlogPosts, useUpdatePost, useBlogCategories, type BlogPost } from "@/hooks/use-blog";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/**
 * Map a BlogPost from the API into the CalendarPost shape expected by the
 * calendar UI components.  Uses scheduledAt for scheduled posts, publishedAt
 * for published posts, and createdAt as a final fallback.
 */
function blogPostToCalendarPost(post: BlogPost): CalendarPost {
    const dateStr =
        post.scheduledAt ??
        post.publishedAt ??
        post.createdAt ??
        new Date().toISOString();

    return {
        id: post.id,
        title: post.title,
        status: post.status,
        category: post.category?.name ?? "Uncategorized",
        author: post.author?.name ?? "Unknown",
        authorAvatar: post.author?.avatar,
        scheduledAt: dateStr,
        excerpt: post.excerpt ?? undefined,
    };
}

export default function CalendarPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();

    const [currentDate, setCurrentDate] = React.useState(() => new Date());
    const [viewMode, setViewMode] = React.useState<"month" | "week">("month");

    // Filters
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [categoryFilter, setCategoryFilter] = React.useState("all");
    const [authorFilter, setAuthorFilter] = React.useState("all");

    // --- Data fetching via React Query ---
    const {
        data: postsData,
        isLoading: isPostsLoading,
        isError: isPostsError,
        error: postsError,
        refetch: refetchPosts,
    } = useBlogPosts({ limit: 100 });

    const { data: categoriesData } = useBlogCategories();

    const updatePost = useUpdatePost();

    // Derive CalendarPost[] from API response
    const posts: CalendarPost[] = React.useMemo(() => {
        const items = postsData?.items ?? [];
        return items.map(blogPostToCalendarPost);
    }, [postsData]);

    // Derive unique category names for the filter dropdown
    const categories = React.useMemo(() => {
        if (categoriesData?.categories) {
            return categoriesData.categories.map((c) => c.name);
        }
        // Fallback: derive from loaded posts
        const unique = new Set(posts.map((p) => p.category));
        return Array.from(unique).sort();
    }, [categoriesData, posts]);

    // Derive unique author names for the filter dropdown
    const authors = React.useMemo(() => {
        const unique = new Set(posts.map((p) => p.author));
        return Array.from(unique).sort();
    }, [posts]);

    const filteredPosts = React.useMemo(() => {
        return posts.filter((post) => {
            if (statusFilter !== "all" && post.status !== statusFilter) return false;
            if (categoryFilter !== "all" && post.category !== categoryFilter) return false;
            if (authorFilter !== "all" && post.author !== authorFilter) return false;
            return true;
        });
    }, [posts, statusFilter, categoryFilter, authorFilter]);

    const navigateMonth = (direction: number) => {
        setCurrentDate((prev) => {
            const next = new Date(prev);
            if (viewMode === "month") {
                next.setMonth(next.getMonth() + direction);
            } else {
                next.setDate(next.getDate() + direction * 7);
            }
            return next;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (date: Date) => {
        const isoDate = date.toISOString().split("T")[0];
        router.push(`/blog/new?scheduledAt=${isoDate}`);
    };

    const handlePostDrop = (post: CalendarPost, newDate: Date) => {
        const oldDate = new Date(post.scheduledAt);
        const newScheduledAt = new Date(newDate);
        newScheduledAt.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0);

        updatePost.mutate(
            { id: post.id, data: { scheduledAt: newScheduledAt.toISOString() } },
            {
                onSuccess: () => {
                    success(
                        "Post rescheduled",
                        `"${post.title}" moved to ${newDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                    );
                },
                onError: () => {
                    toastError(
                        "Reschedule failed",
                        `Could not reschedule "${post.title}". Please try again.`
                    );
                },
            }
        );
    };

    const headerTitle = viewMode === "month"
        ? `${MONTH_NAMES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
        : `Week of ${currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // Status counts for the legend
    const statusCounts = React.useMemo(() => {
        const counts: Record<PostStatus, number> = { published: 0, scheduled: 0, draft: 0, archived: 0 };
        filteredPosts.forEach((p) => { counts[p.status]++; });
        return counts;
    }, [filteredPosts]);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Editorial Calendar"
                description="Plan and schedule your content visually"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Calendar" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {/* Left: navigation */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth(-1)}
                                className="h-9 w-9 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigateMonth(1)}
                                className="h-9 w-9 p-0"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white min-w-[200px]">
                            {headerTitle}
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={goToToday}
                            className="text-primary"
                        >
                            Today
                        </Button>
                    </div>

                    {/* Right: view toggles and filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* View toggle */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode("month")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                                    viewMode === "month"
                                        ? "bg-primary text-white"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                }`}
                            >
                                <LayoutGrid className="h-3.5 w-3.5" />
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode("week")}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                                    viewMode === "week"
                                        ? "bg-primary text-white"
                                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                }`}
                            >
                                <Rows3 className="h-3.5 w-3.5" />
                                Week
                            </button>
                        </div>

                        {/* Filters */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[140px] h-9 text-xs">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={authorFilter} onValueChange={setAuthorFilter}>
                            <SelectTrigger className="w-[130px] h-9 text-xs">
                                <SelectValue placeholder="Author" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Authors</SelectItem>
                                {authors.map((author) => (
                                    <SelectItem key={author} value={author}>{author}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Status legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">Legend:</span>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-zinc-600 dark:text-zinc-400">Published ({statusCounts.published})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <span className="text-zinc-600 dark:text-zinc-400">Scheduled ({statusCounts.scheduled})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <span className="text-zinc-600 dark:text-zinc-400">Draft ({statusCounts.draft})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
                        <span className="text-zinc-600 dark:text-zinc-400">Archived ({statusCounts.archived})</span>
                    </div>
                </div>

                {/* Loading state */}
                {isPostsLoading && (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-12">
                        <div className="flex flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <p className="text-sm font-medium">Loading calendar posts...</p>
                        </div>
                    </div>
                )}

                {/* Error state */}
                {isPostsError && (
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-red-200 dark:border-red-800 p-8">
                        <div className="flex flex-col items-center justify-center gap-3 text-red-600 dark:text-red-400">
                            <AlertCircle className="h-8 w-8" />
                            <p className="text-sm font-medium">
                                Failed to load posts{postsError?.message ? `: ${postsError.message}` : ""}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchPosts()}
                                className="mt-2"
                            >
                                Try again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Calendar grid — only rendered once data is available */}
                {!isPostsLoading && !isPostsError && (
                    <CalendarGrid
                        currentDate={currentDate}
                        viewMode={viewMode}
                        posts={filteredPosts}
                        onDateClick={handleDateClick}
                        onPostDrop={handlePostDrop}
                    />
                )}
            </div>
        </div>
    );
}
