"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { OrganizationForm } from "@/components/forms/organization-form";
import { useToast } from "@/components/toast";

export default function NewOrganizationPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Creating organization:", data);

            success("Organization created", "New organization added successfully.");
            router.push("/organizations");
        } catch {
            error("Error", "Failed to create organization.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="New Organization"
                description="Register a new organization"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Organizations", href: "/organizations" },
                    { label: "New" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrganizationForm onSubmit={handleSubmit} isLoading={isLoading} mode="create" />
            </div>
        </div>
    );
}
