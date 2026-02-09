import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
    ParallaxHero,
    ReadingProgress,
    StickyShareBar,
    BlogArticleClient,
    BookmarkButton,
    ReadingTracker,
} from "@/components/blog";
import { CommentSection } from "@/components/blog/comments";
import type { BlogPostWithRelations } from "@/data/blog";
import { fetchPostBySlug, fetchPosts } from "@/lib/blog-api";
import type { BlogPost } from "@/types/blog";
import { JsonLd } from "@/components/shared/json-ld";
import {
    generateBreadcrumbSchema,
    generateArticleSchema as generateArticleSchemaLib,
} from "@/lib/schema";
import { NewsletterSection } from "./newsletter-section";

// =============================================================================
// Types
// =============================================================================

type Props = {
    params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Helpers
// =============================================================================

function authorSlugFromName(name: string): string {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
}

// =============================================================================
// Static Params — disabled for on-demand ISR
// =============================================================================

export async function generateStaticParams() {
    return [];
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await fetchPostBySlug(slug);

    if (!post) {
        return {
            title: "Blog Post Not Found | KTBlog",
        };
    }

    const postUrl = `https://drkatangablog.com/blogs/${slug}`;

    const ogImageUrl = `/api/og?${new URLSearchParams({
        title: post.title,
        author: post.author?.name ?? "KTBlog",
        category: post.category?.name ?? "Blog",
        date: post.publishedAt
            ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
              })
            : "",
        type: "post",
    }).toString()}`;

    return {
        title: `${post.title} | KTBlog`,
        description: post.excerpt ?? "",
        keywords: [
            ...(post.category?.name ? [post.category.name.toLowerCase()] : []),
            ...(post.tags?.map((tag) => tag.name.toLowerCase()) ?? []),
            "blog",
            "insights",
            "ktblog",
        ],
        openGraph: {
            title: post.title,
            description: post.excerpt ?? "",
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
            publishedTime: post.publishedAt ?? undefined,
            modifiedTime: post.updatedAt ?? undefined,
            authors: post.author?.name ? [post.author.name] : [],
            section: post.category?.name ?? undefined,
            tags: post.tags?.map((t) => t.name) ?? [],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt ?? "",
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
// Article JSON-LD Schema
// =============================================================================

function generateArticleSchema(post: BlogPost) {
    return generateArticleSchemaLib({
        title: post.title,
        excerpt: post.excerpt ?? "",
        featuredImage: post.featuredImage ?? "",
        publishedAt: post.publishedAt ?? "",
        updatedAt: post.updatedAt ?? "",
        slug: post.slug,
        content: post.content ?? undefined,
        author: {
            name: post.author?.name ?? "KTBlog",
            role: post.author?.role ?? "Author",
            slug: post.author?.name
                ? authorSlugFromName(post.author.name)
                : undefined,
            avatar: post.author?.avatar ?? undefined,
        },
        category: { name: post.category?.name ?? "Blog" },
        tags: post.tags?.map((t) => ({ name: t.name })) ?? [],
        viewsCount: post.viewsCount,
    });
}

// =============================================================================
// Page Component
// =============================================================================

export default async function BlogDetailPage({ params }: Props) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const post = await fetchPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Fetch related posts by category (excluding the current post)
    const relatedResponse = post.category?.slug
        ? await fetchPosts({
              categorySlug: post.category.slug,
              limit: 4,
              status: "published" as any,
          })
        : { items: [] };
    const relatedPosts = relatedResponse.items.filter(
        (p) => p.slug !== post.slug,
    ).slice(0, 3);

    // Fetch adjacent posts for prev/next navigation
    const allPostsResponse = await fetchPosts({
        limit: 50,
        status: "published" as any,
        sortBy: "publishedAt",
        sortOrder: "DESC",
    });

    const currentIndex = allPostsResponse.items.findIndex(
        (p) => p.slug === post.slug,
    );
    const adjacentPosts = {
        previous:
            currentIndex > 0
                ? {
                      slug: allPostsResponse.items[currentIndex - 1].slug,
                      title: allPostsResponse.items[currentIndex - 1].title,
                  }
                : null,
        next:
            currentIndex < allPostsResponse.items.length - 1 &&
            currentIndex !== -1
                ? {
                      slug: allPostsResponse.items[currentIndex + 1].slug,
                      title: allPostsResponse.items[currentIndex + 1].title,
                  }
                : null,
    };

    const shareUrl = `https://drkatangablog.com/blogs/${slug}`;

    return (
        <>
            {/* Structured Data */}
            <JsonLd
                data={generateBreadcrumbSchema([
                    { name: "Home", url: "/" },
                    { name: "Blog", url: "/blogs" },
                    {
                        name: post.category?.name ?? "Blog",
                        url: `/blogs/category/${post.category?.slug ?? ""}`,
                    },
                    { name: post.title, url: `/blogs/${post.slug}` },
                ])}
            />
            <JsonLd data={generateArticleSchema(post)} />

            <div className="min-h-screen bg-white dark:bg-neutral-950">
                {/* Reading Progress Bar */}
                <ReadingProgress height={3} showPercentage={false} />

                {/* Reading Tracker */}
                <ReadingTracker postId={post.id} threshold={0.8} />

                {/* Sticky Share Bar */}
                <StickyShareBar
                    url={shareUrl}
                    title={post.title}
                    description={post.excerpt ?? ""}
                    showAfter={500}
                />

                {/* Bookmark Button - Fixed on the right side */}
                <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
                    <BookmarkButton
                        postId={post.id}
                        size="lg"
                        variant="default"
                    />
                </div>

                {/* Parallax Hero Section */}
                <ParallaxHero
                    post={post as unknown as BlogPostWithRelations}
                    locale={locale}
                />

                {/* Main Article Content with TOC Sidebar */}
                <BlogArticleClient
                    post={post as unknown as BlogPostWithRelations}
                    relatedPosts={
                        relatedPosts as unknown as BlogPostWithRelations[]
                    }
                    adjacentPosts={adjacentPosts}
                />

                {/* Comments Section */}
                <CommentSection postId={post.id} slug={post.slug} />

                {/* Newsletter CTA Section */}
                <NewsletterSection />

                {/* Final CTA */}
                <section className="w-full py-20 md:py-28 bg-white dark:bg-neutral-950">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#1E4DB7]" />
                                <span className="text-sm font-bold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                                    Get in Touch
                                </span>
                                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#1E4DB7]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                                Have{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#F59A23]">
                                    Questions?
                                </span>
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto">
                                Our team of experts is ready to help you
                                navigate the complexities of digital
                                transformation.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] hover:from-[#143A8F] hover:to-[#1E4DB7] text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1E4DB7]/25"
                                >
                                    Contact Us
                                </a>
                                <a
                                    href="/blogs"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold rounded-xl transition-all duration-300"
                                >
                                    Explore More Articles
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
