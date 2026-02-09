"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { DigitalProductForm } from "@/components/forms/digital-product-form";
import { useToast } from "@/components/toast";
import { useCreateDigitalProduct } from "@/hooks/use-digital-products";

export default function NewDigitalProductPage() {
    const router = useRouter();
    const { success, error } = useToast();
    const createProductMutation = useCreateDigitalProduct();

    const handleSubmit = async (data: Record<string, unknown>) => {
        createProductMutation.mutate(data, {
            onSuccess: () => {
                success(
                    "Product created",
                    "Your digital product has been created successfully."
                );
                router.push("/products/digital");
            },
            onError: (err) => {
                error(
                    "Error",
                    err.message ||
                        "Failed to create digital product. Please try again."
                );
            },
        });
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Create New Product"
                description="Add a new digital product to your store"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Products", href: "/products" },
                    { label: "Digital Products", href: "/products/digital" },
                    { label: "New Product" },
                ]}
                backHref="/products/digital"
                backLabel="Back to Products"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DigitalProductForm
                    onSubmit={handleSubmit}
                    isLoading={createProductMutation.isPending}
                    mode="create"
                />
            </div>
        </div>
    );
}
