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
} from "lucide-react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import type { CalendarPost, PostStatus } from "@/components/calendar/calendar-post-card";

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

// Mock data for the calendar
const mockCalendarPosts: CalendarPost[] = [
    {
        id: "1",
        title: "The Future of Digital Trust",
        status: "published",
        category: "Technology",
        author: "John Doe",
        scheduledAt: "2026-02-03T10:00:00Z",
        excerpt: "Exploring how blockchain and AI are redefining trust in the digital age.",
    },
    {
        id: "2",
        title: "Implementing Blockchain in Banking",
        status: "published",
        category: "Finance",
        author: "Sarah Smith",
        scheduledAt: "2026-02-05T09:30:00Z",
        excerpt: "A comprehensive guide to integrating blockchain solutions.",
    },
    {
        id: "3",
        title: "AI Trends for 2026",
        status: "draft",
        category: "Artificial Intelligence",
        author: "Mike Johnson",
        scheduledAt: "2026-02-10T08:00:00Z",
        excerpt: "What to expect in the rapidly evolving world of AI this year.",
    },
    {
        id: "4",
        title: "Cybersecurity Best Practices",
        status: "scheduled",
        category: "Security",
        author: "Jane Wilson",
        scheduledAt: "2026-02-14T14:15:00Z",
        excerpt: "Essential security measures every organization should implement.",
    },
    {
        id: "5",
        title: "Digital Transformation Guide",
        status: "archived",
        category: "Business",
        author: "John Doe",
        scheduledAt: "2026-02-01T11:00:00Z",
    },
    {
        id: "6",
        title: "Cloud Migration Strategies",
        status: "scheduled",
        category: "Technology",
        author: "Sarah Smith",
        scheduledAt: "2026-02-18T10:00:00Z",
        excerpt: "Step-by-step guide to migrating your infrastructure to the cloud.",
    },
    {
        id: "7",
        title: "Data Privacy in 2026",
        status: "draft",
        category: "Security",
        author: "Mike Johnson",
        scheduledAt: "2026-02-22T09:00:00Z",
    },
    {
        id: "8",
        title: "Startup Funding Trends",
        status: "published",
        category: "Finance",
        author: "Jane Wilson",
        scheduledAt: "2026-02-07T12:00:00Z",
        excerpt: "How the funding landscape is changing for tech startups.",
    },
    {
        id: "9",
        title: "Machine Learning for Beginners",
        status: "scheduled",
        category: "Artificial Intelligence",
        author: "John Doe",
        scheduledAt: "2026-02-25T10:00:00Z",
    },
    {
        id: "10",
        title: "Remote Work Productivity Tips",
        status: "published",
        category: "Business",
        author: "Sarah Smith",
        scheduledAt: "2026-02-12T08:00:00Z",
        excerpt: "Proven strategies to boost productivity while working from home.",
    },
    {
        id: "11",
        title: "Intro to Web3 Development",
        status: "draft",
        category: "Technology",
        author: "Mike Johnson",
        scheduledAt: "2026-03-02T10:00:00Z",
    },
    {
        id: "12",
        title: "FinTech Innovations",
        status: "scheduled",
        category: "Finance",
        author: "Jane Wilson",
        scheduledAt: "2026-03-08T14:00:00Z",
    },
];

const categories = ["Technology", "Finance", "Security", "Business", "Artificial Intelligence"];
const authors = ["John Doe", "Sarah Smith", "Mike Johnson", "Jane Wilson"];

export default function CalendarPage() {
    const router = useRouter();
    const { success } = useToast();

    const [currentDate, setCurrentDate] = React.useState(new Date(2026, 1, 1)); // Feb 2026
    const [viewMode, setViewMode] = React.useState<"month" | "week">("month");
    const [posts, setPosts] = React.useState<CalendarPost[]>(mockCalendarPosts);

    // Filters
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [categoryFilter, setCategoryFilter] = React.useState("all");
    const [authorFilter, setAuthorFilter] = React.useState("all");

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
        setPosts((prev) =>
            prev.map((p) => {
                if (p.id === post.id) {
                    const oldDate = new Date(p.scheduledAt);
                    const newScheduledAt = new Date(newDate);
                    newScheduledAt.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0);
                    return { ...p, scheduledAt: newScheduledAt.toISOString() };
                }
                return p;
            })
        );
        success(
            "Post rescheduled",
            `"${post.title}" moved to ${newDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
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

                {/* Calendar grid */}
                <CalendarGrid
                    currentDate={currentDate}
                    viewMode={viewMode}
                    posts={filteredPosts}
                    onDateClick={handleDateClick}
                    onPostDrop={handlePostDrop}
                />
            </div>
        </div>
    );
}
