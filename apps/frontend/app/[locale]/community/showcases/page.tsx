import { setRequestLocale } from "next-intl/server";
import { ShowcasesClient } from "./showcases-client";

export default async function ShowcasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ShowcasesClient />;
}
