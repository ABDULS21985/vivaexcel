import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://drkatangablog.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/admin/",
          "/_next/",
          "/private/",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/api/og"],
        disallow: ["/dashboard/", "/api/", "/admin/", "/login", "/register"],
      },
      {
        userAgent: "Bingbot",
        allow: ["/", "/api/og"],
        disallow: ["/dashboard/", "/api/", "/admin/", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
