"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { StatsCard } from "@/components/stats-card";
import { FormModal, ConfirmModal } from "@/components/modal";
import { ServiceForm, ServiceFormData } from "@/components/forms/service-form";
import { useToast } from "@/components/toast";
import { Plus, Wrench, CheckCircle, Folder, ExternalLink } from "lucide-react";

interface Service {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    status: "draft" | "published" | "archived";
    icon: string;
    features: string[];
    benefits: string[];
    createdAt: string;
}

const initialServices: Service[] = [
    {
        id: "ai-data",
        name: "AI & Data Services",
        slug: "ai-data",
        shortDescription: "Transform your business with intelligent AI and data-driven solutions",
        fullDescription: "Comprehensive AI and data analytics services to help organizations leverage their data assets.",
        category: "ai-data",
        status: "published",
        icon: "brain",
        features: ["Machine Learning", "Data Analytics", "Predictive Modeling", "NLP"],
        benefits: ["Improved decision making", "Automated processes", "Better insights"],
        createdAt: "2024-01-01",
    },
    {
        id: "cybersecurity",
        name: "Cybersecurity",
        slug: "cybersecurity",
        shortDescription: "Protect your digital assets with enterprise-grade security solutions",
        fullDescription: "End-to-end cybersecurity services to protect your organization from digital threats.",
        category: "cybersecurity",
        status: "published",
        icon: "shield",
        features: ["Threat Detection", "Penetration Testing", "Security Audits", "Compliance"],
        benefits: ["Enhanced security", "Risk mitigation", "Regulatory compliance"],
        createdAt: "2024-01-15",
    },
    {
        id: "governance",
        name: "IT Governance",
        slug: "governance",
        shortDescription: "Establish robust IT governance frameworks for your organization",
        fullDescription: "Strategic IT governance consulting to align technology with business objectives.",
        category: "governance",
        status: "published",
        icon: "building",
        features: ["Policy Development", "Risk Management", "Compliance", "Audit Support"],
        benefits: ["Better alignment", "Reduced risk", "Improved efficiency"],
        createdAt: "2024-02-01",
    },
    {
        id: "blockchain",
        name: "Blockchain Solutions",
        slug: "blockchain",
        shortDescription: "Build trust and transparency with distributed ledger technology",
        fullDescription: "Enterprise blockchain solutions for secure and transparent digital transactions.",
        category: "blockchain",
        status: "published",
        icon: "link",
        features: ["Smart Contracts", "DLT Implementation", "Tokenization", "CBDC"],
        benefits: ["Transparency", "Immutability", "Trust"],
        createdAt: "2024-02-15",
    },
    {
        id: "consulting",
        name: "Digital Consulting",
        slug: "consulting",
        shortDescription: "Strategic guidance for your digital transformation journey",
        fullDescription: "Expert consulting services to help navigate the complexities of digital transformation.",
        category: "consulting",
        status: "published",
        icon: "users",
        features: ["Strategy Development", "Process Optimization", "Change Management"],
        benefits: ["Clear roadmap", "Faster transformation", "Reduced costs"],
        createdAt: "2024-03-01",
    },
    {
        id: "training",
        name: "Professional Training",
        slug: "training",
        shortDescription: "Upskill your team with industry-leading training programs",
        fullDescription: "Comprehensive training programs to build digital capabilities within your organization.",
        category: "training",
        status: "published",
        icon: "book",
        features: ["Workshops", "Certifications", "Custom Programs", "E-Learning"],
        benefits: ["Skilled workforce", "Better retention", "Innovation culture"],
        createdAt: "2024-03-15",
    },
];

const categoryLabels: Record<string, string> = {
    "ai-data": "AI & Data",
    "cybersecurity": "Cybersecurity",
    "governance": "Governance",
    "blockchain": "Blockchain",
    "consulting": "Consulting",
    "training": "Training",
};

