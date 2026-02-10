import { setRequestLocale } from "next-intl/server";
import ThreadDetailClient from "./thread-detail-client";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ThreadDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  return <ThreadDetailClient slug={slug} />;
}
