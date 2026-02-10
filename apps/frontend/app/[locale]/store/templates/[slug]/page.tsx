import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/routing";
import {
  Star,
  Download,
  Eye,
  Package,
  Code,
  Layers,
  ArrowRight,
  ExternalLink,
  Terminal,
  GitBranch,
  ShieldCheck,
  Monitor,
  Smartphone,
  FileText,
  Clock,
  BookOpen,
  ScrollText,
  Tag,
  ChevronRight,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  fetchTemplateBySlug,
  fetchRelatedTemplates,
} from "@/lib/template-api";
import { TemplatePreviewer } from "@/components/store/viewers/template-previewer";
import { FeatureGrid } from "@/components/templates/feature-grid";
import { TechStackDiagram } from "@/components/templates/tech-stack-diagram";
import { LicenseComparisonTable } from "@/components/templates/license-comparison-table";
import { DeployButton } from "@/components/templates/deploy-button";
import { FrameworkBadge } from "@/components/templates/framework-badge";
import { RelatedTemplates } from "@/components/templates/related-templates";
import { SetupGuide } from "@/components/templates/setup-guide";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { AnimatedSection } from "@/components/ui/animations/animated-section";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animations/stagger-container";
import {
  TEMPLATE_TYPE_LABELS,
  LICENSE_TYPE_LABELS,
  TEMPLATE_FEATURES,
} from "@/types/web-template";

// =============================================================================
// Types
// =============================================================================

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = await fetchTemplateBySlug(slug);
  if (!template) return { title: "Template Not Found" };

  return {
    title: `${template.title} | KTBlog Templates`,
    description:
      template.seoDescription ||
      template.shortDescription ||
      template.description?.slice(0, 160),
    keywords: template.seoKeywords,
    openGraph: {
      title: template.seoTitle || template.title,
      description:
        template.seoDescription || template.shortDescription || "",
      images: template.featuredImage
        ? [{ url: template.featuredImage }]
        : [],
    },
  };
}

// =============================================================================
// Helpers
// =============================================================================

function formatNumber(n?: number): string {
  if (!n) return "0";
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`h-4 w-4 ${
          i <= Math.round(rating)
            ? "fill-[#F59A23] text-[#F59A23]"
            : "fill-neutral-200 text-neutral-200 dark:fill-neutral-700 dark:text-neutral-700"
        }`}
      />
    );
  }
  return stars;
}

