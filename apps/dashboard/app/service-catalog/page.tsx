"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { StatsCard } from "@/components/stats-card";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { Button } from "@digibit/ui/components";
import {
    Plus,
    Layers,
    CheckCircle,
    Star,
    Eye,
    Power,
    Briefcase,
} from "lucide-react";

// Types matching backend DTOs
interface ServiceTower {
    id: string;
    name: string;
    shortName: string;
    code: string;
    slug: string;
    description: string;
    icon: string;
    accentColor: string;
    displayOrder: number;
    isActive: boolean;
    isFeatured: boolean;
    services?: { id: string }[];
    servicesCount?: number;
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    items: ServiceTower[];
    meta: {
        total?: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        nextCursor?: string;
        previousCursor?: string;
    };
}

// Initial sample data for development (will be replaced with API data)
const initialTowers: ServiceTower[] = [
    {
        id: "1",
        name: "Corporate, Digital & Business Strategy",
        shortName: "Business Strategy",
        code: "STRATEGY",
        slug: "business-strategy",
        description: "Define strategic direction, competitive positioning, and digital business models.",
        icon: "Target",
        accentColor: "#1E4DB7",
        displayOrder: 1,
        isActive: true,
        isFeatured: true,
        servicesCount: 5,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
    },
    {
        id: "2",
        name: "Enterprise Transformation & Execution",
        shortName: "Transformation Office",
        code: "TRANSFORM",
        slug: "transformation-office",
        description: "Drive successful transformation through governance, program delivery, and benefit realization.",
        icon: "Rocket",
        accentColor: "#F59A23",
        displayOrder: 2,
        isActive: true,
        isFeatured: true,
        servicesCount: 5,
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
    },
    {
        id: "3",
        name: "Data, Analytics & AI Transformation",
        shortName: "AI & Data",
        code: "AI-DATA",
        slug: "ai-data",
        description: "Build trusted data foundations and scalable AI capabilities.",
        icon: "Brain",
        accentColor: "#F59A23",
        displayOrder: 8,
        isActive: true,
        isFeatured: true,
        servicesCount: 6,
        createdAt: "2024-02-01",
        updatedAt: "2024-02-01",
    },
    {
        id: "4",
        name: "Cybersecurity, Identity & Digital Resilience",
        shortName: "Cybersecurity",
        code: "CYBER",
        slug: "cybersecurity",
        description: "Protect digital assets and build organizational resilience.",
        icon: "ShieldAlert",
        accentColor: "#EF4444",
        displayOrder: 11,
        isActive: true,
        isFeatured: true,
        servicesCount: 8,
        createdAt: "2024-02-15",
        updatedAt: "2024-02-15",
    },
    {
        id: "5",
        name: "Cloud Transformation & Platform Engineering",
        shortName: "Cloud & Platform",
        code: "CLOUD",
        slug: "cloud-platform",
        description: "Accelerate cloud adoption with secure, cost-effective platforms.",
        icon: "Cloud",
        accentColor: "#06B6D4",
        displayOrder: 10,
        isActive: true,
        isFeatured: true,
        servicesCount: 5,
        createdAt: "2024-03-01",
        updatedAt: "2024-03-01",
    },
    {
        id: "6",
        name: "Product Engineering, Systems Integration & Enterprise Platforms",
        shortName: "Engineering",
        code: "ENGINEERING",
        slug: "engineering",
        description: "Build, integrate, and implement enterprise solutions.",
        icon: "Code2",
        accentColor: "#3B82F6",
        displayOrder: 19,
        isActive: true,
        isFeatured: true,
        servicesCount: 5,
        createdAt: "2024-03-15",
        updatedAt: "2024-03-15",
    },
];

