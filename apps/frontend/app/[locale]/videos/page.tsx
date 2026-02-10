import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { VideoBlogClient } from "@/components/videos/video-blog-client";

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
  title: "Video Blog | VivaExcel",
  description:
    "Watch tutorials, tips, and insights on Excel, data analytics, AI, cybersecurity, and more. Free and premium video content for professionals.",
  keywords: [
    "video tutorials",
    "excel tutorials",
    "data analytics videos",
    "AI tutorials",
    "cybersecurity videos",
    "google sheets tutorials",
    "blockchain videos",
    "tech podcasts",
  ],
  openGraph: {
    title: "Video Blog | VivaExcel",
    description:
      "Watch tutorials, tips, and insights on Excel, data analytics, AI, and more.",
    type: "website",
  },
};

// =============================================================================
// Page
// =============================================================================

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VideosPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <VideoBlogClient />;
}
