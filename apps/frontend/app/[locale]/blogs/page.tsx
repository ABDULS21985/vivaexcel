import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
    Newspaper,
    Mail,
    Send,
} from "lucide-react";
import { BlogListingEnhanced } from "@/components/blog";
import { CTASection, TrustIndicators } from "@/components/shared";
import { fetchPosts, fetchCategories, fetchFeaturedPosts } from "@/lib/blog-api";
import type { BlogPost, BlogCategory } from "@/types/blog";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
    title: "Blog & Insights | KTBlog",
    description:
        "Explore thought leadership, industry insights, and expert analysis on digital transformation, cybersecurity, AI, blockchain, and enterprise technology from KTBlog.",
    keywords: [
        "technology blog",
        "digital transformation insights",
        "cybersecurity articles",
        "AI thought leadership",
        "blockchain analysis",
        "enterprise technology",
        "IT consulting insights",
        "CBDC",
        "data analytics",
    ],
    openGraph: {
        title: "Blog & Insights | KTBlog",
        description:
            "Explore thought leadership, industry insights, and expert analysis on digital transformation, cybersecurity, AI, blockchain, and enterprise technology.",
        url: "https://drkatangablog.com/blogs",
        siteName: "KTBlog",
        type: "website",
        images: [
            {
                url: "https://drkatangablog.com/og-blog.jpg",
                width: 1200,
                height: 630,
                alt: "KTBlog Blog & Insights",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog & Insights | KTBlog",
        description:
            "Explore thought leadership and expert analysis on digital transformation, cybersecurity, AI, and blockchain.",
    },
};

// =============================================================================
// Types
// =============================================================================

type Props = {
    params: Promise<{ locale: string }>;
};

// =============================================================================
// Helper Functions
// =============================================================================

function getCategoryColor(slug: string): string {
    const colors: Record<string, string> = {
        technology: "#1E4DB7",
        "ai-data": "#7C3AED",
        cybersecurity: "#DC2626",
        blockchain: "#059669",
        "digital-transformation": "#F59A23",
        governance: "#0891B2",
        "industry-insights": "#9333EA",
        "case-studies": "#E86A1D",
    };
    return colors[slug] || "#1E4DB7";
}

// =============================================================================
// Page Component
// =============================================================================

export default async function BlogsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    // -------------------------------------------------------------------------
    // Fetch data from the backend API (server-side)
    // -------------------------------------------------------------------------
    let posts: BlogPost[] = [];
    let categories: BlogCategory[] = [];
    let featuredPost: BlogPost | null = null;
    let publishedCount = 0;
    let authorsCount = 0;

    try {
        const [postsResponse, categoriesData, featuredPosts] = await Promise.all([
            fetchPosts({ status: 'published' as any, limit: 50 }),
            fetchCategories(),
            fetchFeaturedPosts(1),
        ]);

        posts = postsResponse.items;
        categories = categoriesData.map((cat) => ({
            ...cat,
            color: cat.color || getCategoryColor(cat.slug),
        }));
        featuredPost = featuredPosts.length > 0 ? featuredPosts[0] : null;
        publishedCount = postsResponse.meta.total ?? posts.length;

        // Derive unique authors count from the posts data
        const uniqueAuthorIds = new Set(
            posts
                .map((p) => p.authorId)
                .filter(Boolean)
        );
        authorsCount = uniqueAuthorIds.size || 1;
    } catch (error) {
        // If the API fails, we still render the page with empty state.
        console.error("[BlogsPage] Failed to fetch blog data:", error);
    }

    return (
        <>
            <JsonLd data={generateBreadcrumbSchema([
                { name: "Home", url: "/" },
                { name: "Blog & Insights", url: "/blogs" },
            ])} />
            <div className="min-h-screen bg-white dark:bg-neutral-950">
                {/* Hero Section */}
                <section className="relative py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2B6B] overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#F59A23]/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
                        <div className="max-w-4xl mx-auto text-center">
                            {/* Badge */}
                            <div className="flex items-center justify-center gap-2 mb-6 animate-fade-in-up">
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
                                    <Newspaper className="h-4 w-4 text-[#F59A23]" />
                                    <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
                                        Blog & Insights
                                    </span>
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in-up">
                                Expert{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                                    Insights
                                </span>{" "}
                                & Analysis
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up">
                                Discover cutting-edge perspectives on technology trends, industry
                                insights, and digital transformation strategies from our team of experts.
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 animate-fade-in-up">
                                <div className="text-center">
                                    <p className="text-3xl md:text-4xl font-bold text-white">
                                        {publishedCount}
                                    </p>
                                    <p className="text-sm text-white/60">Articles</p>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-center">
                                    <p className="text-3xl md:text-4xl font-bold text-white">
                                        {categories.length}
                                    </p>
                                    <p className="text-sm text-white/60">Categories</p>
                                </div>
                                <div className="w-px h-10 bg-white/20" />
                                <div className="text-center">
                                    <p className="text-3xl md:text-4xl font-bold text-white">
                                        {authorsCount}
                                    </p>
                                    <p className="text-sm text-white/60">Expert Authors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Blog Content Section */}
                <section className="py-16 md:py-24 bg-gradient-to-b from-white via-neutral-50/30 to-white dark:from-neutral-950 dark:via-neutral-900/30 dark:to-neutral-950">
                    <div className="container mx-auto px-4 md:px-6 lg:px-8">
                        {/* Section Header */}
                        <div className="max-w-4xl mx-auto text-center mb-12">
                            <div className="flex items-center justify-center gap-3 mb-6">
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
                                <div className="flex items-center gap-2 px-4 py-2 bg-[#1E4DB7]/5 dark:bg-[#1E4DB7]/10 rounded-full">
                                    <Newspaper className="h-4 w-4 text-[#1E4DB7]" />
                                    <span className="text-xs font-bold tracking-wider text-[#1E4DB7] uppercase">
                                        Expert Insights
                                    </span>
                                </div>
                                <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
                                Explore Our{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E4DB7] to-[#143A8F]">
                                    Latest Articles
                                </span>
                            </h2>
                            <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl mx-auto">
                                Browse {publishedCount} articles across {categories.length} categories.
                                Use the filters below to find exactly what you are looking for.
                            </p>
                        </div>

                        {/* Enhanced Blog Listing with filters, search, pagination */}
                        <div className="max-w-7xl mx-auto">
                            <BlogListingEnhanced
                                posts={posts}
                                categories={categories}
                                featuredPost={featuredPost}
                            />
                        </div>
                    </div>
                </section>

                {/* Newsletter Section */}
                <section className="py-20 md:py-28 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#1E4DB7] relative overflow-hidden">
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
                            <div className="flex justify-center mb-8 animate-fade-in-up">
                                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                    <Mail className="h-10 w-10 text-white" />
                                </div>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 animate-fade-in-up">
                                Stay Ahead with{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F59A23] to-[#E86A1D]">
                                    Expert Insights
                                </span>
                            </h2>

                            <p className="text-lg md:text-xl text-white/80 mb-10 animate-fade-in-up">
                                Subscribe to our newsletter and receive the latest articles,
                                industry insights, and exclusive content directly in your inbox.
                            </p>

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
                                    className="px-8 py-4 bg-gradient-to-r from-[#F59A23] to-[#E86A1D] hover:from-[#E86A1D] hover:to-[#F59A23] text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#F59A23]/25 flex items-center justify-center gap-2"
                                >
                                    Subscribe
                                    <Send className="h-5 w-5" />
                                </button>
                            </form>

                            <p className="text-sm text-white/60 mt-6 animate-fade-in-up">
                                Join 5,000+ professionals. No spam, unsubscribe anytime.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Trust Indicators */}
                <TrustIndicators />

                {/* CTA Section */}
                <CTASection
                    title="Ready to Transform"
                    accentTitle="Your Business?"
                    description="Schedule a consultation with our experts to discuss how our products and services can accelerate your digital transformation journey."
                    primaryCTA={{
                        label: "Schedule Consultation",
                        href: "/contact",
                    }}
                    secondaryCTA={{
                        label: "View Our Services",
                        href: "/services",
                    }}
                />
            </div>
        </>
    );
}