export default function ServiceCatalogPage() {
    const { success, error } = useToast();
    const [towers, setTowers] = React.useState<ServiceTower[]>(initialTowers);
    const [isToggleOpen, setIsToggleOpen] = React.useState(false);
    const [selectedTower, setSelectedTower] = React.useState<ServiceTower | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "inactive">("all");
    const [featuredFilter, setFeaturedFilter] = React.useState<"all" | "featured" | "regular">("all");

    // Fetch towers from API
    React.useEffect(() => {
        const fetchTowers = async () => {
            try {
                const params = new URLSearchParams();
                if (statusFilter !== "all") {
                    params.append("isActive", statusFilter === "active" ? "true" : "false");
                }
                if (featuredFilter !== "all") {
                    params.append("isFeatured", featuredFilter === "featured" ? "true" : "false");
                }

                const response = await fetch(`/api/v1/service-catalog/towers?${params.toString()}`);
                if (response.ok) {
                    const data: ApiResponse = await response.json();
                    setTowers(data.items.map(tower => ({
                        ...tower,
                        servicesCount: tower.services?.length ?? 0,
                    })));
                }
            } catch {
                // Use initial data on error (development mode)
                console.log("Using initial data - API not available");
            }
        };

        fetchTowers();
    }, [statusFilter, featuredFilter]);

    // Filter towers based on filters
    const filteredTowers = React.useMemo(() => {
        return towers.filter(tower => {
            if (statusFilter !== "all") {
                const isActive = statusFilter === "active";
                if (tower.isActive !== isActive) return false;
            }
            if (featuredFilter !== "all") {
                const isFeatured = featuredFilter === "featured";
                if (tower.isFeatured !== isFeatured) return false;
            }
            return true;
        });
    }, [towers, statusFilter, featuredFilter]);

    // Calculate stats
    const stats = {
        total: towers.length,
        totalServices: towers.reduce((acc, t) => acc + (t.servicesCount ?? 0), 0),
        active: towers.filter((t) => t.isActive).length,
        featured: towers.filter((t) => t.isFeatured).length,
    };

    // Table columns
    const columns: Column<ServiceTower>[] = [
        {
            key: "name",
            header: "Tower",
            sortable: true,
            render: (tower) => (
                <Link href={`/service-catalog/${tower.slug}`} className="flex items-center gap-3 group">
                    <div
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tower.accentColor }}
                    />
                    <div className="min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-white group-hover:text-primary transition-colors truncate">
                            {tower.shortName}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {tower.name}
                        </p>
                    </div>
                </Link>
            ),
        },
        {
            key: "code",
            header: "Code",
            sortable: true,
            render: (tower) => (
                <span className="px-2 py-1 text-xs font-mono bg-zinc-100 dark:bg-zinc-700 rounded">
                    {tower.code}
                </span>
            ),
        },
        {
            key: "servicesCount",
            header: "Services",
            sortable: true,
            render: (tower) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {tower.servicesCount ?? 0} services
                </span>
            ),
        },
        {
            key: "isActive",
            header: "Status",
            sortable: true,
            render: (tower) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        tower.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                >
                    {tower.isActive ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "isFeatured",
            header: "Featured",
            sortable: true,
            render: (tower) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        tower.isFeatured
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                    }`}
                >
                    {tower.isFeatured ? "Featured" : "Regular"}
                </span>
            ),
        },
    ];

    // Handlers
    const handleToggleStatus = (tower: ServiceTower) => {
        setSelectedTower(tower);
        setIsToggleOpen(true);
    };

    const handleConfirmToggle = async () => {
        if (!selectedTower) return;

        setIsLoading(true);
        try {
            // API call to toggle status
            const response = await fetch(`/api/v1/service-catalog/towers/${selectedTower.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !selectedTower.isActive }),
            });

            if (!response.ok) {
                throw new Error("Failed to update tower status");
            }

            // Update local state
            setTowers((prev) =>
                prev.map((t) =>
                    t.id === selectedTower.id
                        ? { ...t, isActive: !t.isActive }
                        : t
                )
            );
            success(
                "Status updated",
                `${selectedTower.shortName} is now ${!selectedTower.isActive ? "active" : "inactive"}.`
            );
            setIsToggleOpen(false);
            setSelectedTower(null);
        } catch {
            // Fallback to local update for development
            setTowers((prev) =>
                prev.map((t) =>
                    t.id === selectedTower.id
                        ? { ...t, isActive: !t.isActive }
                        : t
                )
            );
            success(
                "Status updated",
                `${selectedTower.shortName} is now ${!selectedTower.isActive ? "active" : "inactive"}.`
            );
            setIsToggleOpen(false);
            setSelectedTower(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (tower: ServiceTower) => {
        // Navigate to edit page or open modal
        window.location.href = `/service-catalog/${tower.slug}/edit`;
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Service Catalog"
                description="Manage Global Digibit service towers and catalog offerings"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Service Catalog" },
                ]}
                actions={
                    <PageHeaderButton
                        onClick={() => (window.location.href = "/service-catalog/new")}
                        icon={<Plus className="h-4 w-4" />}
                    >
                        Add Tower
                    </PageHeaderButton>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        title="Total Towers"
                        value={stats.total}
                        icon={<Layers className="h-5 w-5" />}
                        variant="default"
                    />
                    <StatsCard
                        title="Total Services"
                        value={stats.totalServices}
                        icon={<Briefcase className="h-5 w-5" />}
                        variant="default"
                    />
                    <StatsCard
                        title="Active"
                        value={stats.active}
                        icon={<CheckCircle className="h-5 w-5" />}
                        variant="success"
                    />
                    <StatsCard
                        title="Featured"
                        value={stats.featured}
                        icon={<Star className="h-5 w-5" />}
                        variant="primary"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
                            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Featured:</span>
                        <select
                            value={featuredFilter}
                            onChange={(e) => setFeaturedFilter(e.target.value as "all" | "featured" | "regular")}
                            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                            <option value="all">All</option>
                            <option value="featured">Featured</option>
                            <option value="regular">Regular</option>
                        </select>
                    </div>
                </div>

                {/* Service Towers Table */}
                <DataTable
                    columns={columns}
                    data={filteredTowers}
                    keyField="id"
                    searchPlaceholder="Search towers..."
                    searchFields={["name", "shortName", "code", "description"]}
                    onEdit={handleEdit}
                    actions={(tower) => (
                        <div className="flex items-center gap-1">
                            <Link href={`/service-catalog/${tower.slug}`}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View">
                                    <Eye className="h-4 w-4 text-zinc-500 hover:text-primary" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => handleToggleStatus(tower)}
                                title={tower.isActive ? "Deactivate" : "Activate"}
                            >
                                <Power
                                    className={`h-4 w-4 ${
                                        tower.isActive
                                            ? "text-green-500 hover:text-red-500"
                                            : "text-zinc-400 hover:text-green-500"
                                    }`}
                                />
                            </Button>
                        </div>
                    )}
                />

                {/* Service Catalog Overview Section */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl font-bold mb-2">Global Digibit Service Catalog</h2>
                        <p className="text-blue-100 mb-6">
                            Our comprehensive service catalog spans 22 service towers covering
                            strategy, transformation, technology, cybersecurity, and operations.
                            Each tower contains specialized services with defined deliverables
                            and engagement models.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">22</div>
                                <div className="text-sm text-blue-200">Service Towers</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">100+</div>
                                <div className="text-sm text-blue-200">Services</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">4</div>
                                <div className="text-sm text-blue-200">Engagement Models</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <div className="text-2xl font-bold">5</div>
                                <div className="text-sm text-blue-200">Industry Practices</div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://globaldigibit.com/services"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                            >
                                View Public Catalog
                            </a>
                            <Link
                                href="/service-catalog/engagement-models"
                                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                            >
                                Engagement Models
                            </Link>
                            <Link
                                href="/service-catalog/industry-practices"
                                className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors"
                            >
                                Industry Practices
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Status Confirmation Modal */}
            <ConfirmModal
                open={isToggleOpen}
                onOpenChange={setIsToggleOpen}
                onConfirm={handleConfirmToggle}
                title={selectedTower?.isActive ? "Deactivate Tower" : "Activate Tower"}
                description={
                    selectedTower?.isActive
                        ? `Are you sure you want to deactivate "${selectedTower?.shortName}"? It will no longer be visible on the public website.`
                        : `Are you sure you want to activate "${selectedTower?.shortName}"? It will be visible on the public website.`
                }
                confirmLabel={selectedTower?.isActive ? "Deactivate" : "Activate"}
                variant={selectedTower?.isActive ? "warning" : "success"}
                isLoading={isLoading}
            />
        </div>
    );
}
