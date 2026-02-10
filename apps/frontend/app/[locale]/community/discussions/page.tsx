import { setRequestLocale } from "next-intl/server";
import DiscussionsClient from "./discussions-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DiscussionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DiscussionsClient />;
}
