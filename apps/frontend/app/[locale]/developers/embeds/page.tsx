import { setRequestLocale } from "next-intl/server";
import EmbedsClient from "./embeds-client";

export default async function EmbedsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmbedsClient />;
}
