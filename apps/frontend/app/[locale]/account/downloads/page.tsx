import type { Metadata } from "next";
import DownloadsPageClient from "./downloads-page-client";

// =============================================================================
// Metadata
// =============================================================================

export const metadata: Metadata = {
  title: "My Downloads | KTBlog Store",
  description:
    "Download your purchased digital products, manage licenses, and check for updates.",
  robots: { index: false, follow: false },
};

// =============================================================================
// Page Component (Server)
// =============================================================================

export default function DownloadsPage() {
  return <DownloadsPageClient />;
}
