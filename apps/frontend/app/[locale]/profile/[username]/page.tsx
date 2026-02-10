import { setRequestLocale } from "next-intl/server";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string; username: string }>;
}) {
  const { locale, username } = await params;
  setRequestLocale(locale);

  return <ProfileClient username={username} />;
}
