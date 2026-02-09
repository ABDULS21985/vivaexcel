import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import {
    CareersHero,
    WhyJoinUs,
    OpenPositions,
    CultureSection,
    CareersCta,
} from "@/components/careers";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: "Careers | Global Digitalbit Limited",
    description: "Join our team at Global Digitalbit Limited. Explore career opportunities in data analytics, AI, cybersecurity, and CBDC solutions. Work with a global team serving 50+ countries.",
    openGraph: {
        title: "Careers at Global Digitalbit Limited",
        description: "Join our team of innovators. Explore exciting career opportunities in technology, consulting, and more.",
        url: "https://globaldigibit.com/careers",
    },
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function CareersPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <main className="flex min-h-screen flex-col items-center justify-between bg-white">
            {/* 1. Full-viewport Hero with animated background */}
            <CareersHero />

            {/* 2. Why Join Us - Benefits and perks */}
            <WhyJoinUs />

            {/* 3. Open Positions - Job listings with filters */}
            <OpenPositions />

            {/* 4. Our Culture - Values and team */}
            <CultureSection />

            {/* 5. Final CTA Section */}
            <CareersCta />
        </main>
    );
}