export default function ServicesPage() {
    const { success, error } = useToast();
    const [services, setServices] = React.useState<Service[]>(initialServices);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedService, setSelectedService] = React.useState<Service | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const stats = {
        total: services.length,
        published: services.filter((s) => s.status === "published").length,
        categories: new Set(services.map((s) => s.category)).size,
    };

    const columns: Column<Service>[] = [
        {
            key: "name",
            header: "Service",
            sortable: true,
            render: (service) => (
                <div>
                    <p className="font-medium text-zinc-900 dark:text-white">
                        {service.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {service.shortDescription}
                    </p>
                </div>
            ),
        },
        {
            key: "category",
            header: "Category",
            sortable: true,
            render: (service) => (
                <span className="px-2.5 py-1 text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 rounded-full">
                    {categoryLabels[service.category] || service.category}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (service) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        service.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : service.status === "draft"
                            ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                >
                    {service.status}
                </span>
            ),
        },
        {
            key: "features",
            header: "Features",
            render: (service) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {service.features.length} features
                </span>
            ),
        },
        {
            key: "slug",
            header: "Website",
            render: (service) => (
                <a
                    href={`https://drkatangablog.com/services/${service.slug}`}
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
        setSelectedService(null);
        setIsFormOpen(true);
    };

    const handleEdit = (service: Service) => {
        setSelectedService(service);
        setIsFormOpen(true);
    };

    const handleDelete = (service: Service) => {
        setSelectedService(service);
        setIsDeleteOpen(true);
    };

    const handleFormSubmit = async (data: ServiceFormData) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            if (selectedService) {
                setServices((prev) =>
                    prev.map((s) =>
                        s.id === selectedService.id
                            ? { ...s, ...data }
                            : s
                    )
                );
                success("Service updated", `${data.name} has been updated successfully.`);
            } else {
                const newService: Service = {
                    ...data,
                    id: data.slug,
                    createdAt: new Date().toISOString(),
                };
                setServices((prev) => [...prev, newService]);
                success("Service created", `${data.name} has been created successfully.`);
            }
            setIsFormOpen(false);
        } catch {
            error("Error", "Failed to save service. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedService) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            setServices((prev) => prev.filter((s) => s.id !== selectedService.id));
            success("Service deleted", `${selectedService.name} has been deleted.`);
            setIsDeleteOpen(false);
            setSelectedService(null);
        } catch {
            error("Error", "Failed to delete service. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Services"
                description="Manage Global Digitalbit service offerings"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Services" },
                ]}
                actions={
                    <PageHeaderButton onClick={handleCreate} icon={<Plus className="h-4 w-4" />}>
                        Add Service
                    </PageHeaderButton>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatsCard
                        title="Total Services"
                        value={stats.total}
                        icon={<Wrench className="h-5 w-5" />}
                        variant="default"
                    />
                    <StatsCard
                        title="Published"
                        value={stats.published}
                        icon={<CheckCircle className="h-5 w-5" />}
                        variant="success"
                    />
                    <StatsCard
                        title="Categories"
                        value={stats.categories}
                        icon={<Folder className="h-5 w-5" />}
                        variant="primary"
                    />
                </div>

                {/* Services Table */}
                <DataTable
                    columns={columns}
                    data={services}
                    keyField="id"
                    searchPlaceholder="Search services..."
                    searchFields={["name", "shortDescription", "category"]}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {/* Service Categories Overview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                        const categoryServices = services.filter((s) => s.category === key);
                        const colors: Record<string, string> = {
                            "ai-data": "from-blue-600 to-indigo-700",
                            "cybersecurity": "from-red-600 to-rose-700",
                            "governance": "from-purple-600 to-violet-700",
                            "blockchain": "from-emerald-600 to-teal-700",
                            "consulting": "from-amber-600 to-orange-700",
                            "training": "from-cyan-600 to-blue-700",
                        };
                        return (
                            <div
                                key={key}
                                className={`bg-gradient-to-r ${colors[key]} rounded-xl p-5 text-white`}
                            >
                                <h3 className="font-semibold mb-1">{label}</h3>
                                <p className="text-white/80 text-sm mb-3">
                                    {categoryServices.length} service{categoryServices.length !== 1 ? "s" : ""}
                                </p>
                                <a
                                    href={`https://drkatangablog.com/services/${key}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-white/90 hover:text-white"
                                >
                                    View on Website
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Create/Edit Service Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={selectedService ? "Edit Service" : "Create Service"}
                description={
                    selectedService
                        ? "Update the service details below."
                        : "Fill in the details to create a new service."
                }
                size="lg"
            >
                <ServiceForm
                    initialData={selectedService || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                    mode={selectedService ? "edit" : "create"}
                />
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleConfirmDelete}
                title="Delete Service"
                description={`Are you sure you want to delete "${selectedService?.name}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
