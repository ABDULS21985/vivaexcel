"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { BulkActionsBar, type BulkAction } from "@/components/blog/bulk-actions-bar";
import { Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ktblog/ui/components";
import {
    Plus,
    Eye,
    MoreHorizontal,
    Pencil,
    Trash,
    Search,
    User,
    LayoutGrid,
    List,
    Copy,
    ExternalLink,
    Check,
    ArrowUpDown,
    Filter,
    X,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    status: "draft" | "published" | "archived";
    author: string;
    category: string;
    publishedAt: string | null;
    views: number;
    coverImage?: string;
    tags?: string[];
}

const initialPosts: BlogPost[] = [
    {
        id: "1",
        title: "The Future of Digital Trust",
        slug: "future-of-digital-trust",
        excerpt: "Exploring how blockchain and AI are redefining trust in the digital age.",
        status: "published",
        author: "John Doe",
        category: "Technology",
        publishedAt: "2024-03-15T10:00:00Z",
        views: 1250,
        coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1080",
        tags: ["blockchain", "ai", "trust"],
    },
    {
        id: "2",
        title: "Implementing Blockchain in Banking",
        slug: "blockchain-in-banking",
        excerpt: "A comprehensive guide to integrating blockchain solutions in financial institutions.",
        status: "published",
        author: "Sarah Smith",
        category: "Finance",
        publishedAt: "2024-03-10T09:30:00Z",
        views: 980,
        coverImage: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1080",
        tags: ["blockchain", "finance"],
    },
    {
        id: "3",
        title: "AI Trends for 2024",
        slug: "ai-trends-2024",
        excerpt: "What to expect in the rapidly evolving world of Artificial Intelligence this year.",
        status: "draft",
        author: "Mike Johnson",
        category: "Artificial Intelligence",
        publishedAt: null,
        views: 0,
        tags: ["ai", "trends"],
    },
    {
        id: "4",
        title: "Cybersecurity Best Practices",
        slug: "cybersecurity-best-practices",
        excerpt: "Essential security measures every organization should implement immediately.",
        status: "published",
        author: "Jane Wilson",
        category: "Security",
        publishedAt: "2024-02-28T14:15:00Z",
        views: 2100,
        coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1080",
        tags: ["security", "guide"],
    },
    {
        id: "5",
        title: "Digital Transformation Guide",
        slug: "digital-transformation-guide",
        excerpt: "Step-by-step roadmap for digitally transforming your legacy business.",
        status: "archived",
        author: "John Doe",
        category: "Business",
        publishedAt: "2023-12-01T11:00:00Z",
        views: 3500,
        coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1080",
        tags: ["digital", "business", "guide"],
    },
    {
        id: "6",
        title: "Cloud Migration Strategies",
        slug: "cloud-migration-strategies",
        excerpt: "How to move your infrastructure to the cloud without downtime.",
        status: "published",
        author: "Sarah Smith",
        category: "Technology",
        publishedAt: "2024-01-20T08:00:00Z",
        views: 1870,
        coverImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=1080",
        tags: ["cloud", "infrastructure"],
    },
    {
        id: "7",
        title: "Startup Funding Trends",
        slug: "startup-funding-trends",
        excerpt: "How the funding landscape is changing for tech startups in 2024.",
        status: "draft",
        author: "Jane Wilson",
        category: "Finance",
        publishedAt: null,
        views: 0,
        tags: ["startups", "funding"],
    },
    {
        id: "8",
        title: "Machine Learning for Beginners",
        slug: "machine-learning-beginners",
        excerpt: "A gentle introduction to machine learning concepts and practical applications.",
        status: "published",
        author: "Mike Johnson",
        category: "Artificial Intelligence",
        publishedAt: "2024-02-14T12:00:00Z",
        views: 4200,
        coverImage: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=1080",
        tags: ["ml", "tutorial", "ai"],
    },
];

const allCategories = ["Technology", "Finance", "Security", "Business", "Artificial Intelligence"];
const allAuthors = ["John Doe", "Sarah Smith", "Mike Johnson", "Jane Wilson"];

type ViewMode = "grid" | "table";
type SortOption = "newest" | "oldest" | "views-high" | "views-low" | "title-az" | "title-za";

export default function BlogPage() {
    const { success, error } = useToast();
    const [posts, setPosts] = React.useState<BlogPost[]>(initialPosts);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");

    // Enhanced filters
    const [categoryFilter, setCategoryFilter] = React.useState("all");
    const [authorFilter, setAuthorFilter] = React.useState("all");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);

    // View mode
    const [viewMode, setViewMode] = React.useState<ViewMode>("grid");

    // Bulk selection
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);

    // Filter logic
    const filteredPosts = React.useMemo(() => {
        let result = posts.filter((post) => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.slug.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === "all" || post.status === statusFilter;
            const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
            const matchesAuthor = authorFilter === "all" || post.author === authorFilter;

            let matchesDateRange = true;
            if (dateFrom && post.publishedAt) {
                matchesDateRange = new Date(post.publishedAt) >= new Date(dateFrom);
            }
            if (dateTo && post.publishedAt) {
                matchesDateRange = matchesDateRange && new Date(post.publishedAt) <= new Date(dateTo + "T23:59:59Z");
            }
            if ((dateFrom || dateTo) && !post.publishedAt) {
                matchesDateRange = false;
            }

            return matchesSearch && matchesStatus && matchesCategory && matchesAuthor && matchesDateRange;
        });

        // Sort
        result = [...result].sort((a, b) => {
            switch (sortOption) {
                case "newest":
                    return (b.publishedAt || "").localeCompare(a.publishedAt || "");
                case "oldest":
                    return (a.publishedAt || "").localeCompare(b.publishedAt || "");
                case "views-high":
                    return b.views - a.views;
                case "views-low":
                    return a.views - b.views;
                case "title-az":
                    return a.title.localeCompare(b.title);
                case "title-za":
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        return result;
    }, [posts, searchQuery, statusFilter, categoryFilter, authorFilter, dateFrom, dateTo, sortOption]);

    // Bulk selection helpers
    const isAllSelected = filteredPosts.length > 0 && filteredPosts.every((p) => selectedIds.has(p.id));
    const isSomeSelected = filteredPosts.some((p) => selectedIds.has(p.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredPosts.map((p) => p.id)));
        }
    };

    const toggleSelectPost = (id: string) => {
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

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    // Quick actions
    const handleQuickStatusToggle = (post: BlogPost) => {
        const newStatus = post.status === "published" ? "draft" : "published";
        setPosts((prev) =>
            prev.map((p) =>
                p.id === post.id
                    ? {
                        ...p,
                        status: newStatus as "draft" | "published",
                        publishedAt: newStatus === "published" ? new Date().toISOString() : null,
                    }
                    : p
            )
        );
        success(
            newStatus === "published" ? "Post published" : "Post unpublished",
            `"${post.title}" has been ${newStatus === "published" ? "published" : "moved to draft"}.`
        );
    };

    const handleDuplicate = (post: BlogPost) => {
        const duplicated: BlogPost = {
            ...post,
            id: `${post.id}-copy-${Date.now()}`,
            title: `${post.title} (Copy)`,
            slug: `${post.slug}-copy`,
            status: "draft",
            publishedAt: null,
            views: 0,
        };
        setPosts((prev) => [duplicated, ...prev]);
        success("Post duplicated", `"${post.title}" has been duplicated as a draft.`);
    };

    // Bulk action handler
    const handleBulkAction = async (action: BulkAction, payload?: string) => {
        setIsBulkLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));

            switch (action) {
                case "publish":
                    setPosts((prev) =>
                        prev.map((p) =>
                            selectedIds.has(p.id)
                                ? { ...p, status: "published" as const, publishedAt: new Date().toISOString() }
                                : p
                        )
                    );
                    success("Posts published", `${selectedIds.size} posts have been published.`);
                    break;

                case "unpublish":
                case "draft":
                    setPosts((prev) =>
                        prev.map((p) =>
                            selectedIds.has(p.id) ? { ...p, status: "draft" as const, publishedAt: null } : p
                        )
                    );
                    success("Posts moved to draft", `${selectedIds.size} posts have been moved to draft.`);
                    break;

                case "archive":
                    setPosts((prev) =>
                        prev.map((p) =>
                            selectedIds.has(p.id) ? { ...p, status: "archived" as const } : p
                        )
                    );
                    success("Posts archived", `${selectedIds.size} posts have been archived.`);
                    break;

                case "delete":
                    setPosts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
                    success("Posts deleted", `${selectedIds.size} posts have been deleted.`);
                    break;

                case "change-category":
                    if (payload) {
                        setPosts((prev) =>
                            prev.map((p) =>
                                selectedIds.has(p.id) ? { ...p, category: payload } : p
                            )
                        );
                        success("Category updated", `${selectedIds.size} posts moved to "${payload}".`);
                    }
                    break;

                case "add-tags":
                    if (payload) {
                        setPosts((prev) =>
                            prev.map((p) =>
                                selectedIds.has(p.id)
                                    ? { ...p, tags: [...new Set([...(p.tags || []), payload])] }
                                    : p
                            )
                        );
                        success("Tag added", `Tag "${payload}" added to ${selectedIds.size} posts.`);
                    }
                    break;
            }
            clearSelection();
        } catch {
            error("Error", "Failed to perform bulk action.");
        } finally {
            setIsBulkLoading(false);
        }
    };

    const handleDelete = (post: BlogPost) => {
        setSelectedPost(post);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPost) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setPosts((prev) => prev.filter((p) => p.id !== selectedPost.id));
            success("Post deleted", "The blog post has been deleted successfully.");
            setIsDeleteOpen(false);
            setSelectedPost(null);
        } catch {
            error("Error", "Failed to delete blog post.");
        } finally {
            setIsLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
        setCategoryFilter("all");
        setAuthorFilter("all");
        setDateFrom("");
        setDateTo("");
        setSortOption("newest");
    };

    const hasActiveFilters = statusFilter !== "all" || categoryFilter !== "all" || authorFilter !== "all" || dateFrom !== "" || dateTo !== "";

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
            draft: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
            archived: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Blog Posts"
                description="Manage your blog content and articles"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Blog" },
                ]}
                actions={
                    <Link href="/blog/new">
                        <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                            New Post
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

                {/* Search, Filters, and View Toggle */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search posts..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                                <SelectTrigger className="w-[140px]">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="views-high">Most Views</SelectItem>
                                    <SelectItem value="views-low">Least Views</SelectItem>
                                    <SelectItem value="title-az">Title A-Z</SelectItem>
                                    <SelectItem value="title-za">Title Z-A</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Advanced filters toggle */}
                            <Button
                                variant={showAdvancedFilters ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10"
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-1.5 h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                                        !
                                    </span>
                                )}
                            </Button>

                            {/* View toggle */}
                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-primary text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "table"
                                            ? "bg-primary text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                                    title="Table view"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced filters row */}
                    {showAdvancedFilters && (
                        <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Category</label>
                                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
                                        {allCategories.map((cat) => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Author</label>
                                <Select value={authorFilter} onValueChange={setAuthorFilter}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="All Authors" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Authors</SelectItem>
                                        {allAuthors.map((author) => (
                                            <SelectItem key={author} value={author}>{author}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date From</label>
                                <Input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date To</label>
                                <Input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-[160px]"
                                />
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-10"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Bulk select all header */}
                {filteredPosts.length > 0 && (
                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(el) => {
                                    if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                                }}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                            />
                            <span className="font-medium">
                                {isAllSelected ? "Deselect all" : "Select all"}
                            </span>
                        </label>
                        <span className="text-zinc-400">
                            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}
                        </span>
                        {selectedIds.size > 0 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                                {selectedIds.size} selected
                            </span>
                        )}
                    </div>
                )}

                {/* Content: Grid or Table */}
                {filteredPosts.length > 0 ? (
                    viewMode === "grid" ? (
                        /* Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredPosts.map((post) => (
                                <div key={post.id} className="group relative flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                                    {/* Checkbox */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(post.id)}
                                            onChange={() => toggleSelectPost(post.id)}
                                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary bg-white/80 backdrop-blur-sm cursor-pointer"
                                        />
                                    </div>

                                    {/* Cover Image */}
                                    <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                        {post.coverImage ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                <Eye className="h-8 w-8 opacity-50" />
                                            </div>
                                        )}

                                        <div className="absolute top-3 right-3">
                                            {getStatusBadge(post.status)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col space-y-3">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                <span className="text-primary">{post.category}</span>
                                                <span>&#8226;</span>
                                                <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Unpublished"}</span>
                                            </div>
                                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {post.tags && post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {post.tags.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="pt-4 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700">
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                                    <User className="h-3 w-3" />
                                                </div>
                                                <span>{post.author}</span>
                                                {post.views > 0 && (
                                                    <>
                                                        <span className="text-zinc-300 dark:text-zinc-600">&#8226;</span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-3 w-3" />
                                                            {post.views.toLocaleString()}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Link href={`/blog/${post.id}`} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleQuickStatusToggle(post)}>
                                                            {post.status === "published" ? (
                                                                <>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    Unpublish
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Check className="mr-2 h-4 w-4" />
                                                                    Publish
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(post)}>
                                                            <Copy className="mr-2 h-4 w-4" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a
                                                                href={`https://drkatangablog.com/blog/${post.slug}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                View on Site
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => handleDelete(post)}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Table View */
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                            <th className="w-10 px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={(el) => {
                                                        if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                                                    }}
                                                    onChange={toggleSelectAll}
                                                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                />
                                            </th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Title</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Author</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                                            <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Views</th>
                                            <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {filteredPosts.map((post) => (
                                            <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                <td className="w-10 px-4 py-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.has(post.id)}
                                                        onChange={() => toggleSelectPost(post.id)}
                                                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {post.coverImage && (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={post.coverImage}
                                                                alt=""
                                                                className="h-10 w-14 rounded object-cover flex-shrink-0 hidden sm:block"
                                                            />
                                                        )}
                                                        <div className="min-w-0">
                                                            <Link href={`/blog/${post.id}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                                {post.title}
                                                            </Link>
                                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">/{post.slug}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {getStatusBadge(post.status)}
                                                </td>
                                                <td className="px-4 py-3 hidden md:table-cell">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{post.category}</span>
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                                            <User className="h-3 w-3 text-zinc-500" />
                                                        </div>
                                                        <span className="text-sm text-zinc-600 dark:text-zinc-400">{post.author}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {post.publishedAt
                                                            ? new Date(post.publishedAt).toLocaleDateString()
                                                            : "---"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 hidden lg:table-cell">
                                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                        {post.views.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            onClick={() => handleQuickStatusToggle(post)}
                                                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                            title={post.status === "published" ? "Unpublish" : "Publish"}
                                                        >
                                                            {post.status === "published" ? (
                                                                <Eye className="h-4 w-4" />
                                                            ) : (
                                                                <Check className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                        <Link href={`/blog/${post.id}`} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleDuplicate(post)}>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Duplicate
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <a
                                                                        href={`https://drkatangablog.com/blog/${post.slug}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                    >
                                                                        <ExternalLink className="mr-2 h-4 w-4" />
                                                                        View on Site
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() => handleDelete(post)}
                                                                >
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete
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
                    )
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No posts found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            Try adjusting your search or filters to find what you are looking for.
                        </p>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters} className="mt-4 text-primary">
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.size}
                onAction={handleBulkAction}
                onClearSelection={clearSelection}
                isLoading={isBulkLoading}
            />

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Post"
                description="Are you sure you want to delete this blog post? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