// =============================================================================
// Page Component
// =============================================================================

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const template = await fetchTemplateBySlug(slug);
  if (!template) notFound();

  const relatedTemplates = await fetchRelatedTemplates(template, 4);

  const discount =
    template.compareAtPrice && template.compareAtPrice > template.price
      ? Math.round(
          (1 - template.price / template.compareAtPrice) * 100
        )
      : null;

  const priceFormatted = `$${Number(template.price).toFixed(2)}`;
  const compareAtPriceFormatted = template.compareAtPrice
    ? `$${Number(template.compareAtPrice).toFixed(2)}`
    : null;

  const responsiveDevices = template.responsiveBreakpoints
    ? [
        template.responsiveBreakpoints.mobile && "Mobile",
        template.responsiveBreakpoints.tablet && "Tablet",
        template.responsiveBreakpoints.desktop && "Desktop",
      ].filter(Boolean)
    : [];

  // Build the feature inclusion checklist
  const featureChecklist = TEMPLATE_FEATURES.map((feature) => ({
    name: feature,
    included: template.features.includes(feature),
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* ================================================================= */}
      {/* 1. BREADCRUMBS                                                    */}
      {/* ================================================================= */}
      <nav className="border-b border-neutral-200 bg-neutral-50/80 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-1.5 text-sm">
            <li>
              <Link
                href="/store"
                className="font-medium text-neutral-500 transition-colors hover:text-[#1E4DB7] dark:text-neutral-400 dark:hover:text-blue-400"
              >
                Store
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" />
            </li>
            <li>
              <Link
                href="/store/templates"
                className="font-medium text-neutral-500 transition-colors hover:text-[#1E4DB7] dark:text-neutral-400 dark:hover:text-blue-400"
              >
                Templates
              </Link>
            </li>
            {template.category && (
              <>
                <li>
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" />
                </li>
                <li>
                  <Link
                    href={`/store/templates?category=${template.category.slug}`}
                    className="font-medium text-neutral-500 transition-colors hover:text-[#1E4DB7] dark:text-neutral-400 dark:hover:text-blue-400"
                  >
                    {template.category.name}
                  </Link>
                </li>
              </>
            )}
            <li>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-600" />
            </li>
            <li className="truncate font-semibold text-neutral-900 dark:text-white">
              {template.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* ================================================================= */}
      {/* MAIN CONTENT                                                      */}
      {/* ================================================================= */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          {/* ----------- LEFT COLUMN (2/3) ----------- */}
          <div className="lg:col-span-2">
            {/* ============================================================= */}
            {/* 2. HEADER SECTION                                             */}
            {/* ============================================================= */}
            <AnimatedSection animation="fade-up" duration={600}>
              <div className="mb-10">
                {/* Badges row */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <FrameworkBadge framework={template.framework} size="md" />
                  <span className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                    {TEMPLATE_TYPE_LABELS[template.templateType]}
                  </span>
                  {template.isFeatured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#F59A23]/20 to-[#E86A1D]/20 px-3 py-1 text-xs font-bold text-[#E86A1D] dark:from-[#F59A23]/10 dark:to-[#E86A1D]/10">
                      <Sparkles className="h-3 w-3" />
                      Featured
                    </span>
                  )}
                  {template.hasTypeScript && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      <Code className="h-3 w-3" />
                      TypeScript
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-display text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white lg:text-5xl">
                  <span className="hero-gradient-text">{template.title}</span>
                </h1>

                {/* Short description */}
                {template.shortDescription && (
                  <p className="mt-4 text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {template.shortDescription}
                  </p>
                )}

                {/* Stats row */}
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                  {/* Rating */}
                  {template.averageRating != null &&
                    template.averageRating > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-0.5">
                          {renderStars(template.averageRating)}
                        </div>
                        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                          {template.averageRating.toFixed(1)}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          ({formatNumber(template.totalReviews)})
                        </span>
                      </div>
                    )}

                  <StatPill
                    icon={<Download className="h-4 w-4" />}
                    label={formatNumber(template.downloadCount)}
                    sublabel="downloads"
                  />
                  <StatPill
                    icon={<Eye className="h-4 w-4" />}
                    label={formatNumber(template.viewCount)}
                    sublabel="views"
                  />
                  {template.pageCount > 0 && (
                    <StatPill
                      icon={<FileText className="h-4 w-4" />}
                      label={String(template.pageCount)}
                      sublabel="pages"
                    />
                  )}
                  {template.componentCount > 0 && (
                    <StatPill
                      icon={<Layers className="h-4 w-4" />}
                      label={String(template.componentCount)}
                      sublabel="components"
                    />
                  )}
                </div>

                {/* Creator */}
                {template.creator && (
                  <div className="mt-5 flex items-center gap-3">
                    {template.creator.avatar ? (
                      <img
                        src={template.creator.avatar}
                        alt={template.creator.name}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1E4DB7] to-[#143A8F] text-xs font-bold text-white">
                        {template.creator.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-neutral-900 dark:text-white">
                        {template.creator.name}
                      </span>
                      <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Creator
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* ============================================================= */}
            {/* 4. ENHANCED LIVE PREVIEW SECTION                              */}
            {/* ============================================================= */}
            {template.demoUrl && (
              <AnimatedSection animation="fade-up" delay={100} duration={600}>
                <section className="mb-14">
                  <TemplatePreviewer
                    demoUrl={template.demoUrl}
                    title={template.title}
                    pages={template.demos?.map((demo) => ({
                      name: demo.name,
                      path: demo.demoUrl,
                    }))}
                  />
                </section>
              </AnimatedSection>
            )}

            {/* ============================================================= */}
            {/* 5. DESCRIPTION SECTION                                        */}
            {/* ============================================================= */}
            {template.description && (
              <AnimatedSection animation="fade-up" delay={150} duration={600}>
                <section className="mb-14">
                  <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                    <BookOpen className="h-5 w-5 text-[#1E4DB7]" />
                    About This Template
                  </h2>
                  <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 lg:p-8">
                    <div
                      className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-a:text-[#1E4DB7] prose-strong:text-neutral-900 dark:prose-invert dark:prose-headings:text-white dark:prose-a:text-blue-400 dark:prose-strong:text-white"
                      dangerouslySetInnerHTML={{
                        __html: template.description,
                      }}
                    />
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* ============================================================= */}
            {/* 6. ENHANCED FEATURE GRID (visual checklist)                   */}
            {/* ============================================================= */}
            <AnimatedSection animation="fade-up" delay={200} duration={600}>
              <section className="mb-14">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                  <Package className="h-5 w-5 text-[#1E4DB7]" />
                  Features
                </h2>

                {/* Included features via FeatureGrid */}
                {template.features.length > 0 && (
                  <div className="mb-6">
                    <FeatureGrid features={template.features} columns={4} />
                  </div>
                )}

                {/* Full checklist: show all TEMPLATE_FEATURES */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Feature Checklist
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {featureChecklist.map((item) => (
                      <div
                        key={item.name}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          item.included
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-neutral-50 text-neutral-400 dark:bg-neutral-800/50 dark:text-neutral-500"
                        }`}
                      >
                        <span className="text-base">
                          {item.included ? "\u2705" : "\u274C"}
                        </span>
                        <span
                          className={
                            item.included ? "font-medium" : "line-through"
                          }
                        >
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </AnimatedSection>

            {/* ============================================================= */}
            {/* 7. TECH STACK VISUALIZATION                                   */}
            {/* ============================================================= */}
            {template.techStack && (
              <AnimatedSection animation="fade-up" delay={250} duration={600}>
                <section className="mb-14">
                  <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                    <Code className="h-5 w-5 text-[#1E4DB7]" />
                    Tech Stack
                  </h2>
                  <div className="card-interactive rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                    <TechStackDiagram techStack={template.techStack} />
                  </div>
                </section>
              </AnimatedSection>
            )}

            {/* ============================================================= */}
            {/* 8. TEMPLATE DETAILS GRID                                      */}
            {/* ============================================================= */}
            <AnimatedSection animation="fade-up" delay={300} duration={600}>
              <section className="mb-14">
                <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                  <Layers className="h-5 w-5 text-[#1E4DB7]" />
                  Template Details
                </h2>

                <StaggerContainer
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  animation="fade-up"
                  staggerDelay={60}
                >
                  {template.pageCount > 0 && (
                    <StaggerItem>
                      <DetailCard
                        icon={<FileText className="h-5 w-5" />}
                        label="Pages"
                        value={String(template.pageCount)}
                      />
                    </StaggerItem>
                  )}

                  {template.componentCount > 0 && (
                    <StaggerItem>
                      <DetailCard
                        icon={<Layers className="h-5 w-5" />}
                        label="Components"
                        value={String(template.componentCount)}
                      />
                    </StaggerItem>
                  )}

                  <StaggerItem>
                    <DetailCard
                      icon={<Code className="h-5 w-5" />}
                      label="TypeScript"
                      value={template.hasTypeScript ? "Yes" : "No"}
                      highlight={template.hasTypeScript}
                    />
                  </StaggerItem>

                  {template.nodeVersion && (
                    <StaggerItem>
                      <DetailCard
                        icon={<Terminal className="h-5 w-5" />}
                        label="Node Version"
                        value={template.nodeVersion}
                      />
                    </StaggerItem>
                  )}

                  {template.packageManager && (
                    <StaggerItem>
                      <DetailCard
                        icon={<Package className="h-5 w-5" />}
                        label="Package Manager"
                        value={template.packageManager}
                      />
                    </StaggerItem>
                  )}

                  {template.browserSupport.length > 0 && (
                    <StaggerItem>
                      <DetailCard
                        icon={<Monitor className="h-5 w-5" />}
                        label="Browser Support"
                        value={template.browserSupport.join(", ")}
                      />
                    </StaggerItem>
                  )}

                  {responsiveDevices.length > 0 && (
                    <StaggerItem>
                      <DetailCard
                        icon={<Smartphone className="h-5 w-5" />}
                        label="Responsive"
                        value={responsiveDevices.join(", ")}
                      />
                    </StaggerItem>
                  )}

                  <StaggerItem>
                    <DetailCard
                      icon={<Clock className="h-5 w-5" />}
                      label="Support Duration"
                      value={`${template.supportDuration || 6} months`}
                    />
                  </StaggerItem>

                  {template.documentationUrl && (
                    <StaggerItem>
                      <a
                        href={template.documentationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <DetailCard
                          icon={<BookOpen className="h-5 w-5" />}
                          label="Documentation"
                          value="View Docs"
                          isLink
                        />
                      </a>
                    </StaggerItem>
                  )}

                  {template.changelogUrl && (
                    <StaggerItem>
                      <a
                        href={template.changelogUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <DetailCard
                          icon={<ScrollText className="h-5 w-5" />}
                          label="Changelog"
                          value="View Changes"
                          isLink
                        />
                      </a>
                    </StaggerItem>
                  )}
                </StaggerContainer>
              </section>
            </AnimatedSection>

            {/* ============================================================= */}
            {/* 9. SETUP GUIDE PREVIEW                                        */}
            {/* ============================================================= */}
            <AnimatedSection animation="fade-up" delay={350} duration={600}>
              <section className="mb-14">
                <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                  <Zap className="h-5 w-5 text-[#F59A23]" />
                  Get Started in 3 Steps
                </h2>
                <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                  Up and running in under 5 minutes
                </p>

                <SetupGuide
                  githubRepoUrl={template.githubRepoUrl}
                  title={template.title}
                  packageManager={template.packageManager}
                />
              </section>
            </AnimatedSection>

            {/* ============================================================= */}
            {/* 10. LICENSE COMPARISON TABLE                                   */}
            {/* ============================================================= */}
            <AnimatedSection animation="fade-up" delay={400} duration={600}>
              <section className="mb-14">
                <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                  <ShieldCheck className="h-5 w-5 text-[#1E4DB7]" />
                  License Options
                </h2>
                <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                  Choose the plan that fits your needs
                </p>

                <LicenseComparisonTable
                  basePrice={Number(template.price)}
                  currency={template.currency}
                  currentLicense={template.license}
                />
              </section>
            </AnimatedSection>

            {/* ============================================================= */}
            {/* 11. TAGS SECTION                                              */}
            {/* ============================================================= */}
            {template.tags && template.tags.length > 0 && (
              <AnimatedSection animation="fade-up" delay={450} duration={600}>
                <section className="mb-14">
                  <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-white">
                    <Tag className="h-5 w-5 text-[#1E4DB7]" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/store/templates?tagSlug=${tag.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-all hover:border-[#1E4DB7] hover:bg-[#1E4DB7]/5 hover:text-[#1E4DB7] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-blue-500 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                      >
                        <Tag className="h-3 w-3 opacity-50" />
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            )}
          </div>

          {/* ----------- RIGHT COLUMN (1/3) — STICKY SIDEBAR ----------- */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              {/* ============================================================= */}
              {/* 3. PRICE & ACTIONS PANEL                                      */}
              {/* ============================================================= */}
              <AnimatedSection animation="slide-right" delay={200} duration={700}>
                <div className="card-interactive rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-neutral-900/50">
                  {/* Price display */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-3">
                      <span className="text-4xl font-extrabold text-neutral-900 dark:text-white">
                        {priceFormatted}
                      </span>
                      {compareAtPriceFormatted &&
                        template.compareAtPrice! > template.price && (
                          <>
                            <span className="text-lg text-neutral-400 line-through">
                              {compareAtPriceFormatted}
                            </span>
                            <span className="rounded-full bg-gradient-to-r from-[#E86A1D] to-[#F59A23] px-2.5 py-0.5 text-xs font-bold text-white">
                              -{discount}%
                            </span>
                          </>
                        )}
                    </div>

                    {/* License & support */}
                    <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                      <ShieldCheck className="h-4 w-4 text-[#1E4DB7]" />
                      <span>
                        {LICENSE_TYPE_LABELS[template.license]} license
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-600">
                        |
                      </span>
                      <Clock className="h-4 w-4 text-[#1E4DB7]" />
                      <span>
                        {template.supportDuration || 6}mo support
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mb-5 border-t border-neutral-100 dark:border-neutral-800" />

                  {/* Action buttons */}
                  <div className="space-y-3">
                    {/* Add to Cart — uses premium client component */}
                    <AddToCartButton
                      productId={template.id}
                      productTitle={template.title}
                      productImage={template.featuredImage}
                      price={template.price}
                      currency={template.currency || "USD"}
                      variant="primary"
                      size="lg"
                      className="w-full"
                    />

                    {/* Buy Now */}
                    <Link
                      href={`/checkout?template=${template.id}`}
                      className="block w-full rounded-xl border-2 border-[#1E4DB7] px-8 py-3 text-center text-sm font-semibold text-[#1E4DB7] transition-all hover:bg-[#1E4DB7]/5 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-400/10"
                    >
                      Buy Now
                    </Link>

                    {/* Deploy buttons */}
                    {template.githubRepoUrl && (
                      <div className="flex gap-2 pt-1">
                        <DeployButton
                          provider="vercel"
                          repoUrl={template.githubRepoUrl}
                          className="flex-1 justify-center text-xs"
                        />
                        <DeployButton
                          provider="netlify"
                          repoUrl={template.githubRepoUrl}
                          className="flex-1 justify-center text-xs"
                        />
                      </div>
                    )}

                    {/* Live Demo link */}
                    {template.demoUrl && (
                      <a
                        href={template.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 px-8 py-3 text-sm font-semibold text-neutral-700 transition-all hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Live Demo
                      </a>
                    )}
                  </div>

                  {/* Trust signals */}
                  <div className="mt-5 space-y-2 border-t border-neutral-100 pt-5 dark:border-neutral-800">
                    <TrustSignal
                      icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
                      text="Secure checkout via Stripe"
                    />
                    <TrustSignal
                      icon={<Download className="h-4 w-4 text-[#1E4DB7]" />}
                      text="Instant download after purchase"
                    />
                    <TrustSignal
                      icon={<GitBranch className="h-4 w-4 text-[#F59A23]" />}
                      text="Lifetime access to source code"
                    />
                  </div>
                </div>
              </AnimatedSection>

              {/* Preview image (if featured image exists) */}
              {template.featuredImage && (
                <AnimatedSection
                  animation="fade-up"
                  delay={350}
                  duration={600}
                >
                  <div className="mt-6 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <img
                      src={template.featuredImage}
                      alt={`${template.title} preview`}
                      className="aspect-video w-full object-cover"
                    />
                  </div>
                </AnimatedSection>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 12. RELATED TEMPLATES                                             */}
        {/* ================================================================= */}
        <AnimatedSection animation="fade-up" delay={100} duration={600}>
          <RelatedTemplates templates={relatedTemplates} />
        </AnimatedSection>
      </div>

      {/* =================================================================== */}
      {/* 13. CTA SECTION                                                     */}
      {/* =================================================================== */}
      <AnimatedSection animation="fade-up" duration={600}>
        <section className="relative overflow-hidden border-t border-neutral-200 dark:border-neutral-800">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E4DB7] via-[#143A8F] to-[#0F2D6B]" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to Launch Your Next Project?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-200">
              Skip months of development and launch faster with{" "}
              <span className="font-semibold text-white">
                {template.title}
              </span>
              . Production-ready, fully customizable, and backed by dedicated
              support.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <AddToCartButton
                productId={template.id}
                productTitle={template.title}
                productImage={template.featuredImage}
                price={template.price}
                currency={template.currency || "USD"}
                variant="secondary"
                size="lg"
              />

              <Link
                href="/store/templates"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/20"
              >
                Browse More Templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}

// =============================================================================
// Sub-components (Server — no "use client")
// =============================================================================

function StatPill({
  icon,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
      <span className="text-neutral-400 dark:text-neutral-500">{icon}</span>
      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
        {label}
      </span>
      <span>{sublabel}</span>
    </div>
  );
}

function DetailCard({
  icon,
  label,
  value,
  highlight,
  isLink,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  isLink?: boolean;
}) {
  return (
    <div className="card-interactive flex items-start gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-all dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          highlight
            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
        <p
          className={`mt-0.5 text-sm font-semibold ${
            isLink
              ? "text-[#1E4DB7] group-hover:underline dark:text-blue-400"
              : "text-neutral-900 dark:text-white"
          }`}
        >
          {value}
          {isLink && <ExternalLink className="ml-1 inline h-3 w-3 opacity-50" />}
        </p>
      </div>
    </div>
  );
}

function TrustSignal({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-neutral-400">
      {icon}
      <span>{text}</span>
    </div>
  );
}
