import type { Metadata } from "next";
import { PricingPageClient } from "../../../components/pricing/pricing-page-client";

export const metadata: Metadata = {
  title: "Pricing — VivaExcel",
  description:
    "Choose the perfect plan for your digital product needs. Subscribe and save with credits-based access.",
};

export default function PricingPage() {
  return <PricingPageClient />;
}
