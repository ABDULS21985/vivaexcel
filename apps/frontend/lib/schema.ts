// JSON-LD Schema Generators for SEO
// All schemas follow https://schema.org specifications

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";
const SITE_NAME = "KTBlog";
const LOGO_URL = `${BASE_URL}/logo/ktblog.png`;

// --- Organization Schema (site-wide) ---
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: SITE_NAME,
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    description:
      "KTBlog is a best-of-class blog platform delivering expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    sameAs: [
      "https://www.linkedin.com/company/ktblog",
      "https://twitter.com/ktblog",
      "https://www.facebook.com/ktblog",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Arabic"],
    },
  };
}

// --- WebSite Schema (homepage) ---
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: SITE_NAME,
    url: BASE_URL,
    description:
      "Expert insights, in-depth tutorials, and thought leadership on technology, AI, cybersecurity, and digital transformation.",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: ["en", "ar"],
  };
}

// --- BreadcrumbList Schema ---
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

// --- FAQPage Schema ---
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// --- Article Schema (blog posts) — Full spec ---
export function generateArticleSchema(post: {
  title: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;
  updatedAt: string;
  slug: string;
  content?: string;
  author: { name: string; role: string; slug?: string; avatar?: string };
  category: { name: string };
  tags?: { name: string }[];
  viewsCount?: number;
}) {
  const postUrl = `${BASE_URL}/blogs/${post.slug}`;
  const wordCount = post.content
    ? post.content.split(/\s+/).filter(Boolean).length
    : 0;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage
      ? {
          "@type": "ImageObject",
          url: post.featuredImage,
          width: 1200,
          height: 630,
        }
      : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    wordCount,
    articleSection: post.category.name,
    keywords: post.tags ? post.tags.map((t) => t.name).join(", ") : undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
      url: post.author.slug
        ? `${BASE_URL}/author/${post.author.slug}`
        : undefined,
      image: post.author.avatar || undefined,
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
      url: BASE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    url: postUrl,
    isPartOf: {
      "@type": "Blog",
      name: SITE_NAME,
      url: `${BASE_URL}/blogs`,
    },
    interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/ReadAction",
      userInteractionCount: post.viewsCount || 0,
    },
    inLanguage: "en",
  };
}

// --- Product Schema ---
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  id: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${BASE_URL}/products/${product.id}`,
    brand: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/OnlineOnly",
      url: `${BASE_URL}/products/${product.id}`,
    },
  };
}

// --- Service Schema ---
export function generateServiceSchema(service: {
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
  };
}
