"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { RedirectForm, type RedirectFormValues } from "@/components/redirects/redirect-form";

// Simulated existing sources for duplicate check
const existingSources = [
    "/blog/old-article-slug",
    "/about-us",
    "/promo/summer-2024",
    "/blog/getting-started",
    "/services/old-service",
    "/news",
    "/contact-us",
];

export default function NewRedirectPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: RedirectFormValues) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            success(
                "Redirect created",
                `${data.source} now redirects to ${data.destination}`
            );
            router.push("/redirects");
        } catch {
            error("Error", "Failed to create redirect. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Create Redirect"
                description="Add a new URL redirect rule"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Redirects", href: "/redirects" },
                    { label: "New Redirect" },
                ]}
                backHref="/redirects"
                backLabel="Back to Redirects"
            />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    <RedirectForm
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                        mode="create"
                        existingSources={existingSources}
                    />
                </div>
            </div>
        </div>
    );
}
