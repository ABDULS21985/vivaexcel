import { setRequestLocale } from "next-intl/server";
import { ShowcaseDetailClient } from "./showcase-detail-client";

export default async function ShowcaseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ShowcaseDetailClient id={id} />;
}
