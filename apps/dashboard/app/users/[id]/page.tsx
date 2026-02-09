"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { UserForm, UserFormData } from "@/components/forms/user-form";
import { useToast } from "@/components/toast";
import { User, UserStatus, UserRole } from "../../../types/user";

// Mock data (in a real app, this would be fetched from the API)
const mockUsers: User[] = [
    {
        id: "1",
        email: "admin@globaldigibit.com",
        firstName: "Admin",
        lastName: "User",
        roles: [UserRole.SUPER_ADMIN],
        status: UserStatus.ACTIVE,
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T10:00:00Z",
    },
    {
        id: "2",
        email: "editor@globaldigibit.com",
        firstName: "Sarah",
        lastName: "Jenkins",
        roles: [UserRole.EDITOR],
        status: UserStatus.ACTIVE,
        emailVerified: true,
        twoFactorEnabled: false,
        createdAt: "2024-01-15T14:30:00Z",
        updatedAt: "2024-01-15T14:30:00Z",
    },
];

export default function EditUserPage() {
    const router = useRouter();
    const { id } = useParams();
    const { success, error } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);
    const [user, setUser] = React.useState<User | null>(null);

    React.useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true);
            try {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 800));
                const foundUser = mockUsers.find((u) => u.id === id);

                if (foundUser) {
                    setUser(foundUser);
                } else {
                    error("Not found", "User not found.");
                    router.push("/users");
                }
            } catch (err) {
                error("Error", "Failed to fetch user.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id, router, error]);

    const handleSubmit = async (data: UserFormData) => {
        setIsSaving(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1200));

            console.log("Updating user:", data);

            success("User updated", `Account for ${data.email} has been updated.`);
            router.push("/users");
        } catch (err) {
            error("Error", "Failed to update user.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-500">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title={`Edit User: ${user?.firstName} ${user?.lastName}`}
                description={`Update account details for ${user?.email}`}
                backHref="/users"
                backLabel="Back to Users"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Users", href: "/users" },
                    { label: "Edit User" },
                ]}
            />

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 md:p-8">
                    <UserForm
                        initialData={user || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => router.push("/users")}
                        isLoading={isSaving}
                        mode="edit"
                    />
                </div>
            </div>
        </div>
    );
}
