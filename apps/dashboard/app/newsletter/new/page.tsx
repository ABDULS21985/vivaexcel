"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { useToast } from "@/components/toast";

export default function NewNewsletterPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Creating newsletter:", data);

            success("Draft created", "Your newsletter draft has been created.");
            router.push("/newsletter");
        } catch {
            error("Error", "Failed to create newsletter.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Draft Newsletter"
                description="Create a new email campaign"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Newsletters", href: "/newsletter" },
                    { label: "New Draft" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <NewsletterForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
            </div>
        </div>
    );
}
