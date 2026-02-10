import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { CollabClient } from "@/components/collab/collab-client";

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
  title: "Collab | VivaExcel",
  description:
    "Join the VivaExcel community. Share insights, discuss Excel tips, AI automation, data analytics, and connect with professionals worldwide.",
  keywords: [
    "community",
    "collaboration",
    "excel community",
    "data analytics discussions",
    "AI insights",
    "tech community",
    "professional network",
  ],
  openGraph: {
    title: "Collab | VivaExcel",
    description:
      "Join the VivaExcel community. Share insights and connect with professionals.",
    type: "website",
  },
};

// =============================================================================
// Page
// =============================================================================

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CollabPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CollabClient />;
}
