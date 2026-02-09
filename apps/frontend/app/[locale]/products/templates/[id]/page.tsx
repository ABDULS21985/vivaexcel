import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { TemplateEditForm } from "@/components/templates/template-edit-form";

export const metadata: Metadata = {
  title: "Edit Template | KTBlog",
};

type Props = { params: Promise<{ locale: string; id: string }> };

export default async function EditTemplatePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return (
    <div className="container mx-auto px-4 py-8">
      <TemplateEditForm templateId={id} />
    </div>
  );
}
