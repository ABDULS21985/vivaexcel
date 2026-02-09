import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
    ProductConstellationHero,
    AlternatingProductGrid,
    ProductComparisonCTA,
} from "@/components/products";
import { TrustIndicators } from "@/components/shared";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/shared/json-ld";
import { generateBreadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
    title: "Products | Global Digitalbit Limited",
    description:
        "Discover our flagship products: DigiGate (Enterprise API Gateway), DigiTrust (Blockchain Credential Management), DigiTrack (Asset Tracking), TrustMeHub (Global Digital Trust Infrastructure), and BoaCRM (Enterprise Banking CRM) - enabling seamless data exchange, trusted digital identity, and operational intelligence.",
    openGraph: {
        title: "Our Products - Global Digitalbit Limited",
        description:
            "DigiGate, DigiTrust, DigiTrack, TrustMeHub, and BoaCRM - Enterprise-grade solutions for digital transformation.",
        url: "https://drkatangablog.com/products",
    },
};

type Props = {
    params: Promise<{ locale: string }>;
};

export default async function ProductsPage({ params }: Props) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <>
            <JsonLd
                data={generateBreadcrumbSchema([
                    { name: "Home", url: "/" },
                    { name: "Products", url: "/products" },
                ])}
            />
            <div className="min-h-screen">
                {/* Constellation Hero with floating product icons */}
                <ProductConstellationHero />

                {/* Alternating Product Showcase Grid */}
                <AlternatingProductGrid />

                {/* Trust Indicators */}
                <TrustIndicators />

                {/* Need Help Choosing CTA Section */}
                <ProductComparisonCTA />
            </div>
        </>
    );
}
