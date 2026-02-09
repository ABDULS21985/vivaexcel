"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Search,
    Calendar,
    Clock,
    ArrowRight,
    X,
    Sparkles,
    TrendingUp,
    ChevronRight,
} from "lucide-react";
import {
    blogPosts,
    blogCategories,
    blogAuthors,
    blogTags,
    getAllPublishedPosts,
    type BlogPostWithRelations,
} from "@/data/blog";

// =============================================================================
// Helper
// =============================================================================

function getInitials(name: string): string {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

// =============================================================================
// Search Page Component
// =============================================================================

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const allPosts = useMemo(() => getAllPublishedPosts(), []);

    // Auto-focus search input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Real-time search filtering
    const filteredPosts = useMemo(() => {
        if (!query.trim()) return [];

        const searchTerms = query.toLowerCase().split(" ").filter(Boolean);

        return allPosts.filter((post) => {
            const searchableText = [
                post.title,
                post.excerpt,
                post.author?.name,
                post.category?.name,
                post.tags?.map((t) => t.name).join(" "),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchTerms.every((term) => searchableText.includes(term));
        });
    }, [query, allPosts]);

    // Suggested searches
    const suggestedSearches = [
        "CBDC",
        "Cybersecurity",
        "AI",
        "Digital Transformation",
        "Cloud",
        "Blockchain",
    ];

    // Popular tags
    const popularTags = blogTags.slice(0, 12);

    const hasQuery = query.trim().length > 0;
    const hasResults = filteredPosts.length > 0;

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950">
            {/* Search Hero */}
            <section className="relative py-16 md:py-24 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-20 right-20 w-64 h-64 bg-[#1E4DB7]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-48 h-48 bg-[#F59A23]/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                        <Link href="/" className="hover:text-[#1E4DB7] transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href="/blogs" className="hover:text-[#1E4DB7] transition-colors">
                            Blog
                        </Link>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-neutral-900 dark:text-white">Search</span>
                    </nav>

                    <div className="max-w-3xl mx-auto text-center">
                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                            Search{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                                Articles
                            </span>
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10">
                            Find articles by title, topic, category, tag, or author name
                        </p>

                        {/* Search Input */}
                        <div className="relative max-w-2xl mx-auto group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#1E4DB7]/20 to-[#F59A23]/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                            <div className="relative flex items-center">
                                <Search className="absolute left-5 h-5 w-5 text-neutral-400 dark:text-neutral-500" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search articles..."
                                    className="w-full pl-14 pr-14 py-4 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-2xl text-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-[#1E4DB7] dark:focus:border-[#1E4DB7] transition-all duration-300 shadow-lg"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery("")}
                                        className="absolute right-5 p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-neutral-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Result count */}
                        {hasQuery && (
                            <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
                                {filteredPosts.length}{" "}
                                {filteredPosts.length === 1 ? "result" : "results"} found
                                {query && (
                                    <> for &ldquo;<span className="font-semibold text-neutral-900 dark:text-white">{query}</span>&rdquo;</>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* Results / Suggestions */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        {/* No query - show suggestions */}
                        {!hasQuery && (
                            <div className="max-w-3xl mx-auto">
                                {/* Suggested searches */}
                                <div className="mb-10">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white mb-4">
                                        <TrendingUp className="h-5 w-5 text-[#F59A23]" />
                                        Suggested Searches
                                    </h2>
                                    <div className="flex flex-wrap gap-3">
                                        {suggestedSearches.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => setQuery(term)}
                                                className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-[#1E4DB7]/10 hover:text-[#1E4DB7] dark:hover:bg-[#1E4DB7]/20 dark:hover:text-[#1E4DB7] transition-all duration-300 border border-neutral-200 dark:border-neutral-700"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Browse by category */}
                                <div className="mb-10">
                                    <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900 dark:text-white mb-4">
                                        <Sparkles className="h-5 w-5 text-[#1E4DB7]" />
                                        Browse by Category
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {blogCategories.map((cat) => (
                                            <Link
                                                key={cat.id}
                                                href={`/blogs/category/${cat.slug}`}
                                                className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl hover:border-[#1E4DB7] dark:hover:border-[#1E4DB7] hover:shadow-lg transition-all duration-300 group"
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: cat.accentColor }}
                                                />
                                                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-[#1E4DB7] transition-colors">
                                                    {cat.name}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {/* Popular tags */}
                                <div>
                                    <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4">
                                        Popular Tags
                                    </h2>
                                    <div className="flex flex-wrap gap-2">
                                        {popularTags.map((tag) => (
                                            <Link
                                                key={tag.id}
                                                href={`/blogs/tag/${tag.slug}`}
                                                className="px-3 py-1.5 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 text-[#1E4DB7] text-sm font-medium rounded-full hover:bg-[#1E4DB7]/10 dark:hover:bg-[#1E4DB7]/20 transition-colors"
                                            >
                                                #{tag.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Has query but no results */}
                        {hasQuery && !hasResults && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <Search className="h-10 w-10 text-neutral-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                                    No results found
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
                                    We could not find any articles matching &ldquo;{query}&rdquo;.
                                    Try different keywords or browse our suggestions below.
                                </p>

                                {/* Suggestions */}
                                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Try:
                                    </span>
                                    {suggestedSearches.slice(0, 4).map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-4 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-medium hover:bg-[#1E4DB7]/10 hover:text-[#1E4DB7] transition-all"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>

                                <Link
                                    href="/blogs"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300"
                                >
                                    Browse All Articles
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}

                        {/* Results grid */}
                        {hasQuery && hasResults && (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredPosts.map((post) => (
                                    <SearchResultCard key={post.id} post={post} query={query} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

// =============================================================================
// Search Result Card
// =============================================================================

function SearchResultCard({
    post,
    query,
}: {
    post: BlogPostWithRelations;
    query: string;
}) {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    const gradients = [
        "from-blue-500 via-blue-600 to-indigo-600",
        "from-orange-400 via-orange-500 to-red-500",
        "from-emerald-400 via-emerald-500 to-teal-600",
        "from-purple-500 via-purple-600 to-pink-500",
        "from-amber-400 via-orange-500 to-red-500",
    ];

    // Highlight matching text in title
    const highlightText = (text: string) => {
        if (!query.trim()) return text;
        const terms = query.toLowerCase().split(" ").filter(Boolean);
        let highlighted = text;
        terms.forEach((term) => {
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
            highlighted = highlighted.replace(regex, '<mark class="bg-[#F59A23]/20 text-[#1E4DB7] font-semibold rounded px-0.5">$1</mark>');
        });
        return highlighted;
    };

    return (
        <Link
            href={`/blogs/${post.slug}`}
            className="group relative block bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500"
        >
            {/* Image */}
            <div className="relative h-48 sm:h-52 overflow-hidden">
                {post.featuredImage ? (
                    <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                        <span className="text-neutral-300 dark:text-neutral-600 text-6xl font-bold">
                            {post.title.charAt(0)}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {post.category && (
                    <div className="absolute top-4 left-4">
                        <span
                            className="inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                            style={{ backgroundColor: post.category.accentColor }}
                        >
                            {post.category.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3
                    className="text-lg font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[#1E4DB7] leading-tight"
                    dangerouslySetInnerHTML={{ __html: highlightText(post.title) }}
                />

                {post.excerpt && (
                    <p
                        className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlightText(post.excerpt) }}
                    />
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    {post.author && (
                        <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradients[post.author.name.length % gradients.length]} flex items-center justify-center text-white text-xs font-bold shadow-lg ring-2 ring-white dark:ring-neutral-900 relative overflow-hidden`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                                <span className="relative drop-shadow-sm">
                                    {getInitials(post.author.name)}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                {post.author.name}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formattedDate}
                        </span>
                        {post.readingTime && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime}m
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom accent */}
            <div
                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                style={{
                    background: `linear-gradient(90deg, ${post.category?.accentColor || "#1E4DB7"} 0%, #F59A23 100%)`,
                }}
            />
        </Link>
    );
}
