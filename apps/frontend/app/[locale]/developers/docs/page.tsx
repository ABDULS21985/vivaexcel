import { setRequestLocale } from "next-intl/server";
import ApiDocsClient from "./api-docs-client";

export default async function ApiDocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ApiDocsClient />;
}
