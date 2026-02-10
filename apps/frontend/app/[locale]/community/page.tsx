import { setRequestLocale } from "next-intl/server";
import CommunityClient from "./community-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CommunityPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CommunityClient />;
}
