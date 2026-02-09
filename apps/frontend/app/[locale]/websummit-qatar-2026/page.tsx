import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import {
  WebSummitHero,
  WebSummitSocialProof,
  WebSummitWhyHere,
  WebSummitProducts,
  WebSummitDemoJourney,
  WebSummitSchedule,
  WebSummitCTABanner,
  WebSummitTeam,
  WebSummitWhyPartner,
  WebSummitCompliance,
  WebSummitSuccessStories,
  WebSummitMeetUs,
  WebSummitContact,
  WebSummitFAQ,
  WebSummitFooter,
  WebSummitNav,
} from "../../../components/websummit";

type Props = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "KTBlog | Web Summit Qatar 2026",
  description:
    "Meet KTBlog at Web Summit Qatar 2026. Discover our AI, Blockchain, and Cybersecurity solutions for investors, enterprises, and governments. February 1-4, Doha.",
  keywords: [
    "Web Summit Qatar",
    "KTBlog",
    "AI Solutions",
    "Blockchain",
    "Cybersecurity",
    "Digital Transformation",
    "Qatar",
    "Doha",
    "Investors",
    "Enterprise Solutions",
  ],
  openGraph: {
    title: "KTBlog | Web Summit Qatar 2026",
    description:
      "Transforming Ideas into Digital Reality. Meet us at Web Summit Qatar 2026, February 1-4, Doha.",
    url: "https://drkatangablog.com/websummit-qatar-2026",
    siteName: "Global Digitalbit Limited",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KTBlog | Web Summit Qatar 2026",
    description:
      "AI, Blockchain, Cybersecurity Solutions. February 1-4, Doha.",
  },
};

export default async function WebSummitQatarPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Floating sticky navigation */}
      <WebSummitNav />

      {/* A) Hero */}
      <WebSummitHero />

      {/* B) Social Proof / Credibility Strip */}
      <WebSummitSocialProof />

      {/* C) Why We're Here - Problem → Opportunity */}
      <WebSummitWhyHere />

      {/* D) Product & Capability Cards */}
      <WebSummitProducts />

      {/* E) Demo Journey / How It Works */}
      <WebSummitDemoJourney />

      {/* F) Schedule / Agenda Preview */}
      <WebSummitSchedule />

      {/* G) CTA Banner */}
      <WebSummitCTABanner />

      {/* H) Team / Presence */}
      <WebSummitTeam />

      {/* Why Partner (bonus section) */}
      <WebSummitWhyPartner />

      {/* Compliance & Certifications (bonus section) */}
      <WebSummitCompliance />

      {/* Success Stories (bonus section) */}
      <WebSummitSuccessStories />

      {/* Meet Us - Event Details (bonus section) */}
      <WebSummitMeetUs />

      {/* I) FAQ */}
      <WebSummitFAQ />

      {/* J) Contact / Meeting Booking */}
      <WebSummitContact />

      {/* K) Footer */}
      <WebSummitFooter />
    </main>
  );
}
