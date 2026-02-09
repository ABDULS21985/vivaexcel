import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { TemplateCreationWizard } from "@/components/templates/template-creation-wizard";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Create Template | KTBlog",
};

type Props = { params: Promise<{ locale: string }> };

export default async function CreateTemplatePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateCreationWizard />
    </div>
  );
}
