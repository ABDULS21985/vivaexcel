import { MetadataRoute } from "next";
import {
  blogPosts,
  blogCategories,
  blogTags,
  blogAuthors,
} from "@/data/blog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vivaexcel.com";

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
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/blogs", changeFrequency: "daily", priority: 0.9 },
  { path: "/membership", changeFrequency: "monthly", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();
  const sitemapEntries: SitemapEntry[] = [];

  // Add static pages
  staticPages.forEach(({ path, changeFrequency, priority }) => {
    sitemapEntries.push({
      url: `${SITE_URL}${path}`,
      lastModified: currentDate,
      changeFrequency,
      priority,
      alternates: generateAlternates(path),
    });
  });

  // Add individual blog post pages (/blogs/[slug])
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

  // Add blog category pages (/blogs/category/[slug])
  blogCategories.forEach((category) => {
    const path = `/blogs/category/${category.slug}`;
    sitemapEntries.push({
      url: `${SITE_URL}${path}`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: generateAlternates(path),
    });
  });

  // Add blog tag pages (/blogs/tag/[slug])
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

  // Add author pages (/author/[slug])
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

  return sitemapEntries;
}
