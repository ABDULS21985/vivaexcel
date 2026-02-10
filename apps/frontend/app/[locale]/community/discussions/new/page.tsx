import { setRequestLocale } from "next-intl/server";
import NewThreadClient from "./new-thread-client";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewThreadPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewThreadClient />;
}
