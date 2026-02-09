"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { StatsCard } from "@/components/stats-card";
import { FormModal, ConfirmModal } from "@/components/modal";
import { ProductForm, ProductFormData } from "@/components/forms/product-form";
import { useToast } from "@/components/toast";
import { Button } from "@ktblog/ui/components";
import { Plus, Package, CheckCircle, Star, ExternalLink, Eye } from "lucide-react";

interface Product {
    id: string;
    name: string;
    tagline: string;
    description: string;
    status: "draft" | "published" | "archived";
    accentColor: string;
    websiteUrl: string;
    features: string[];
    createdAt: string;
}

const initialProducts: Product[] = [
    {
        id: "digigate",
        name: "DigiGate",
        tagline: "The Command Center for Your Digital Ecosystem",
        description: "Comprehensive API gateway and lifecycle management solution",
        status: "published",
        accentColor: "#1E4DB7",
        websiteUrl: "/products",
        features: [],
        createdAt: "2024-01-01",
    },
    {
        id: "digitrust",
        name: "DigiTrust",
        tagline: "Immutable Trust for a Digital World",
        description: "Blockchain-based credential issuance and verification",
        status: "published",
        accentColor: "#F59A23",
        websiteUrl: "/products",
        features: [],
        createdAt: "2024-01-15",
    },
    {
        id: "digitrack",
        name: "DigiTrack",
        tagline: "Complete Visibility Across Your Digital Operations",
        description: "Real-time tracking and traceability solution",
        status: "published",
        accentColor: "#E86A1D",
        websiteUrl: "/products",
        features: [],
        createdAt: "2024-02-01",
    },
    {
        id: "trustmehub",
        name: "TrustMeHub",
        tagline: "Building Trust. Empowering Growth.",
        description: "Global digital trust infrastructure for instant credential verification",
        status: "published",
        accentColor: "#10B981",
        websiteUrl: "/products/trustmehub",
        features: ["15 Enterprise Features", "10 National Use Cases", "Pricing Page", "API Documentation"],
        createdAt: "2024-03-01",
    },
    {
        id: "boacrm",
        name: "BoaCRM",
        tagline: "The Operating System for Customer Relationships",
        description: "Enterprise CRM for African financial institutions",
        status: "published",
        accentColor: "#6366F1",
        websiteUrl: "/products",
        features: [],
        createdAt: "2024-03-15",
    },
];

export default function ProductsPage() {
    const { success, error } = useToast();
    const [products, setProducts] = React.useState<Product[]>(initialProducts);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const stats = {
        total: products.length,
        published: products.filter((p) => p.status === "published").length,
        featured: 1,
    };

    const columns: Column<Product>[] = [
        {
            key: "name",
            header: "Product",
            sortable: true,
            render: (product) => (
                <Link href={`/products/${product.id}`} className="flex items-center gap-3 group">
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: product.accentColor }}
                    />
                    <div>
                        <p className="font-medium text-zinc-900 dark:text-white group-hover:text-primary transition-colors">
                            {product.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {product.tagline}
                        </p>
                    </div>
                </Link>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (product) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${product.status === "published"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : product.status === "draft"
                            ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                >
                    {product.status}
                </span>
            ),
        },
        {
            key: "features",
            header: "Features",
            render: (product) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {product.features.length > 0 ? `${product.features.length} features` : "-"}
                </span>
            ),
        },
        {
            key: "websiteUrl",
            header: "Website",
            render: (product) => (
                <a
                    href={`https://drkatangablog.com${product.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                    View
                    <ExternalLink className="h-3 w-3" />
                </a>
            ),
        },
    ];

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteOpen(true);
    };

    const handleFormSubmit = async (data: ProductFormData) => {
        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (selectedProduct) {
                // Update existing product
                setProducts((prev) =>
                    prev.map((p) =>
                        p.id === selectedProduct.id
                            ? { ...p, ...data }
                            : p
                    )
                );
                success("Product updated", `${data.name} has been updated successfully.`);
            } else {
                // Create new product
                const newProduct: Product = {
                    ...data,
                    id: data.name.toLowerCase().replace(/\s+/g, "-"),
                    createdAt: new Date().toISOString(),
                };
                setProducts((prev) => [...prev, newProduct]);
                success("Product created", `${data.name} has been created successfully.`);
            }
            setIsFormOpen(false);
        } catch {
            error("Error", "Failed to save product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedProduct) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
            success("Product deleted", `${selectedProduct.name} has been deleted.`);
            setIsDeleteOpen(false);
            setSelectedProduct(null);
        } catch {
            error("Error", "Failed to delete product. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Products"
                description="Manage and monitor Global Digitalbit product offerings"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Products" },
                ]}
                actions={
                    <PageHeaderButton onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
                        Add Product
                    </PageHeaderButton>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatsCard
                        title="Total Products"
                        value={stats.total}
                        icon={<Package className="h-5 w-5" />}
                        variant="default"
                    />
                    <StatsCard
                        title="Published"
                        value={stats.published}
                        icon={<CheckCircle className="h-5 w-5" />}
                        variant="success"
                    />
                    <StatsCard
                        title="Featured"
                        value={stats.featured}
                        description="TrustMeHub"
                        icon={<Star className="h-5 w-5" />}
                        variant="primary"
                    />
                </div>

                {/* Products Table */}
                <DataTable
                    columns={columns}
                    data={products}
                    keyField="id"
                    searchPlaceholder="Search products..."
                    searchFields={["name", "tagline", "description"]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    actions={(product) => (
                        <Link href={`/products/${product.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4 text-zinc-500 hover:text-primary" />
                            </Button>
                        </Link>
                    )}
                />

                {/* TrustMeHub Highlight Section */}
                <div className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 text-white">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold mb-2">TrustMeHub - Featured Product</h2>
                        <p className="text-emerald-100 mb-6">
                            TrustMeHub is our flagship digital trust infrastructure with comprehensive
                            website content including 15 enterprise features, 10 national use cases
                            with ROI analysis, pricing comparison, and full API documentation.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">&lt;10ms</div>
                                <div className="text-sm text-emerald-200">Verification</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">99%</div>
                                <div className="text-sm text-emerald-200">Cost Reduction</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">$60B+</div>
                                <div className="text-sm text-emerald-200">Market Value</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">10</div>
                                <div className="text-sm text-emerald-200">Use Cases</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://drkatangablog.com/products/trustmehub"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                            >
                                View Product Page
                            </a>
                            <a
                                href="https://drkatangablog.com/products/trustmehub/pricing"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                            >
                                View Pricing
                            </a>
                            <a
                                href="https://drkatangablog.com/products/trustmehub/docs"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                            >
                                API Docs
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create/Edit Product Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={selectedProduct ? "Edit Product" : "Create Product"}
                description={
                    selectedProduct
                        ? "Update the product details below."
                        : "Fill in the details to create a new product."
                }
                size="lg"
            >
                <ProductForm
                    initialData={selectedProduct || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                    mode={selectedProduct ? "edit" : "create"}
                />
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Product"
                description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
