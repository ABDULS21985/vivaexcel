"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal, FormModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import { RedirectImport, type ImportedRedirect } from "@/components/redirects/redirect-import";
import { Button, Input, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ktblog/ui/components";
import {
    Plus,
    Search,
    ArrowRight,
    Pencil,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Upload,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Redirect {
    id: string;
    source: string;
    destination: string;
    type: "301" | "302";
    hits: number;
    isActive: boolean;
    createdAt: string;
    notes?: string;
}

const mockRedirects: Redirect[] = [
    {
        id: "r1",
        source: "/blog/old-article-slug",
        destination: "/blog/updated-article-slug",
        type: "301",
        hits: 342,
        isActive: true,
        createdAt: "2024-01-15T10:00:00Z",
        notes: "Updated slug after SEO optimization",
    },
    {
        id: "r2",
        source: "/about-us",
        destination: "/about",
        type: "301",
        hits: 1205,
        isActive: true,
        createdAt: "2023-11-20T14:30:00Z",
        notes: "Simplified URL structure",
    },
    {
        id: "r3",
        source: "/promo/summer-2024",
        destination: "/promotions",
        type: "302",
        hits: 89,
        isActive: true,
        createdAt: "2024-06-01T09:00:00Z",
        notes: "Temporary summer promotion redirect",
    },
    {
        id: "r4",
        source: "/blog/getting-started",
        destination: "/docs/quick-start",
        type: "301",
        hits: 567,
        isActive: true,
        createdAt: "2024-02-10T08:15:00Z",
    },
    {
        id: "r5",
        source: "/services/old-service",
        destination: "/services/new-service",
        type: "301",
        hits: 156,
        isActive: false,
        createdAt: "2023-09-05T16:00:00Z",
        notes: "Deprecated - service no longer exists",
    },
    {
        id: "r6",
        source: "/news",
        destination: "/blog",
        type: "301",
        hits: 2341,
        isActive: true,
        createdAt: "2023-06-15T12:00:00Z",
        notes: "Consolidated news into blog",
    },
    {
        id: "r7",
        source: "/contact-us",
        destination: "/contact",
        type: "301",
        hits: 890,
        isActive: true,
        createdAt: "2023-08-22T11:30:00Z",
    },
    {
        id: "r8",
        source: "/careers/2024",
        destination: "/careers",
        type: "302",
        hits: 45,
        isActive: true,
        createdAt: "2024-04-01T10:00:00Z",
        notes: "Year-specific careers page redirect",
    },
    {
        id: "r9",
        source: "/blog/category/tech",
        destination: "/blog?category=technology",
        type: "301",
        hits: 234,
        isActive: true,
        createdAt: "2024-01-05T09:00:00Z",
    },
    {
        id: "r10",
        source: "/old-landing",
        destination: "https://drkatangablog.com/",
        type: "301",
        hits: 78,
        isActive: false,
        createdAt: "2023-12-10T15:00:00Z",
        notes: "Old campaign landing page",
    },
    {
        id: "r11",
        source: "/pricing",
        destination: "/membership",
        type: "301",
        hits: 456,
        isActive: true,
        createdAt: "2024-03-20T08:00:00Z",
    },
    {
        id: "r12",
        source: "/login-redirect",
        destination: "/login",
        type: "302",
        hits: 123,
        isActive: true,
        createdAt: "2024-05-15T10:00:00Z",
    },
];

const PAGE_SIZE = 8;

export default function RedirectsPage() {
    const { success, error } = useToast();
    const [redirects, setRedirects] = React.useState<Redirect[]>(mockRedirects);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedRedirect, setSelectedRedirect] = React.useState<Redirect | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showImportModal, setShowImportModal] = React.useState(false);
    const [isImporting, setIsImporting] = React.useState(false);

    const filteredRedirects = React.useMemo(() => {
        return redirects.filter((r) => {
            const matchesSearch =
                r.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesType = typeFilter === "all" || r.type === typeFilter;
            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "active" && r.isActive) ||
                (statusFilter === "inactive" && !r.isActive);
            return matchesSearch && matchesType && matchesStatus;
        });
    }, [redirects, searchQuery, typeFilter, statusFilter]);

    const totalPages = Math.ceil(filteredRedirects.length / PAGE_SIZE);
    const paginatedRedirects = filteredRedirects.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, statusFilter]);

    const handleToggleActive = (redirect: Redirect) => {
        setRedirects((prev) =>
            prev.map((r) =>
                r.id === redirect.id ? { ...r, isActive: !r.isActive } : r
            )
        );
        success(
            redirect.isActive ? "Redirect disabled" : "Redirect enabled",
            `${redirect.source} has been ${redirect.isActive ? "disabled" : "enabled"}.`
        );
    };

    const handleDelete = (redirect: Redirect) => {
        setSelectedRedirect(redirect);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedRedirect) return;
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setRedirects((prev) => prev.filter((r) => r.id !== selectedRedirect.id));
            success("Redirect deleted", `Redirect for ${selectedRedirect.source} has been removed.`);
            setIsDeleteOpen(false);
            setSelectedRedirect(null);
        } catch {
            error("Error", "Failed to delete redirect.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImport = async (imported: ImportedRedirect[]) => {
        setIsImporting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const newRedirects: Redirect[] = imported.map((r, i) => ({
                id: `imported-${Date.now()}-${i}`,
                source: r.source,
                destination: r.destination,
                type: r.type,
                hits: 0,
                isActive: true,
                createdAt: new Date().toISOString(),
                notes: "Imported via CSV",
            }));
            setRedirects((prev) => [...newRedirects, ...prev]);
            success("Import complete", `${imported.length} redirect${imported.length !== 1 ? "s" : ""} have been imported.`);
            setShowImportModal(false);
        } catch {
            error("Import failed", "An error occurred during import.");
        } finally {
            setIsImporting(false);
        }
    };

    const existingSources = redirects.map((r) => r.source);

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Redirect Manager"
                description="Manage URL redirects for your site"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Redirects" },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={() => setShowImportModal(true)}>
                            <Upload className="h-4 w-4 mr-2" />
                            Import CSV
                        </Button>
                        <Link href="/redirects/new">
                            <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                                New Redirect
                            </PageHeaderButton>
                        </Link>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                            placeholder="Search redirects..."
                            className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="301">301</SelectItem>
                                <SelectItem value="302">302</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Redirects Table */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Source</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Destination</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Hits</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {paginatedRedirects.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-16 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                                    <ArrowRight className="h-6 w-6 text-zinc-400" />
                                                </div>
                                                <p className="text-zinc-600 dark:text-zinc-300 font-medium">No redirects found</p>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {searchQuery ? "Try adjusting your search." : "Create your first redirect to get started."}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedRedirects.map((redirect) => (
                                        <tr
                                            key={redirect.id}
                                            className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <code className="text-sm font-mono text-zinc-900 dark:text-white truncate max-w-[200px]">
                                                        {redirect.source}
                                                    </code>
                                                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                                                </div>
                                                {redirect.notes && (
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-[250px]">
                                                        {redirect.notes}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <code className="text-sm font-mono text-primary truncate max-w-[200px] block">
                                                    {redirect.destination}
                                                </code>
                                            </td>
                                            <td className="px-4 py-3 hidden md:table-cell">
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                                                    redirect.type === "301"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                                                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                                                }`}>
                                                    {redirect.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {redirect.hits.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 hidden lg:table-cell">
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                    {new Date(redirect.createdAt).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                                                    redirect.isActive
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
                                                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${redirect.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                                                    {redirect.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleToggleActive(redirect)}
                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                        title={redirect.isActive ? "Disable" : "Enable"}
                                                    >
                                                        {redirect.isActive ? (
                                                            <ToggleRight className="h-4 w-4 text-emerald-500" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <Link
                                                        href={`/redirects/new?edit=${redirect.id}`}
                                                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(redirect)}
                                                        className="p-1.5 text-zinc-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {filteredRedirects.length > PAGE_SIZE && (
                        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                Showing {((currentPage - 1) * PAGE_SIZE) + 1} to{" "}
                                {Math.min(currentPage * PAGE_SIZE, filteredRedirects.length)} of{" "}
                                {filteredRedirects.length} results
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <div className="flex items-center gap-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <Button
                                            key={i + 1}
                                            variant={currentPage === i + 1 ? "default" : "ghost"}
                                            size="sm"
                                            onClick={() => setCurrentPage(i + 1)}
                                            className="h-8 w-8 p-0"
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Redirects</p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{redirects.length}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{redirects.filter((r) => r.isActive).length}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Hits</p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{redirects.reduce((sum, r) => sum + r.hits, 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">301 / 302</p>
                        <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                            {redirects.filter((r) => r.type === "301").length} / {redirects.filter((r) => r.type === "302").length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Redirect"
                description={`Are you sure you want to delete the redirect for "${selectedRedirect?.source}"? This cannot be undone.`}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                variant="danger"
                confirmLabel="Delete Redirect"
            />

            {/* Import Modal */}
            <FormModal
                open={showImportModal}
                onOpenChange={setShowImportModal}
                title="Import Redirects"
                description="Upload a CSV file to bulk import redirect rules."
                size="lg"
            >
                <RedirectImport
                    onImport={handleImport}
                    existingSources={existingSources}
                    isLoading={isImporting}
                />
            </FormModal>
        </div>
    );
}
