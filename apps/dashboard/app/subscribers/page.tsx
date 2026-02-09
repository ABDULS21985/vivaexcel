"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { DataTable, Column } from "@/components/data-table";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    Users,
    CreditCard,
    DollarSign,
    TrendingDown,
    Download,
    Search,
    Loader2,
    AlertCircle,
    Trash2,
} from "lucide-react";
import {
    useNewsletterSubscribers,
    useNewsletterStats,
    useDeleteSubscriber,
    type NewsletterSubscriber,
} from "@/hooks/use-newsletter";

// Display interface that extends the API subscriber with extra display fields
interface DisplaySubscriber {
    id: string;
    email: string;
    name: string;
    status: "active" | "pending" | "unsubscribed";
    subscribedAt: string;
}

const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    unsubscribed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function SubscribersPage() {
    const { success, error: toastError } = useToast();

    // Filter state
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [searchQuery, setSearchQuery] = React.useState("");

    // Build filters for the API
    const apiFilters = React.useMemo(() => {
        const filters: { search?: string; status?: string } = {};
        if (searchQuery) filters.search = searchQuery;
        if (statusFilter !== "all") filters.status = statusFilter;
        return filters;
    }, [searchQuery, statusFilter]);

    // Fetch data from backend
    const { data: subscribers, isLoading: isLoadingSubscribers, error: subscribersError } = useNewsletterSubscribers(apiFilters);
    const { data: stats, isLoading: isLoadingStats, error: statsError } = useNewsletterStats();
    const deleteSubscriberMutation = useDeleteSubscriber();

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<DisplaySubscriber | null>(null);

    // Map API subscribers to display subscribers
    const displaySubscribers: DisplaySubscriber[] = React.useMemo(
        () =>
            (subscribers ?? []).map((s) => ({
                id: s.id,
                email: s.email,
                name: s.name ?? "",
                status: s.status,
                subscribedAt: s.subscribedAt,
            })),
        [subscribers]
    );

    // Stats from backend
    const totalSubscribers = stats?.totalSubscribers ?? 0;
    const activeSubscribers = stats?.activeSubscribers ?? 0;
    const pendingSubscribers = stats?.pendingSubscribers ?? 0;
    const unsubscribedCount = stats?.unsubscribedCount ?? 0;
    const churnRate = totalSubscribers > 0
        ? ((unsubscribedCount / totalSubscribers) * 100).toFixed(1)
        : "0.0";

    const handleExportCSV = () => {
        const headers = ["Email", "Name", "Status", "Subscribed Date"];
        const rows = displaySubscribers.map((s) => [
            s.email,
            s.name,
            s.status,
            s.subscribedAt,
        ]);
        const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "subscribers.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDelete = (subscriber: DisplaySubscriber) => {
        setDeleteTarget(subscriber);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        deleteSubscriberMutation.mutate(
            { id: deleteTarget.id },
            {
                onSuccess: () => {
                    success("Subscriber removed", `"${deleteTarget.email}" has been removed.`);
                    setIsDeleteOpen(false);
                    setDeleteTarget(null);
                },
                onError: () => {
                    toastError("Error", "Failed to remove subscriber.");
                },
            }
        );
    };

    const columns: Column<DisplaySubscriber>[] = [
        {
            key: "email",
            header: "Email",
            sortable: true,
            render: (item) => (
                <span className="font-medium text-zinc-900 dark:text-white">
                    {item.email}
                </span>
            ),
        },
        {
            key: "name",
            header: "Name",
            sortable: true,
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[item.status] ?? statusColors.pending}`}
                >
                    {item.status}
                </span>
            ),
        },
        {
            key: "subscribedAt",
            header: "Subscribed Date",
            sortable: true,
            render: (item) => (
                <span className="text-zinc-500 dark:text-zinc-400">
                    {new Date(item.subscribedAt).toLocaleDateString()}
                </span>
            ),
        },
    ];

    const isLoading = isLoadingSubscribers || isLoadingStats;
    const loadError = subscribersError || statsError;

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Subscribers"
                    description="Manage your blog subscribers and memberships"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Subscribers" },
                    ]}
                />
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    // Error state
    if (loadError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Subscribers"
                    description="Manage your blog subscribers and memberships"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Subscribers" },
                    ]}
                />
                <div className="flex flex-col items-center justify-center py-24 text-red-500">
                    <AlertCircle className="h-10 w-10 mb-4" />
                    <p className="text-lg font-medium">Failed to load subscribers</p>
                    <p className="text-sm text-zinc-500 mt-1">
                        {loadError.message || "An unexpected error occurred."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Subscribers"
                description="Manage your blog subscribers and memberships"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Subscribers" },
                ]}
                actions={
                    <Button onClick={handleExportCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatsCard
                        title="Total Subscribers"
                        value={totalSubscribers.toLocaleString()}
                        icon={<Users className="h-5 w-5" />}
                        trend={{ value: stats?.recentSubscriptions ?? 0, label: "recent" }}
                        variant="primary"
                    />
                    <StatsCard
                        title="Active Subscribers"
                        value={activeSubscribers.toLocaleString()}
                        icon={<CreditCard className="h-5 w-5" />}
                        variant="success"
                    />
                    <StatsCard
                        title="Pending"
                        value={pendingSubscribers.toLocaleString()}
                        icon={<DollarSign className="h-5 w-5" />}
                        variant="warning"
                    />
                    <StatsCard
                        title="Churn Rate"
                        value={`${churnRate}%`}
                        icon={<TrendingDown className="h-5 w-5" />}
                        trend={{ value: -Number(churnRate), label: "unsubscribed", isPositive: Number(churnRate) < 5 }}
                        variant="danger"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search by email or name..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={displaySubscribers}
                    keyField="id"
                    searchable={false}
                    emptyMessage="No subscribers found"
                    emptyDescription="Try adjusting your filters."
                    onDelete={handleDelete}
                />
            </div>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Remove Subscriber"
                description={`Are you sure you want to remove "${deleteTarget?.email}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                isLoading={deleteSubscriberMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
