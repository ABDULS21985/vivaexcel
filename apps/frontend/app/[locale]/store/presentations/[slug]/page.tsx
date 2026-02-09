import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import {
  ChevronRight,
  Star,
  Download,
  Eye,
  Presentation,
  Monitor,
  Smartphone,
  Tablet,
  Layers,
  FileText,
  Package,
  ArrowRight,
  Shield,
  Lock,
  Zap,
  Check,
  Sparkles,
} from "lucide-react";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchProducts,
} from "@/lib/store-api";
import type { DigitalProduct } from "@/types/digital-product";
import { DigitalProductType } from "@/types/digital-product";
import { Link } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";
import { ProductCard } from "@/components/store/product-card";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductInfo } from "@/components/store/product-info";

// =============================================================================
// Types
// =============================================================================

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// =============================================================================
// Metadata
// =============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);

  if (!product) {
    return {
      title: "Presentation Not Found | KTBlog Store",
    };
  }

  const title = `${product.title} | Presentation Templates | KTBlog Store`;
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description?.slice(0, 160);

  return {
    title,
    description,
    keywords: product.seoKeywords || [
      "presentation template",
      "PowerPoint",
      "Google Slides",
      product.title,
    ],
    openGraph: {
      title,
      description,
      url: `https://drkatangablog.com/store/presentations/${slug}`,
      siteName: "KTBlog",
      type: "website",
      images: product.featuredImage
        ? [
            {
              url: product.featuredImage,
              width: 1200,
              height: 630,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// =============================================================================
// Helpers
// =============================================================================

function formatPrice(price: number, currency: string = "USD"): string {
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function renderStars(rating: number): React.ReactNode[] {
  const stars: React.ReactNode[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          className="h-4 w-4 fill-amber-400 text-amber-400"
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="relative inline-flex">
          <Star className="h-4 w-4 text-neutral-300 dark:text-neutral-600" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          </span>
        </span>,
      );
    } else {
      stars.push(
        <Star
          key={i}
          className="h-4 w-4 text-neutral-300 dark:text-neutral-600"
        />,
      );
    }
  }

  return stars;
}

// =============================================================================
// Compatibility Icons
// =============================================================================

const COMPATIBILITY_ITEMS = [
  {
    name: "Microsoft PowerPoint",
    icon: <Presentation className="h-6 w-6" />,
    description: "PPTX format, compatible with PowerPoint 2016+",
    color: "#D24726",
  },
  {
    name: "Google Slides",
    icon: <Monitor className="h-6 w-6" />,
    description: "Import directly into Google Slides",
    color: "#FBBC04",
  },
  {
    name: "Apple Keynote",
    icon: <Tablet className="h-6 w-6" />,
    description: "Compatible with Keynote on macOS and iOS",
    color: "#007AFF",
  },
];

// =============================================================================
// Page Component
// =============================================================================

export default async function PresentationDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // ---------------------------------------------------------------------------
  // Fetch product + related in parallel
  // ---------------------------------------------------------------------------
  const product = await fetchProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related presentations (same category, type=powerpoint)
  let relatedProducts: DigitalProduct[] = [];
  try {
    if (product.category?.slug) {
      const relatedResult = await fetchProducts({
        type: DigitalProductType.POWERPOINT,
        categorySlug: product.category.slug,
        limit: 9,
        status: "published" as any,
      });
      relatedProducts = relatedResult.items
        .filter((p) => p.slug !== product.slug)
        .slice(0, 8);
    }

    // If not enough from category, get general presentations
    if (relatedProducts.length < 4) {
      const moreResult = await fetchProducts({
        type: DigitalProductType.POWERPOINT,
        limit: 9,
        status: "published" as any,
      });
      const additional = moreResult.items.filter(
        (p) =>
          p.slug !== product.slug &&
          !relatedProducts.find((r) => r.id === p.id),
      );
      relatedProducts = [...relatedProducts, ...additional].slice(0, 8);
    }
  } catch (error) {
    console.error(
      "[PresentationDetailPage] Failed to fetch related products:",
      error,
    );
  }

  // Extract metadata
  const meta = product.metadata || {};
  const slideCount = meta.slideCount
    ? Number(meta.slideCount)
    : product.galleryImages?.length || 0;
  const compatibility = Array.isArray(meta.compatibility)
    ? (meta.compatibility as string[])
    : ["PowerPoint", "Google Slides", "Keynote"];
  const fileSize = meta.fileSize ? String(meta.fileSize) : null;
  const format = meta.format ? String(meta.format) : "PPTX";

  // Gallery images for the slide preview section
  const allSlideImages = [
    product.featuredImage,
    ...(product.galleryImages || []),
  ].filter(Boolean) as string[];

  return (
    <>
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Store", url: "/store" },
          { name: "Presentations", url: "/store/presentations" },
          {
            name: product.title,
            url: `/store/presentations/${product.slug}`,
          },
        ])}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        {/* =================================================================
            BREADCRUMBS
        ================================================================= */}
        <div className="bg-neutral-50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm"
            >
              <Link
                href="/store"
                className="text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
              >
                Store
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              <Link
                href="/store/presentations"
                className="text-neutral-500 dark:text-neutral-400 hover:text-[#1E4DB7] dark:hover:text-blue-400 transition-colors"
              >
                Presentations
              </Link>
              <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-900 dark:text-white font-medium truncate max-w-[200px]">
                {product.title}
              </span>
            </nav>
          </div>
        </div>

        {/* =================================================================
            MAIN CONTENT -- Two Column Layout
        ================================================================= */}
        <section className="py-8 md:py-12 lg:py-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* ---------------------------------------------------------
                    Left Column: Slide Gallery
                --------------------------------------------------------- */}
                <div className="lg:col-span-7">
                  <ProductGallery product={product} />

                  {/* Slide Thumbnail Grid */}
                  {allSlideImages.length > 1 && (
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                          <Layers className="h-5 w-5 text-[#D24726]" />
                          All Slides Preview
                        </h3>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                          {allSlideImages.length} slides
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {allSlideImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-[16/10] rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-[#D24726] dark:hover:border-[#D24726] transition-colors group cursor-pointer"
                          >
                            <img
                              src={img}
                              alt={`Slide ${idx + 1} of ${allSlideImages.length}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {/* Slide number badge */}
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-medium">
                              {idx + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description Section */}
                  {product.description && (
                    <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
                        Description
                      </h3>
                      <div
                        className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-[#1E4DB7] dark:prose-a:text-blue-400"
                        dangerouslySetInnerHTML={{
                          __html: product.description,
                        }}
                      />
                    </div>
                  )}

                  {/* Compatibility Section */}
                  <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">
                      Compatibility
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {COMPATIBILITY_ITEMS.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800"
                        >
                          <div
                            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{
                              backgroundColor: `${item.color}15`,
                              color: item.color,
                            }}
                          >
                            {item.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* What's Inside Section */}
                  <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                      <Package className="h-5 w-5 text-[#1E4DB7]" />
                      What&apos;s Inside
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {slideCount > 0 && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#D24726]/5 to-transparent dark:from-[#D24726]/10 border border-neutral-100 dark:border-neutral-800">
                          <div className="w-10 h-10 rounded-lg bg-[#D24726]/10 flex items-center justify-center">
                            <Layers className="h-5 w-5 text-[#D24726]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {slideCount} Slides
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              Professionally designed
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#1E4DB7]/5 to-transparent dark:from-[#1E4DB7]/10 border border-neutral-100 dark:border-neutral-800">
                        <div className="w-10 h-10 rounded-lg bg-[#1E4DB7]/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-[#1E4DB7]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            {format} Format
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            {fileSize ? `File size: ${fileSize}` : "Editable source files"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent dark:from-emerald-500/10 border border-neutral-100 dark:border-neutral-800">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <Check className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Fully Editable
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Colors, fonts, and layouts
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#F59A23]/5 to-transparent dark:from-[#F59A23]/10 border border-neutral-100 dark:border-neutral-800">
                        <div className="w-10 h-10 rounded-lg bg-[#F59A23]/10 flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-[#F59A23]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                            Widescreen & Standard
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            16:9 and 4:3 aspect ratios
                          </p>
                        </div>
                      </div>

                      {/* Render variant features */}
                      {product.variants?.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent dark:from-purple-500/10 border border-neutral-100 dark:border-neutral-800"
                        >
                          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                              {variant.name}
                            </p>
                            {variant.features && variant.features.length > 0 && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                {variant.features.slice(0, 2).join(", ")}
                                {variant.features.length > 2 &&
                                  ` +${variant.features.length - 2} more`}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------------
                    Right Column: Product Info (sticky)
                --------------------------------------------------------- */}
                <div className="lg:col-span-5">
                  <ProductInfo product={product} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            RELATED PRESENTATIONS -- Horizontal Scroll
        ================================================================= */}
        {relatedProducts.length > 0 && (
          <section className="py-16 md:py-20 bg-gradient-to-b from-neutral-50/50 to-white dark:from-neutral-900/50 dark:to-neutral-950 border-t border-neutral-100 dark:border-neutral-800">
            <div className="container mx-auto px-4 md:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex items-end justify-between mb-8 md:mb-10">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D24726]/10 dark:bg-[#D24726]/20">
                      <Presentation className="h-3.5 w-3.5 text-[#D24726]" />
                      <span className="text-[11px] font-semibold tracking-wide text-[#D24726] uppercase">
                        Related Templates
                      </span>
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">
                    You Might Also Like
                  </h2>
                  <p className="mt-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                    More presentation templates in this category
                  </p>
                </div>

                <Link
                  href="/store/presentations"
                  className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#1E4DB7] hover:text-[#143A8F] dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  View All
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Horizontal scroll of related product cards */}
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                {relatedProducts.map((relatedProduct, idx) => (
                  <div
                    key={relatedProduct.id}
                    className="flex-shrink-0 w-[280px] md:w-[320px]"
                  >
                    <ProductCard product={relatedProduct} index={idx} />
                  </div>
                ))}
              </div>

              {/* Mobile "View All" */}
              <div className="flex justify-center mt-10 md:hidden">
                <Link
                  href="/store/presentations"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#D24726] hover:bg-[#B73D1E] text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  View All Presentations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
