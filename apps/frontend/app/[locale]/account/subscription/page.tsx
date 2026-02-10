import type { Metadata } from "next";
import { SubscriptionDashboardClient } from "./subscription-dashboard-client";

export const metadata: Metadata = {
  title: "My Subscription — VivaExcel",
  description:
    "Manage your marketplace subscription, credits, and downloads.",
};

export default function SubscriptionPage() {
  return <SubscriptionDashboardClient />;
}
