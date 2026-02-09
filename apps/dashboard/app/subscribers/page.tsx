"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { StatsCard } from "@/components/stats-card";
import { DataTable, Column } from "@/components/data-table";
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
} from "lucide-react";

interface Subscriber {
    id: string;
    email: string;
    name: string;
    tier: "free" | "basic" | "pro" | "premium";
    status: "active" | "inactive" | "churned";
    joinedAt: string;
}

const initialSubscribers: Subscriber[] = [
    { id: "1", email: "alice@example.com", name: "Alice Johnson", tier: "premium", status: "active", joinedAt: "2024-01-15" },
    { id: "2", email: "bob@example.com", name: "Bob Smith", tier: "pro", status: "active", joinedAt: "2024-02-03" },
    { id: "3", email: "carol@example.com", name: "Carol Davis", tier: "basic", status: "active", joinedAt: "2024-02-18" },
    { id: "4", email: "dan@example.com", name: "Dan Wilson", tier: "free", status: "active", joinedAt: "2024-03-01" },
    { id: "5", email: "eve@example.com", name: "Eve Martinez", tier: "pro", status: "inactive", joinedAt: "2024-01-20" },
    { id: "6", email: "frank@example.com", name: "Frank Lee", tier: "premium", status: "active", joinedAt: "2024-03-10" },
    { id: "7", email: "grace@example.com", name: "Grace Kim", tier: "basic", status: "churned", joinedAt: "2023-11-05" },
    { id: "8", email: "hank@example.com", name: "Hank Brown", tier: "free", status: "active", joinedAt: "2024-03-15" },
    { id: "9", email: "iris@example.com", name: "Iris Chen", tier: "pro", status: "active", joinedAt: "2024-02-28" },
    { id: "10", email: "jack@example.com", name: "Jack Taylor", tier: "premium", status: "active", joinedAt: "2024-01-08" },
];

const tierColors: Record<string, string> = {
    free: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    basic: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    premium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    inactive: "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    churned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function SubscribersPage() {
    const [subscribers] = React.useState<Subscriber[]>(initialSubscribers);
    const [tierFilter, setTierFilter] = React.useState("all");
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredSubscribers = React.useMemo(() => {
        return subscribers.filter((sub) => {
            const matchesTier = tierFilter === "all" || sub.tier === tierFilter;
            const matchesSearch =
                !searchQuery ||
                sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                sub.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTier && matchesSearch;
        });
    }, [subscribers, tierFilter, searchQuery]);

    const totalSubscribers = subscribers.length;
    const paidSubscribers = subscribers.filter(
        (s) => s.tier !== "free" && s.status === "active"
    ).length;
    const churnRate = (
        (subscribers.filter((s) => s.status === "churned").length / totalSubscribers) *
        100
    ).toFixed(1);
    const mrr = subscribers
        .filter((s) => s.status === "active")
        .reduce((sum, s) => {
            const prices: Record<string, number> = { free: 0, basic: 9, pro: 19, premium: 49 };
            return sum + (prices[s.tier] || 0);
        }, 0);

    const handleExportCSV = () => {
        const headers = ["Email", "Name", "Tier", "Status", "Joined Date"];
        const rows = filteredSubscribers.map((s) => [
            s.email,
            s.name,
            s.tier,
            s.status,
            s.joinedAt,
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

    const columns: Column<Subscriber>[] = [
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
            key: "tier",
            header: "Tier",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${tierColors[item.tier]}`}
                >
                    {item.tier}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            sortable: true,
            render: (item) => (
                <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[item.status]}`}
                >
                    {item.status}
                </span>
            ),
        },
        {
            key: "joinedAt",
            header: "Joined Date",
            sortable: true,
            render: (item) => (
                <span className="text-zinc-500 dark:text-zinc-400">
                    {new Date(item.joinedAt).toLocaleDateString()}
                </span>
            ),
        },
    ];

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
                        trend={{ value: 12, label: "vs last month" }}
                        variant="primary"
                    />
                    <StatsCard
                        title="Paid Subscribers"
                        value={paidSubscribers.toLocaleString()}
                        icon={<CreditCard className="h-5 w-5" />}
                        trend={{ value: 8, label: "vs last month" }}
                        variant="success"
                    />
                    <StatsCard
                        title="MRR"
                        value={`$${mrr.toLocaleString()}`}
                        icon={<DollarSign className="h-5 w-5" />}
                        trend={{ value: 15, label: "vs last month" }}
                        variant="warning"
                    />
                    <StatsCard
                        title="Churn Rate"
                        value={`${churnRate}%`}
                        icon={<TrendingDown className="h-5 w-5" />}
                        trend={{ value: -2, label: "vs last month", isPositive: true }}
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
                    <Select value={tierFilter} onValueChange={setTierFilter}>
                        <SelectTrigger className="w-full sm:w-40">
                            <SelectValue placeholder="Filter by tier" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tiers</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={filteredSubscribers}
                    keyField="id"
                    searchable={false}
                    emptyMessage="No subscribers found"
                    emptyDescription="Try adjusting your filters."
                />
            </div>
        </div>
    );
}
