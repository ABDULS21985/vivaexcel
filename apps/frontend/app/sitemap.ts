import { MetadataRoute } from "next";
import {
  blogPosts,
  blogCategories,
  blogTags,
  blogAuthors,
} from "@/data/blog";
import { fetchProducts, fetchProductCategories } from "@/lib/store-api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";

// Supported locales for internationalization
const locales = ["en", "ar"] as const;

type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: ChangeFrequency;
  priority: number;
  alternates?: {
    languages: Record<string, string>;
  };
}

// Helper function to generate locale alternates
function generateAlternates(path: string): { languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  locales.forEach((locale) => {
    languages[locale] = `${SITE_URL}/${locale}${path}`;
  });
  languages["x-default"] = `${SITE_URL}${path}`;
  return { languages };
}

// Static pages with their SEO configuration
const staticPages: Array<{
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}> = [
  { path: "", changeFrequency: "daily", priority: 1.0 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/blogs", changeFrequency: "daily", priority: 0.9 },
  { path: "/membership", changeFrequency: "monthly", priority: 0.5 },
  { path: "/search", changeFrequency: "weekly", priority: 0.4 },
  { path: "/services", changeFrequency: "monthly", priority: 0.5 },
  { path: "/products", changeFrequency: "monthly", priority: 0.5 },
  { path: "/training", changeFrequency: "monthly", priority: 0.5 },
  { path: "/careers", changeFrequency: "weekly", priority: 0.4 },
  { path: "/industries", changeFrequency: "monthly", priority: 0.5 },
  { path: "/case-studies", changeFrequency: "monthly", priority: 0.5 },
  { path: "/store", changeFrequency: "daily", priority: 0.9 },
  { path: "/categories", changeFrequency: "weekly", priority: 0.7 },
  { path: "/affiliate", changeFrequency: "monthly", priority: 0.5 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date();
  const sitemapEntries: SitemapEntry[] = [];

  // ---- Static pages ----
  staticPages.forEach(({ path, changeFrequency, priority }) => {
    sitemapEntries.push({
      url: `${SITE_URL}${path}`,
      lastModified: currentDate,
      changeFrequency,
      priority,
      alternates: generateAlternates(path),
    });
  });

  // ---- Individual blog post pages (/blogs/[slug]) ----
  blogPosts
    .filter((post) => post.status === "published")
    .forEach((post) => {
      const path = `/blogs/${post.slug}`;
      sitemapEntries.push({
        url: `${SITE_URL}${path}`,
        lastModified: new Date(post.updatedAt || post.publishedAt),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: generateAlternates(path),
      });
    });

  // ---- Blog category pages (/blogs/category/[slug]) ----
  blogCategories.forEach((category) => {
    const path = `/blogs/category/${category.slug}`;
    sitemapEntries.push({
      url: `${SITE_URL}${path}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.6,
      alternates: generateAlternates(path),
    });
  });

  // ---- Blog tag pages (/blogs/tag/[slug]) ----
  blogTags.forEach((tag) => {
    const path = `/blogs/tag/${tag.slug}`;
    sitemapEntries.push({
      url: `${SITE_URL}${path}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.5,
      alternates: generateAlternates(path),
    });
  });

  // ---- Author pages (/author/[slug]) ----
  blogAuthors.forEach((author) => {
    const path = `/author/${author.slug}`;
    sitemapEntries.push({
      url: `${SITE_URL}${path}`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: generateAlternates(path),
    });
  });

  // ---- Store product pages (/store/[slug]) ----
  try {
    const [productsResult, categories] = await Promise.all([
      fetchProducts({ limit: 500, status: "published" as any }),
      fetchProductCategories(),
    ]);

    productsResult.items.forEach((product) => {
      const path = `/store/${product.slug}`;
      sitemapEntries.push({
        url: `${SITE_URL}${path}`,
        lastModified: product.updatedAt
          ? new Date(product.updatedAt)
          : currentDate,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: generateAlternates(path),
      });
    });

    // ---- Store category pages (/store/category/[slug]) ----
    categories.forEach((category) => {
      const path = `/store/category/${category.slug}`;
      sitemapEntries.push({
        url: `${SITE_URL}${path}`,
        lastModified: currentDate,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: generateAlternates(path),
      });
    });
  } catch (error) {
    console.error("[sitemap] Failed to fetch store data:", error);
  }

  return sitemapEntries;
}
