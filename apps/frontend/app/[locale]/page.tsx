import { setRequestLocale } from "next-intl/server";
import { HomepageClient } from "./homepage-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomepageClient />;
}
