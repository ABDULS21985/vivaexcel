import { permanentRedirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function CategorySlugPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  permanentRedirect(`${prefix}/store/category/${slug}`);
}
