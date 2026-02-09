"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { OrganizationForm } from "@/components/forms/organization-form";
import { useToast } from "@/components/toast";

export default function EditOrganizationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    // Mock initial data
    const initialData = {
        id: params.id,
        name: "Acme Corp",
        slug: "acme-corp",
        description: "Leading provider of road runner catching equipment.",
        website: "https://acme.com",
        logoUrl: "",
        isActive: true,
    };

    const handleSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log("Updating organization:", data);

            success("Organization updated", "Organization details updated successfully.");
            router.push("/organizations");
        } catch {
            error("Error", "Failed to update organization.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Organization"
                description={`Editing "${initialData.name}"`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Organizations", href: "/organizations" },
                    { label: "Edit" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <OrganizationForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    mode="edit"
                />
            </div>
        </div>
    );
}
