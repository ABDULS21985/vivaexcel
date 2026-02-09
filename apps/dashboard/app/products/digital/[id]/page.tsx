"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { DigitalProductForm } from "@/components/forms/digital-product-form";
import { useToast } from "@/components/toast";
import {
    useDigitalProduct,
    useUpdateDigitalProduct,
} from "@/hooks/use-digital-products";
import { Loader2 } from "lucide-react";

export default function EditDigitalProductPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const { success, error } = useToast();

    const {
        data: product,
        isLoading: isLoadingProduct,
        error: fetchError,
    } = useDigitalProduct(params.id);
    const updateProductMutation = useUpdateDigitalProduct();

    const handleSubmit = async (data: Record<string, unknown>) => {
        updateProductMutation.mutate(
            { id: params.id, data },
            {
                onSuccess: () => {
                    success(
                        "Product updated",
                        "Your digital product has been updated successfully."
                    );
                    router.push("/products/digital");
                },
                onError: (err) => {
                    error(
                        "Error",
                        err.message ||
                            "Failed to update digital product. Please try again."
                    );
                },
            }
        );
    };

    if (isLoadingProduct) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Edit Product"
                    description="Loading product..."
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Products", href: "/products" },
                        {
                            label: "Digital Products",
                            href: "/products/digital",
                        },
                        { label: "Edit Product" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading product data...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Edit Product"
                    description="Failed to load product"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Products", href: "/products" },
                        {
                            label: "Digital Products",
                            href: "/products/digital",
                        },
                        { label: "Edit Product" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load product
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {fetchError.message ||
                                "An error occurred while fetching the product."}
                        </p>
                        <button
                            onClick={() => router.push("/products/digital")}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Back to Products
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Product"
                description={`Editing "${product?.title ?? "Product"}"`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Products", href: "/products" },
                    { label: "Digital Products", href: "/products/digital" },
                    { label: "Edit Product" },
                ]}
                backHref="/products/digital"
                backLabel="Back to Products"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DigitalProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    isLoading={updateProductMutation.isPending}
                    mode="edit"
                />
            </div>
        </div>
    );
}
