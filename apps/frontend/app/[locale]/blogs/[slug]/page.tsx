import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Mail } from "lucide-react";
import { CTASection } from "@/components/shared";
import {
    ParallaxHero,
    ReadingProgress,
    StickyShareBar,
    BlogArticleClient,
} from "@/components/blog";
import {
    blogPosts,
    blogCategories,
    blogTags,
    getPostBySlug,
    getRelatedPosts,
    type BlogPostWithRelations,
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
    const slugParams = blogPosts.map((post) => ({
        slug: post.slug,
    }));

    return slugParams;
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        return {
            title: "Blog Post Not Found | VivaExcel Blog",
        };
    }

    const postUrl = `https://vivaexcel.com/blogs/${slug}`;

    return {
        title: `${post.title} | VivaExcel Blog`,
        description: post.excerpt,
        keywords: [
            post.category.name.toLowerCase(),
            ...post.tags.map((tag) => tag.name.toLowerCase()),
            "blog",
            "insights",
            "vivaexcel",
        ],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: postUrl,
            images: post.featuredImage
                ? [{ url: post.featuredImage, width: 1200, height: 630, alt: post.title }]
                : undefined,
            type: "article",
            publishedTime: post.publishedAt,
            modifiedTime: post.updatedAt,
            authors: [post.author.name],
            section: post.category.name,
            tags: post.tags.map((t) => t.name),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt,
            images: post.featuredImage ? [post.featuredImage] : undefined,
        },
        alternates: {
            canonical: postUrl,
        },
    };
}

// =============================================================================
// Article JSON-LD Schema
// =============================================================================

function generateArticleSchema(post: BlogPostWithRelations) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        image: post.featuredImage,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt,
        author: {
            "@type": "Person",
            name: post.author.name,
            jobTitle: post.author.role,
        },
        publisher: {
            "@type": "Organization",
            name: "VivaExcel",
            logo: {
                "@type": "ImageObject",
                url: "https://vivaexcel.com/logo/vivaexcel.png",
            },
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://vivaexcel.com/blogs/${post.slug}`,
        },
        articleSection: post.category.name,
        keywords: post.tags.map((t) => t.name).join(", "),
        wordCount: post.content?.split(/\s+/).length || 0,
    };
}

// =============================================================================
// Page Component
// =============================================================================

export default async function BlogDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = getRelatedPosts(post.slug, 3);
    const shareUrl = `https://vivaexcel.com/blogs/${slug}`;

    return (
        <>
            {/* Structured Data */}
            <JsonLd data={generateBreadcrumbSchema([
                { name: "Home", url: "/" },
                { name: "Blog", url: "/blogs" },
                { name: post.category.name, url: `/blogs/category/${post.category.slug}` },
                { name: post.title, url: `/blogs/${post.slug}` },
            ])} />
            <JsonLd data={generateArticleSchema(post)} />

            <div className="min-h-screen bg-white dark:bg-neutral-950">
                {/* Reading Progress Bar - Fixed at top */}
                <ReadingProgress height={3} showPercentage={false} />

                {/* Sticky Share Bar - Left side on desktop, bottom on mobile */}
                <StickyShareBar
                    url={shareUrl}
                    title={post.title}
                    description={post.excerpt}
                    showAfter={500}
                />

                {/* Parallax Hero Section */}
                <ParallaxHero post={post as BlogPostWithRelations} locale={locale} />

                {/* Main Article Content with TOC Sidebar */}
                <BlogArticleClient
                    post={post as BlogPostWithRelations}
                    relatedPosts={relatedPosts as BlogPostWithRelations[]}
                />

                {/* Comments Section Placeholder */}
                <section className="w-full py-16 md:py-20 bg-neutral-50 dark:bg-neutral-900/50">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="max-w-3xl mx-auto">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3">
                                    Join the Discussion
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400">
                                    Share your thoughts and insights about this article
                                </p>
                            </div>

                            {/* Comment Form */}
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg p-6 md:p-8">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="comment-name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Name
                                            </label>
                                            <input
                                                id="comment-name"
                                                type="text"
                                                placeholder="Your name"
                                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="comment-email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                                Email
                                            </label>
                                            <input
                                                id="comment-email"
                                                type="email"
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="comment-body" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                                            Comment
                                        </label>
                                        <textarea
                                            id="comment-body"
                                            rows={4}
                                            placeholder="Share your thoughts..."
                                            className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#1E4DB7]/30 focus:border-[#1E4DB7] transition-all resize-none"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                            Comments are moderated before publishing.
                                        </p>
                                        <button
                                            type="button"
                                            className="px-6 py-2.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#1E4DB7]/25"
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </div>

                                {/* Coming soon notice */}
                                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                        Full commenting system coming soon. Stay tuned for real-time discussions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Newsletter CTA Section */}
                <section className="w-full py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#1E4DB7] relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                        <div className="max-w-3xl mx-auto text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-8">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center animate-fade-in-up">
                                    <Mail className="h-10 w-10 text-white" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in-up">
                                Stay Ahead with{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                                    Expert Insights
                                </span>
                            </h2>

                            {/* Description */}
                            <p className="text-lg md:text-xl text-white/80 mb-10 animate-fade-in-up">
                                Subscribe to our newsletter and receive the latest articles,
                                industry insights, and exclusive content directly in your inbox.
                            </p>

                            {/* Newsletter Form */}
                            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto animate-fade-in-up">
                                <div className="flex-1 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#F59A23]/20 to-[#E86A1D]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="relative w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-white/50 focus:outline-none focus:border-[#F59A23]/50 focus:bg-white/15 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#F59A23]/25"
                                >
                                    Subscribe
                                </button>
                            </form>

                            {/* Trust Message */}
                            <p className="text-sm text-white/60 mt-6 animate-fade-in-up">
                                Join 5,000+ professionals. No spam, unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <CTASection
                    title="Have Questions?"
                    accentTitle="Let's Talk"
                    description="Our team of experts is ready to help you navigate the complexities of digital transformation."
                    primaryCTA={{
                        label: "Contact Us",
                        href: "/contact",
                    }}
                    secondaryCTA={{
                        label: "Our Services",
                        href: "/services",
                    }}
                    showContactOptions={true}
                />
            </div>
        </>
    );
}
