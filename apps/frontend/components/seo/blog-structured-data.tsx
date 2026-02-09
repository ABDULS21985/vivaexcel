import Script from "next/script";
import type { BlogPostWithRelations, BlogCategory, BlogAuthor } from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaexcel.com";
const SITE_NAME = "VivaExcel Blog";
const LOGO_URL = `${SITE_URL}/logo/vivaexcel.png`;

// ============================================================================
// ArticleStructuredData — JSON-LD for individual blog posts
// ============================================================================

interface ArticleStructuredDataProps {
  post: BlogPostWithRelations;
}

export function ArticleStructuredData({ post }: ArticleStructuredDataProps) {
  const postUrl = `${SITE_URL}/blogs/${post.slug}`;
  const wordCount = post.content
    ? post.content.split(/\s+/).filter(Boolean).length
    : 0;

  const articleData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    wordCount,
    articleSection: post.category.name,
    keywords: post.tags.map((tag) => tag.name),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      url: `${SITE_URL}/author/${post.author.slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
        width: 512,
        height: 512,
      },
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    isPartOf: {
      "@type": "Blog",
      name: SITE_NAME,
      url: `${SITE_URL}/blogs`,
    },
  };

  return (
    <Script
      id={`article-schema-${post.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleData),
      }}
    />
  );
}

// ============================================================================
// BreadcrumbStructuredData — JSON-LD for breadcrumb navigation
// ============================================================================

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData),
      }}
    />
  );
}

/**
 * Generate breadcrumb items for a blog post
 */
export function generateBlogPostBreadcrumbs(
  post: BlogPostWithRelations
): BreadcrumbItem[] {
  return [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blogs` },
    { name: post.category.name, url: `${SITE_URL}/blogs/category/${post.category.slug}` },
    { name: post.title, url: `${SITE_URL}/blogs/${post.slug}` },
  ];
}

/**
 * Generate breadcrumb items for a category page
 */
export function generateCategoryBreadcrumbs(category: BlogCategory): BreadcrumbItem[] {
  return [
    { name: "Home", url: SITE_URL },
    { name: "Blog", url: `${SITE_URL}/blogs` },
    { name: category.name, url: `${SITE_URL}/blogs/category/${category.slug}` },
  ];
}

/**
 * Generate breadcrumb items for an author page
 */
export function generateAuthorBreadcrumbs(author: BlogAuthor): BreadcrumbItem[] {
  return [
    { name: "Home", url: SITE_URL },
    { name: "Authors", url: `${SITE_URL}/author` },
    { name: author.name, url: `${SITE_URL}/author/${author.slug}` },
  ];
}

// ============================================================================
// OrganizationStructuredData — JSON-LD for the site
// ============================================================================

export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    description:
      "VivaExcel Blog is a best-of-class blog platform delivering expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    sameAs: [
      "https://www.linkedin.com/company/vivaexcel",
      "https://twitter.com/vivaexcel",
      "https://www.facebook.com/vivaexcel",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Arabic"],
    },
  };

  return (
    <Script
      id="organization-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData),
      }}
    />
  );
}

// ============================================================================
// WebSiteStructuredData — JSON-LD for site-level search
// ============================================================================

export function WebSiteStructuredData() {
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blogs?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "ar"],
  };

  return (
    <Script
      id="website-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(websiteData),
      }}
    />
  );
}

// ============================================================================
// Pre-configured breadcrumbs for common blog pages
// ============================================================================

export function BlogHomeBreadcrumb() {
  return (
    <BreadcrumbStructuredData
      items={[
        { name: "Home", url: SITE_URL },
        { name: "Blog", url: `${SITE_URL}/blogs` },
      ]}
    />
  );
}

export function BlogPostBreadcrumb({ post }: { post: BlogPostWithRelations }) {
  return (
    <BreadcrumbStructuredData items={generateBlogPostBreadcrumbs(post)} />
  );
}

export function BlogCategoryBreadcrumb({ category }: { category: BlogCategory }) {
  return (
    <BreadcrumbStructuredData items={generateCategoryBreadcrumbs(category)} />
  );
}

export function BlogAuthorBreadcrumb({ author }: { author: BlogAuthor }) {
  return (
    <BreadcrumbStructuredData items={generateAuthorBreadcrumbs(author)} />
  );
}
