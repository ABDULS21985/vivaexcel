import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { TemplateManagementClient } from "@/components/templates/template-management-client";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Template Management | KTBlog",
  description: "Manage your web templates and starter kits",
};

type Props = { params: Promise<{ locale: string }> };

export default async function TemplateManagementPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateManagementClient />
    </div>
  );
}
