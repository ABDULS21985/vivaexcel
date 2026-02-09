"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@digibit/ui/components";
import { Plus, Eye, MoreHorizontal, Pencil, Trash, Search, Calendar, User, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@digibit/ui/components";

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
        // No cover image for draft
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
    },
];

export default function BlogPage() {
    const { success, error } = useToast();
    const [posts, setPosts] = React.useState<BlogPost[]>(initialPosts);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.slug.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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

                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search posts..."
                            className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Grid Layout */}
                {filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="group flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-300">
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
                                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-md ${post.status === "published"
                                                ? "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300"
                                                : post.status === "draft"
                                                    ? "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300"
                                                    : "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300"
                                            }`}>
                                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col space-y-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            <span className="text-primary">{post.category}</span>
                                            <span>•</span>
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

                                    {/* Footer */}
                                    <div className="pt-4 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                                <User className="h-3 w-3" />
                                            </div>
                                            <span>{post.author}</span>
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
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Live
                                                    </DropdownMenuItem>
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
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                            <Search className="h-6 w-6 text-zinc-400" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No posts found</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                )}
            </div>

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
