"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { UserForm, UserFormData } from "@/components/forms/user-form";
import { useToast } from "@/components/toast";

export default function NewUserPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = async (data: UserFormData) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            console.log("Creating user:", data);

            success("User created", `${data.email} has been invited to the platform.`);
            router.push("/users");
        } catch (err) {
            error("Error", "Failed to create user. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Add New User"
                description="Create a new administrative or editor account"
                backHref="/users"
                backLabel="Back to Users"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Users", href: "/users" },
                    { label: "Add New" },
                ]}
            />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 md:p-8">
                    <UserForm
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/users")}
                        isLoading={isLoading}
                        mode="create"
                    />
                </div>
            </div>
        </div>
    );
}
