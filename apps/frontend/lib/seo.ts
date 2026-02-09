import type { Metadata } from "next";
import type {
  BlogPostWithRelations,
  BlogCategory,
  BlogAuthor,
} from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://katangablog.com";
const SITE_NAME = "KatangaBlog";
const TWITTER_HANDLE = "@katangablog";
const DEFAULT_LOCALE = "en_US";

// Supported locales
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

// Locale configuration for hreflang tags
export const localeConfig: Record<Locale, { hreflang: string; name: string }> = {
  en: { hreflang: "en", name: "English" },
  ar: { hreflang: "ar", name: "Arabic" },
};

// ============================================================================
// Canonical URL generation
// ============================================================================

/**
 * Generate a canonical URL with optional locale support
 */
export function generateCanonicalUrl(path: string, locale?: Locale): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (locale && locale !== "en") {
    return `${SITE_URL}/${locale}${cleanPath}`;
  }
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Generate alternate language URLs for hreflang tags
 */
export function generateAlternateUrls(path: string): Record<string, string> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const alternates: Record<string, string> = {
    "x-default": `${SITE_URL}${cleanPath}`,
  };

  locales.forEach((locale) => {
    alternates[localeConfig[locale].hreflang] =
      locale === "en"
        ? `${SITE_URL}${cleanPath}`
        : `${SITE_URL}/${locale}${cleanPath}`;
  });

  return alternates;
}

// ============================================================================
// OG image URL generation
// ============================================================================

/**
 * Generate a dynamic OG image URL for a blog post
 */
export function generateOgImageUrl(params: {
  title: string;
  author?: string;
  category?: string;
  date?: string;
}): string {
  const searchParams = new URLSearchParams();
  searchParams.set("title", params.title);
  if (params.author) searchParams.set("author", params.author);
  if (params.category) searchParams.set("category", params.category);
  if (params.date) searchParams.set("date", params.date);

  return `${SITE_URL}/api/og?${searchParams.toString()}`;
}

// ============================================================================
// Default metadata keywords
// ============================================================================

const defaultKeywords = [
  "blog",
  "technology",
  "AI",
  "cybersecurity",
  "digital transformation",
  "tutorials",
  "insights",
  "KatangaBlog",
];

// ============================================================================
// Generic page metadata generator
// ============================================================================

interface PageMetadataConfig {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  locale?: Locale;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

/**
 * Generate complete page metadata with Open Graph and Twitter cards
 */
export function generatePageMetadata({
  title,
  description,
  path = "/",
  image,
  keywords = [],
  locale,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: PageMetadataConfig): Metadata {
  const canonicalUrl = generateCanonicalUrl(path, locale);
  const ogImage = image || `${SITE_URL}/og-image.jpg`;

  const metadata: Metadata = {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords],
    authors: authors?.map((author) => ({ name: author })) || [
      { name: SITE_NAME },
    ],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: generateAlternateUrls(path),
      types: {
        "application/rss+xml": `${SITE_URL}/rss.xml`,
        "application/atom+xml": `${SITE_URL}/atom.xml`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: locale === "ar" ? "ar_AE" : DEFAULT_LOCALE,
      type: type === "article" ? "article" : "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${title} - ${SITE_NAME}`,
        },
      ],
      ...(type === "article" && {
        publishedTime,
        modifiedTime,
        authors: authors || [SITE_NAME],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };

  return metadata;
}

// ============================================================================
// Blog Post Metadata
// ============================================================================

/**
 * Generate complete metadata for an individual blog post
 */
export function generateBlogPostMetadata(post: BlogPostWithRelations): Metadata {
  const ogImage = generateOgImageUrl({
    title: post.title,
    author: post.author.name,
    category: post.category.name,
    date: new Date(post.publishedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });

  return generatePageMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blogs/${post.slug}`,
    image: ogImage,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt || post.publishedAt,
    authors: [post.author.name],
    keywords: [
      post.category.name,
      ...post.tags.map((tag) => tag.name),
    ],
  });
}

// ============================================================================
// Category Page Metadata
// ============================================================================

/**
 * Generate complete metadata for a blog category page
 */
export function generateCategoryMetadata(category: BlogCategory): Metadata {
  const ogImage = generateOgImageUrl({
    title: `${category.name} Articles`,
    category: category.name,
  });

  return generatePageMetadata({
    title: `${category.name} - Blog`,
    description:
      category.description ||
      `Browse all articles in the ${category.name} category on ${SITE_NAME}.`,
    path: `/blogs/category/${category.slug}`,
    image: ogImage,
    keywords: [category.name, "blog", "articles"],
  });
}

// ============================================================================
// Author Page Metadata
// ============================================================================

/**
 * Generate complete metadata for a blog author page
 */
export function generateAuthorMetadata(author: BlogAuthor): Metadata {
  const ogImage = generateOgImageUrl({
    title: `Articles by ${author.name}`,
    author: author.name,
  });

  return generatePageMetadata({
    title: `${author.name} - Author`,
    description:
      author.bio ||
      `Read articles by ${author.name} on ${SITE_NAME}.`,
    path: `/author/${author.slug}`,
    image: ogImage,
    authors: [author.name],
    keywords: [author.name, author.role, "author"],
  });
}

// ============================================================================
// Tag Page Metadata
// ============================================================================

/**
 * Generate complete metadata for a blog tag page
 */
export function generateTagMetadata(tagName: string, tagSlug: string): Metadata {
  return generatePageMetadata({
    title: `${tagName} - Tagged Articles`,
    description: `Browse all articles tagged with "${tagName}" on ${SITE_NAME}.`,
    path: `/blogs/tag/${tagSlug}`,
    keywords: [tagName, "blog", "tagged"],
  });
}

// ============================================================================
// Pre-configured metadata for static pages
// ============================================================================

export const staticPageMetadata = {
  home: generatePageMetadata({
    title: "KatangaBlog — Insights, Tutorials & Expert Knowledge",
    description:
      "Best-of-class blog platform delivering expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    path: "/",
  }),

  about: generatePageMetadata({
    title: "About Us - KatangaBlog",
    description:
      "Learn about KatangaBlog, our mission to deliver expert insights and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    path: "/about",
    keywords: ["about us", "mission", "team"],
  }),

  contact: generatePageMetadata({
    title: "Contact Us - KatangaBlog",
    description:
      "Get in touch with KatangaBlog. We would love to hear from you about collaboration, guest posts, or partnership opportunities.",
    path: "/contact",
    keywords: ["contact", "get in touch", "support"],
  }),

  blog: generatePageMetadata({
    title: "Blog - All Articles & Insights",
    description:
      "Browse all articles, tutorials, and expert insights on KatangaBlog. Covering technology, AI, cybersecurity, and digital transformation.",
    path: "/blogs",
    keywords: [
      "blog",
      "articles",
      "insights",
      "tutorials",
      "technology",
    ],
  }),

  membership: generatePageMetadata({
    title: "Membership - KatangaBlog",
    description:
      "Join KatangaBlog membership for exclusive content, early access to articles, and premium features.",
    path: "/membership",
    keywords: ["membership", "premium", "exclusive content"],
  }),
};
