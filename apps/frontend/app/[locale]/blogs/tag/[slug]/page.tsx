import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ChevronRight,
    Calendar,
    Clock,
    ArrowRight,
    Hash,
    ArrowLeft,
} from "lucide-react";
import { fetchPosts, fetchTags } from "@/lib/blog-api";
import type { BlogPost, BlogCategory } from "@/types/blog";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";

// =============================================================================
// Types
// =============================================================================

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Helpers
// =============================================================================

/** Resolve accent color from backend category (may be `color` or `accentColor`). */
function getCategoryAccentColor(category: BlogCategory): string {
    return (category as any).accentColor || category.color || "#1E4DB7";
}

function getInitials(name: string): string {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
        return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const tags = await fetchTags();
    const tag = tags.find((t) => t.slug === slug);

    if (!tag) {
        return { title: "Tag Not Found | KTBlog" };
    }

    return {
        title: `#${tag.name} Articles | KTBlog`,
        description: `Browse all articles tagged with "${tag.name}" on the KTBlog. Explore expert insights and analysis.`,
        openGraph: {
            title: `#${tag.name} Articles | KTBlog`,
            description: `Browse all articles tagged with "${tag.name}" on the KTBlog.`,
            url: `https://drkatangablog.com/blogs/tag/${slug}`,
            type: "website",
        },
    };
}

// =============================================================================
// Constants
// =============================================================================

const POSTS_PER_PAGE = 9;

// =============================================================================
// Page Component
// =============================================================================

export default async function TagPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const [tags, postsResponse] = await Promise.all([
        fetchTags(),
        fetchPosts({ tagSlug: slug, status: "published" as any, limit: 20 }),
    ]);

    const tag = tags.find((t) => t.slug === slug);

    if (!tag) {
        notFound();
    }

    const posts = postsResponse.items;
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const paginatedPosts = posts.slice(0, POSTS_PER_PAGE);

    return (
        <>
            <JsonLd data={generateBreadcrumbSchema([
                { name: "Home", url: "/" },
                { name: "Blog", url: "/blogs" },
                { name: `#${tag.name}`, url: `/blogs/tag/${slug}` },
            ])} />

            <div className="min-h-screen bg-white dark:bg-neutral-950">
                {/* Hero Section */}
                <section className="relative py-20 md:py-28 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-950 overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-20 right-20 w-64 h-64 bg-[#1E4DB7]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-48 h-48 bg-[#F59A23]/5 rounded-full blur-3xl" />

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
                            <span className="font-medium text-neutral-900 dark:text-white">
                                #{tag.name}
                            </span>
                        </nav>

                        {/* Back link */}
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-[#1E4DB7] mb-6 transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-medium">Back to all articles</span>
                        </Link>

                        <div className="max-w-3xl">
                            {/* Tag badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20 flex items-center justify-center">
                                    <Hash className="h-6 w-6 text-[#1E4DB7]" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                                Articles tagged{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                                    #{tag.name}
                                </span>
                            </h1>

                            {/* Post count */}
                            <p className="text-lg text-neutral-600 dark:text-neutral-400">
                                <span className="font-bold text-neutral-900 dark:text-white">{posts.length}</span>{" "}
                                {posts.length === 1 ? "article" : "articles"} found with this tag
                            </p>
                        </div>
                    </div>
                </section>

                {/* Posts Grid */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        {posts.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                    <Hash className="h-10 w-10 text-neutral-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                                    No articles with this tag
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                                    We do not have any articles with this tag yet. Explore other tags or browse all articles.
                                </p>
                                <Link
                                    href="/blogs"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300"
                                >
                                    Browse All Articles
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="max-w-7xl mx-auto">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {paginatedPosts.map((post) => (
                                        <TagPostCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        {Array.from({ length: totalPages }, (_, i) => (
                                            <span
                                                key={i}
                                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                                                    i === 0
                                                        ? "bg-[#1E4DB7] text-white shadow-lg shadow-[#1E4DB7]/25"
                                                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                                }`}
                                            >
                                                {i + 1}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}

// =============================================================================
// Tag Post Card
// =============================================================================

function TagPostCard({ post }: { post: BlogPost }) {
    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "";

    const gradients = [
        "from-blue-500 via-blue-600 to-indigo-600",
        "from-orange-400 via-orange-500 to-red-500",
        "from-emerald-400 via-emerald-500 to-teal-600",
        "from-purple-500 via-purple-600 to-pink-500",
        "from-amber-400 via-orange-500 to-red-500",
    ];

    const categoryAccentColor = post.category
        ? getCategoryAccentColor(post.category)
        : "#1E4DB7";

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
                            style={{ backgroundColor: categoryAccentColor }}
                        >
                            {post.category.name}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[#1E4DB7] leading-tight">
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                    </p>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag.id}
                                className="inline-block px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-[10px] text-neutral-600 dark:text-neutral-400 font-medium"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
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
                    background: `linear-gradient(90deg, ${categoryAccentColor} 0%, #F59A23 100%)`,
                }}
            />
        </Link>
    );
}
