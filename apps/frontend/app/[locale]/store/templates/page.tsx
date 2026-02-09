import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Zap,
  Shield,
  ArrowRight,
  Code2,
  Layers,
  ExternalLink,
  Rocket,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import {
  fetchTemplates,
  fetchTemplateCategories,
  fetchFeaturedTemplates,
} from "@/lib/template-api";
import { TemplatesHeroClient } from "@/components/templates/templates-hero-client";
import { TemplateListingClient } from "@/components/templates/template-listing-client";
import { FrameworkBadge } from "@/components/templates/framework-badge";
import {
  Framework,
  FRAMEWORK_LABELS,
  FRAMEWORK_COLORS,
  TEMPLATE_TYPE_LABELS,
  TEMPLATE_TYPE_COLORS,
} from "@/types/web-template";
import type { WebTemplate } from "@/types/web-template";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/routing";

// =============================================================================
// Static Params
// =============================================================================

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: "Premium Web Templates & Starter Kits | KTBlog Store",
  description:
    "Browse premium website templates, SaaS boilerplates, landing page kits, and startup toolkits. Built with Next.js, React, Vue, Svelte, Astro, and more. Instant setup, TypeScript ready.",
  keywords: [
    "web templates",
    "starter kits",
    "SaaS boilerplate",
    "Next.js templates",
    "React templates",
    "landing page templates",
    "admin dashboard templates",
    "ecommerce themes",
    "Tailwind CSS templates",
  ],
  openGraph: {
    title: "Premium Web Templates & Starter Kits | KTBlog Store",
    description:
      "Browse premium website templates, SaaS boilerplates, landing page kits, and startup toolkits.",
    url: "https://drkatangablog.com/store/templates",
    siteName: "KTBlog",
    type: "website",
    images: [
      {
        url: "https://drkatangablog.com/api/og?title=Web+Templates+%26+Starter+Kits&type=default",
        width: 1200,
        height: 630,
        alt: "KTBlog Web Templates Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Web Templates & Starter Kits | KTBlog Store",
    description:
      "Browse premium website templates, SaaS boilerplates, landing page kits, and startup toolkits.",
  },
};

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string }>;
};

// =============================================================================
// Helper: Featured Template Card (server-rendered)
// =============================================================================

