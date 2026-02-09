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
    BookmarkButton,
    ReadingTracker,
} from "@/components/blog";
import { CommentSection } from "@/components/blog/comments";
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
import {
    generateBreadcrumbSchema,
    generateArticleSchema as generateArticleSchemaLib,
} from "@/lib/schema";

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
            title: "Blog Post Not Found | KTBlog",
        };
    }

    const postUrl = `https://drkatangablog.com/blogs/${slug}`;

    // Dynamic OG image URL with post metadata
    const ogImageUrl = `/api/og?${new URLSearchParams({
        title: post.title,
        author: post.author.name,
        category: post.category.name,
        date: new Date(post.publishedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        type: "post",
    }).toString()}`;

    return {
        title: `${post.title} | KTBlog`,
        description: post.excerpt,
        keywords: [
            post.category.name.toLowerCase(),
            ...post.tags.map((tag) => tag.name.toLowerCase()),
            "blog",
            "insights",
            "ktblog",
        ],
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: postUrl,
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                    type: "image/png",
                },
            ],
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
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        alternates: {
            canonical: postUrl,
        },
    };
}

// =============================================================================
// Article JSON-LD Schema — uses the enhanced generator from lib/schema.ts
// =============================================================================

function generateArticleSchema(post: BlogPostWithRelations) {
    return generateArticleSchemaLib({
        title: post.title,
        excerpt: post.excerpt,
        featuredImage: post.featuredImage,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        slug: post.slug,
        content: post.content,
        author: {
            name: post.author.name,
            role: post.author.role,
            slug: post.author.slug,
            avatar: post.author.avatar,
        },
        category: { name: post.category.name },
        tags: post.tags.map((t) => ({ name: t.name })),
        viewsCount: post.viewsCount,
    });
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
    const shareUrl = `https://drkatangablog.com/blogs/${slug}`;

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

                {/* Reading Tracker - tracks reading progress for authenticated users */}
                <ReadingTracker postId={post.id} threshold={0.8} />

                {/* Sticky Share Bar - Left side on desktop, bottom on mobile */}
                <StickyShareBar
                    url={shareUrl}
                    title={post.title}
                    description={post.excerpt}
                    showAfter={500}
                />

                {/* Bookmark Button - Fixed on the right side */}
                <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
                    <BookmarkButton postId={post.id} size="lg" variant="default" />
                </div>

                {/* Parallax Hero Section */}
                <ParallaxHero post={post as BlogPostWithRelations} locale={locale} />

                {/* Main Article Content with TOC Sidebar */}
                <BlogArticleClient
                    post={post as BlogPostWithRelations}
                    relatedPosts={relatedPosts as BlogPostWithRelations[]}
                />

                {/* Comments Section */}
                <CommentSection postId={post.id} slug={post.slug} />

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
