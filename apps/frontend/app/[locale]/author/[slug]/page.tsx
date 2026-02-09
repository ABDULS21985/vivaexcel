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
    ArrowLeft,
    Twitter,
    Linkedin,
    Mail,
    Newspaper,
    User,
} from "lucide-react";
import {
    blogAuthors,
    getBlogAuthorBySlug,
    getBlogPostsByAuthor,
    type BlogPostWithRelations,
    type BlogAuthor,
} from "@/data/blog";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";

// =============================================================================
// Types
// =============================================================================

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Static Params
// =============================================================================

export async function generateStaticParams() {
    return blogAuthors.map((author) => ({
        slug: author.slug,
    }));
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const author = getBlogAuthorBySlug(slug);

    if (!author) {
        return { title: "Author Not Found | KTBlog" };
    }

    return {
        title: `${author.name} - Author | KTBlog`,
        description: author.bio,
        openGraph: {
            title: `${author.name} - Author | KTBlog`,
            description: author.bio,
            url: `https://drkatangablog.com/author/${slug}`,
            type: "profile",
        },
    };
}

// =============================================================================
// Constants
// =============================================================================

const POSTS_PER_PAGE = 9;

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
// Page Component
// =============================================================================

export default async function AuthorPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const author = getBlogAuthorBySlug(slug);

    if (!author) {
        notFound();
    }

    const posts = getBlogPostsByAuthor(slug);
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const paginatedPosts = posts.slice(0, POSTS_PER_PAGE);

    const gradients = [
        "from-blue-500 via-blue-600 to-indigo-600",
        "from-orange-400 via-orange-500 to-red-500",
        "from-emerald-400 via-emerald-500 to-teal-600",
        "from-purple-500 via-purple-600 to-pink-500",
        "from-amber-400 via-orange-500 to-red-500",
    ];
    const gradient = gradients[author.name.length % gradients.length];

    return (
        <>
            <JsonLd data={generateBreadcrumbSchema([
                { name: "Home", url: "/" },
                { name: "Blog", url: "/blogs" },
                { name: author.name, url: `/author/${slug}` },
            ])} />

            {/* Author Schema */}
            <JsonLd data={{
                "@context": "https://schema.org",
                "@type": "Person",
                name: author.name,
                jobTitle: author.role,
                description: author.bio,
                url: `https://drkatangablog.com/author/${slug}`,
                sameAs: [
                    author.socialLinks?.linkedin,
                    author.socialLinks?.twitter,
                ].filter(Boolean),
            }} />

            <div className="min-h-screen bg-white dark:bg-neutral-950">
                {/* Author Hero Section */}
                <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7]/5 via-white to-[#F59A23]/5 dark:from-neutral-900 dark:via-neutral-950 dark:to-neutral-900 overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E4DB7]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F59A23]/5 rounded-full blur-3xl" />

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
                                {author.name}
                            </span>
                        </nav>

                        {/* Back link */}
                        <Link
                            href="/blogs"
                            className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-400 hover:text-[#1E4DB7] mb-10 transition-colors group"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="text-sm font-medium">Back to all articles</span>
                        </Link>

                        {/* Author card */}
                        <div className="max-w-4xl">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                {/* Large Avatar */}
                                <div className="flex-shrink-0">
                                    <div className={`w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-3xl md:text-4xl shadow-xl ring-4 ring-white dark:ring-neutral-900 relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
                                        <span className="relative drop-shadow-sm">
                                            {getInitials(author.name)}
                                        </span>
                                    </div>
                                </div>

                                {/* Author Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <User className="h-4 w-4 text-[#F59A23]" />
                                        <span className="text-sm font-bold text-[#F59A23] uppercase tracking-wider">
                                            Author
                                        </span>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                                        {author.name}
                                    </h1>

                                    <p className="text-lg font-semibold text-[#1E4DB7] mb-4">
                                        {author.role}
                                    </p>

                                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 max-w-2xl">
                                        {author.bio}
                                    </p>

                                    {/* Stats & Social */}
                                    <div className="flex flex-wrap items-center gap-4">
                                        {/* Article count */}
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
                                            <Newspaper className="h-4 w-4 text-[#1E4DB7]" />
                                            <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                                                {posts.length}
                                            </span>
                                            <span className="text-sm text-neutral-500 dark:text-neutral-400">
                                                {posts.length === 1 ? "article" : "articles"}
                                            </span>
                                        </div>

                                        {/* Social links */}
                                        {author.socialLinks?.twitter && (
                                            <a
                                                href={author.socialLinks.twitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-[#1DA1F2] hover:text-white text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-300 border border-neutral-200 dark:border-neutral-700"
                                                title="Twitter"
                                            >
                                                <Twitter className="h-4 w-4" />
                                            </a>
                                        )}
                                        {author.socialLinks?.linkedin && (
                                            <a
                                                href={author.socialLinks.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-[#0A66C2] hover:text-white text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-300 border border-neutral-200 dark:border-neutral-700"
                                                title="LinkedIn"
                                            >
                                                <Linkedin className="h-4 w-4" />
                                            </a>
                                        )}
                                        {author.socialLinks?.email && (
                                            <a
                                                href={`mailto:${author.socialLinks.email}`}
                                                className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-[#F59A23] hover:text-white text-neutral-600 dark:text-neutral-400 flex items-center justify-center transition-all duration-300 border border-neutral-200 dark:border-neutral-700"
                                                title="Email"
                                            >
                                                <Mail className="h-4 w-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Author's Posts */}
                <section className="py-16 md:py-20">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Section heading */}
                            <div className="mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                                    Articles by{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                                        {author.name}
                                    </span>
                                </h2>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                                        <Newspaper className="h-10 w-10 text-neutral-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
                                        No articles published yet
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                        This author has not published any articles yet. Check back soon.
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
                                <>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {paginatedPosts.map((post) => (
                                            <AuthorPostCard key={post.id} post={post} />
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
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}

// =============================================================================
// Author Post Card
// =============================================================================

function AuthorPostCard({ post }: { post: BlogPostWithRelations }) {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

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
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 transition-colors duration-300 group-hover:text-[#1E4DB7] leading-tight">
                    {post.title}
                </h3>

                {post.excerpt && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-2">
                        {post.excerpt}
                    </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formattedDate}
                        </span>
                        {post.readingTime && (
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readingTime} min read
                            </span>
                        )}
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1E4DB7] group-hover:text-[#F59A23] transition-colors">
                        Read
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
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
