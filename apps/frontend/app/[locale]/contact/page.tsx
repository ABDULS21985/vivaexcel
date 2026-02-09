import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_NAME } from "@/lib/constants";
import { ContactPageClient } from "./contact-client";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: `Contact | ${SITE_NAME}`,
  description:
    "Get in touch with the KatangaBlog team. We would love to hear from you — whether it is feedback, partnership inquiries, or just saying hello.",
  openGraph: {
    title: `Contact | ${SITE_NAME}`,
    description:
      "Reach out to the KatangaBlog team. We typically respond within 24 hours.",
    url: "https://katangablog.com/contact",
  },
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactPageClient />;
}
