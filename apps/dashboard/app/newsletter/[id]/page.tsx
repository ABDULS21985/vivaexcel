"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { useToast } from "@/components/toast";

export default function EditNewsletterPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    // Mock initial data
    const initialData = {
        id: params.id,
        subject: "March Product Update",
        content: "# Product Update\n\nWe have released new features...",
        status: "draft" as const,
        scheduledAt: "",
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Updating newsletter:", data);

            success("Newsletter updated", "Your newsletter has been updated.");
            router.push("/newsletter");
        } catch {
            error("Error", "Failed to update newsletter.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Newsletter"
                description={`Editing "${initialData.subject}"`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Newsletters", href: "/newsletter" },
                    { label: "Edit" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <NewsletterForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    mode="edit"
                />
            </div>
        </div>
    );
}
