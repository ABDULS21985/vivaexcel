import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Service Catalog",
    description: "Manage Global Digibit service towers, catalog offerings, engagement models, and industry practices.",
    openGraph: {
        title: "Service Catalog | Digitalbit Dashboard",
        description: "Manage Global Digibit service towers, catalog offerings, engagement models, and industry practices.",
    },
};

export default function ServiceCatalogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
