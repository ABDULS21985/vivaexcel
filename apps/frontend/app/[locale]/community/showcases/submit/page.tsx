import { setRequestLocale } from "next-intl/server";
import { SubmitShowcaseClient } from "./submit-showcase-client";

export default async function SubmitShowcasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubmitShowcaseClient />;
}
