import { setRequestLocale } from "next-intl/server";
import { VideoDetailClient } from "./video-detail-client";

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function VideoDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <VideoDetailClient slug={slug} />;
}