function FeaturedTemplateCard({ template }: { template: WebTemplate }) {
  const typeColor =
    TEMPLATE_TYPE_COLORS[template.templateType] || "#1E4DB7";
  const discount =
    template.compareAtPrice && template.compareAtPrice > template.price
      ? Math.round((1 - template.price / template.compareAtPrice) * 100)
      : null;

  return (
    <Link
      href={`/store/templates/${template.slug}`}
      className="group card-interactive relative flex-shrink-0 w-[340px] md:w-[420px] lg:w-[480px] overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-700">
        {template.featuredImage ? (
          <img
            src={template.featuredImage}
            alt={template.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Layers className="h-16 w-16 text-neutral-300 dark:text-neutral-600" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
          {template.demoUrl && (
            <span className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-xl">
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </span>
          )}
        </div>

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <span
            className="rounded-lg px-2.5 py-1 text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: typeColor }}
          >
            {TEMPLATE_TYPE_LABELS[template.templateType]}
          </span>
        </div>

        {/* Top-right badges */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {discount && (
            <span className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discount}%
            </span>
          )}
          {template.isFeatured && (
            <span className="flex items-center gap-1 rounded-lg bg-[#F59A23] px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              Featured
            </span>
          )}
        </div>

        {/* Bottom-left: framework badge + feature count */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <FrameworkBadge framework={template.framework} size="sm" />
          {template.features.length > 0 && (
            <span className="rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur-sm dark:bg-neutral-800/90 dark:text-neutral-300">
              {template.features.length} features
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {template.category && (
          <span className="mb-1 block text-xs font-semibold text-[#1E4DB7] dark:text-blue-400">
            {template.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-base font-bold text-neutral-900 dark:text-white md:text-lg">
          {template.title}
        </h3>
        {template.shortDescription && (
          <p className="mt-1.5 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
            {template.shortDescription}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-neutral-900 dark:text-white">
              ${Number(template.price).toFixed(2)}
            </span>
            {template.compareAtPrice &&
              template.compareAtPrice > template.price && (
                <span className="text-sm text-neutral-400 line-through">
                  ${Number(template.compareAtPrice).toFixed(2)}
                </span>
              )}
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-[#1E4DB7] transition-colors group-hover:text-[#143A8F] dark:text-blue-400">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="h-1 w-0 transition-all duration-500 group-hover:w-full"
        style={{ backgroundColor: typeColor }}
      />
    </Link>
  );
}

// =============================================================================
// Page Component
// =============================================================================

export default async function TemplatesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // ---------------------------------------------------------------------------
  // Fetch all data in parallel (server-side)
  // ---------------------------------------------------------------------------
  let templatesData = { items: [] as WebTemplate[], meta: { total: 0, hasNextPage: false } };
  let categories: { id: string; name: string; slug: string }[] = [];
  let featuredTemplates: WebTemplate[] = [];

  try {
    const [tData, cats, featured] = await Promise.all([
      fetchTemplates({ limit: 24, sortBy: "createdAt", sortOrder: "DESC" }),
      fetchTemplateCategories(),
      fetchFeaturedTemplates(3),
    ]);
    templatesData = {
      items: tData.items,
      meta: {
        total: tData.meta?.total ?? tData.items.length,
        hasNextPage: tData.meta?.hasNextPage ?? false,
      },
    };
    categories = cats;
    featuredTemplates = featured;
  } catch (error) {
    console.error("[TemplatesPage] Failed to fetch data:", error);
  }

  const totalCount = templatesData.meta.total || templatesData.items.length;
  const frameworkCount = Object.keys(FRAMEWORK_LABELS).length;

  // Build framework entries for the framework cards section
  const frameworkEntries = Object.entries(FRAMEWORK_LABELS) as [
    Framework,
    string,
  ][];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ===================================================================
          HERO SECTION -- Animated Gradient Mesh + Display Typography
      =================================================================== */}
      <section className="relative overflow-hidden py-24 md:py-32 lg:py-40">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0D2B6B]" />

        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-30 animate-gradient-shift"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, #6366F1 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #F59A23 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, #1E4DB7 0%, transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Dot grid pattern overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating decorative orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#F59A23]/15 blur-3xl animate-float" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-[#6366F1]/15 blur-3xl animate-float" style={{ animationDelay: "4s" }} />
          <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-[#F59A23]/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 flex items-center justify-center gap-2 animate-fade-in-up">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-sm">
                <Code2 className="h-4 w-4 text-[#F59A23]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                  Web Templates Store
                </span>
              </div>
            </div>

            {/* Display Title */}
            <h1 className="text-display mb-6 text-white animate-fade-in-up stagger-1">
              Premium{" "}
              <span className="hero-gradient-text">
                Web Templates
              </span>
              <br className="hidden sm:block" />
              {" & Starter Kits"}
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/75 animate-fade-in-up stagger-2">
              Ship faster with professionally crafted templates. SaaS
              boilerplates, landing pages, admin dashboards, and startup kits --
              all built with modern frameworks and best practices.
            </p>

            {/* Interactive Client Component (Counters + Search + Pills) */}
            <TemplatesHeroClient
              totalTemplates={totalCount}
              totalFrameworks={frameworkCount}
              totalCategories={categories.length}
            />

            {/* Trust Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:gap-8 animate-fade-in-up stagger-5">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Instant Setup</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Code2 className="h-4 w-4 text-blue-400" />
                <span>TypeScript Ready</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Shield className="h-4 w-4 text-emerald-400" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          FEATURED TEMPLATES SHOWCASE
      =================================================================== */}
      {featuredTemplates.length > 0 && (
        <section className="bg-gradient-to-b from-neutral-50/50 to-white py-16 md:py-20 dark:from-neutral-900/50 dark:to-neutral-950">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            {/* Section Header */}
            <div className="mb-10 flex items-center justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-px w-8 bg-[#F59A23]" />
                  <span className="overline text-[#F59A23]">
                    <Sparkles className="mr-1 inline h-3 w-3" />
                    Staff Picks
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
                  Featured Templates
                </h2>
              </div>
              <Link
                href="/store/templates"
                className="hidden items-center gap-2 text-sm font-semibold text-[#1E4DB7] transition-colors hover:text-[#143A8F] md:flex"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Horizontal Scroll of Featured Templates */}
            <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-4 scrollbar-hide">
              {featuredTemplates.map((template) => (
                <FeaturedTemplateCard key={template.id} template={template} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================
          FRAMEWORK CATEGORIES SECTION
      =================================================================== */}
      <section className="bg-white py-16 md:py-20 dark:bg-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="h-px w-8 bg-[#1E4DB7]" />
                <span className="overline text-[#1E4DB7]">Frameworks</span>
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white md:text-3xl">
                Browse by Framework
              </h2>
            </div>
          </div>

          {/* Horizontal Scroll of Framework Cards */}
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
            {frameworkEntries.map(([key, label], idx) => {
              const color = FRAMEWORK_COLORS[key] || "#6B7280";
              return (
                <Link
                  key={key}
                  href={`/store/templates/framework/${key}`}
                  className="group flex-shrink-0 w-48 md:w-56"
                >
                  <div
                    className="card-interactive relative h-36 md:h-40 rounded-2xl overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute left-0 right-0 top-0 h-1"
                      style={{ backgroundColor: color }}
                    />

                    {/* Content */}
                    <div className="relative flex h-full flex-col justify-between p-4">
                      {/* Framework dot + name */}
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span
                          className="text-xs font-bold uppercase tracking-wider"
                          style={{ color }}
                        >
                          {label}
                        </span>
                      </div>

                      <div>
                        <h3 className="mb-1 text-sm font-bold text-neutral-900 transition-colors group-hover:text-[#1E4DB7] dark:text-white dark:group-hover:text-blue-400">
                          {label} Templates
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Browse collection
                        </p>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="absolute right-4 top-4 flex h-8 w-8 translate-x-2 transform items-center justify-center rounded-full bg-white/80 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:bg-neutral-800/80">
                      <ArrowRight className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================
          MAIN TEMPLATE GRID -- Full Listing with Filters
      =================================================================== */}
      <section
        id="template-products"
        className="bg-gradient-to-b from-white via-neutral-50/30 to-white py-16 md:py-24 dark:from-neutral-950 dark:via-neutral-900/30 dark:to-neutral-950"
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mx-auto mb-12 max-w-4xl text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
              <div className="flex items-center gap-2 rounded-full bg-[#1E4DB7]/5 px-4 py-2 dark:bg-[#1E4DB7]/10">
                <Layers className="h-4 w-4 text-[#1E4DB7]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E4DB7]">
                  Browse Templates
                </span>
              </div>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#1E4DB7] to-transparent" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl lg:text-5xl">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] bg-clip-text text-transparent">
                Template Catalog
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
              Browse {totalCount} premium web templates across{" "}
              {categories.length} categories. Use the filters to find exactly
              what you need for your next project.
            </p>
          </div>

          {/* Template Listing Client */}
          <div className="mx-auto max-w-7xl">
            <TemplateListingClient
              initialTemplates={templatesData.items}
              initialTotal={totalCount}
              categories={categories}
            />
          </div>
        </div>
      </section>

      {/* ===================================================================
          "START BUILDING TODAY" CTA SECTION
      =================================================================== */}
      <section className="bg-gradient-to-b from-neutral-50 to-white py-20 md:py-28 dark:from-neutral-900 dark:to-neutral-950">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
              {/* Left -- Persuasive Copy */}
              <div className="flex-1 text-center lg:text-left">
                <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
                  <div className="h-px w-8 bg-[#F59A23]" />
                  <span className="overline text-[#F59A23]">
                    Start Building
                  </span>
                </div>
                <h2 className="mb-6 text-3xl font-bold text-neutral-900 dark:text-white md:text-4xl">
                  Stop Coding from Scratch.{" "}
                  <span className="bg-gradient-to-r from-[#1E4DB7] to-[#143A8F] bg-clip-text text-transparent">
                    Ship Faster.
                  </span>
                </h2>
                <p className="mb-8 max-w-lg text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Our templates save you weeks of development time. Every
                  template comes with clean code, comprehensive documentation,
                  and production-ready architecture so you can focus on building
                  your unique features.
                </p>

                {/* Value Props */}
                <ul className="mb-10 space-y-4">
                  {[
                    "Production-ready, battle-tested code architecture",
                    "Full TypeScript support with strict type safety",
                    "Responsive design across all device sizes",
                    "Dark mode, i18n, and SEO built-in",
                    "Regular updates and dedicated support",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-neutral-700 dark:text-neutral-300"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/store/templates"
                  className="btn-premium inline-flex items-center gap-2"
                  onClick={() => {
                    // Scroll handled by anchor
                  }}
                >
                  <Rocket className="h-5 w-5" />
                  Browse All Templates
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Right -- Decorative Mockup */}
              <div className="relative flex-1">
                <div className="relative mx-auto max-w-md">
                  {/* Background glow */}
                  <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#1E4DB7]/10 via-[#143A8F]/5 to-[#F59A23]/10 blur-2xl" />

                  {/* Stacked card mockup */}
                  <div className="relative space-y-4">
                    {/* Card 1 */}
                    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-red-400" />
                          <div className="h-3 w-3 rounded-full bg-yellow-400" />
                          <div className="h-3 w-3 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs text-neutral-400">
                          template.config.ts
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded bg-neutral-100 dark:bg-neutral-700" />
                        <div className="h-3 w-4/5 rounded bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20" />
                        <div className="h-3 w-3/4 rounded bg-neutral-100 dark:bg-neutral-700" />
                        <div className="h-3 w-5/6 rounded bg-[#F59A23]/10 dark:bg-[#F59A23]/20" />
                        <div className="h-3 w-2/3 rounded bg-neutral-100 dark:bg-neutral-700" />
                      </div>
                    </div>

                    {/* Card 2 (offset) */}
                    <div className="ml-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/30">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Build Successful
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Compiled in 2.4s -- 0 errors
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 3 (offset other direction) */}
                    <div className="mr-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4DB7]/10 dark:bg-[#1E4DB7]/20">
                          <Rocket className="h-5 w-5 text-[#1E4DB7]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Deployed to Production
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Live at your-app.vercel.app
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
