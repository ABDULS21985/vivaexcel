"use client";

import * as React from "react";
import Link from "next/link";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@ktblog/ui/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash,
    Search,
    Loader2,
    Package,
    FileText,
    DollarSign,
    ChevronDown,
    ChevronUp,
    X,
} from "lucide-react";
import {
    useDocumentBundles,
    useDeleteBundle,
    type DocumentBundle,
} from "@/hooks/use-solution-documents";

export default function BundlesPage() {
    const { success, error: toastError } = useToast();
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedBundle, setSelectedBundle] = React.useState<DocumentBundle | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [expandedBundles, setExpandedBundles] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const apiFilters = React.useMemo(() => {
        const filters: Record<string, unknown> = {};
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== "all") filters.status = statusFilter;
        filters.sortBy = "createdAt";
        filters.sortOrder = "DESC";
        return filters;
    }, [debouncedSearch, statusFilter]);

    const { data: bundlesData, isLoading, error } = useDocumentBundles(apiFilters);
    const bundles = bundlesData?.items ?? [];
    const deleteMutation = useDeleteBundle();

    const toggleExpand = (id: string) => {
        setExpandedBundles((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleDelete = (bundle: DocumentBundle) => {
        setSelectedBundle(bundle);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = () => {
        if (!selectedBundle) return;
        deleteMutation.mutate(selectedBundle.id, {
            onSuccess: () => {
                success("Bundle deleted", "The bundle has been deleted successfully.");
                setIsDeleteOpen(false);
                setSelectedBundle(null);
            },
            onError: () => toastError("Error", "Failed to delete bundle."),
        });
    };

    const formatPrice = (price: number, currency: string) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(price);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
            draft: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
            archived: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
        };
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Document Bundles"
                description="Manage grouped solution document bundles"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Solutions", href: "/solutions" },
                    { label: "Bundles" },
                ]}
                backHref="/solutions"
                backLabel="Back to Solutions"
                actions={
                    <Link href="/solutions/bundles/new">
                        <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                            Create Bundle
                        </PageHeaderButton>
                    </Link>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Search & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input placeholder="Search bundles..." className="pl-9 bg-zinc-50 dark:bg-zinc-900" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading bundles...</p>
                    </div>
                )}

                {/* Error */}
                {!isLoading && error && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <X className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load bundles</h3>
                        <p className="text-zinc-500 mt-1">{error.message}</p>
                    </div>
                )}

                {/* Bundle List */}
                {!isLoading && !error && (
                    bundles.length > 0 ? (
                        <div className="space-y-4">
                            {bundles.map((bundle) => (
                                <div key={bundle.id} className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="flex items-center gap-4 p-5">
                                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Package className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <Link href={`/solutions/bundles/${bundle.id}`} className="text-lg font-semibold text-zinc-900 dark:text-white hover:text-primary transition-colors">
                                                    {bundle.name}
                                                </Link>
                                                {getStatusBadge(bundle.status)}
                                            </div>
                                            {bundle.description && (
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{bundle.description}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-6 flex-shrink-0">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">{bundle.documentCount}</p>
                                                <p className="text-xs text-zinc-500">Documents</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">{formatPrice(bundle.price, bundle.currency)}</p>
                                                <p className="text-xs text-zinc-500">Bundle Price</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{bundle.savingsPercent}%</p>
                                                <p className="text-xs text-zinc-500">Savings</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => toggleExpand(bundle.id)} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                    {expandedBundles.has(bundle.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                </button>
                                                <Link href={`/solutions/bundles/${bundle.id}`} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild><Link href={`/solutions/bundles/${bundle.id}`}><Pencil className="mr-2 h-4 w-4" />Edit</Link></DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(bundle)}><Trash className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded document list */}
                                    {expandedBundles.has(bundle.id) && bundle.documents?.length > 0 && (
                                        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-4">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Included Documents</p>
                                            <div className="space-y-2">
                                                {bundle.documents.map((doc) => (
                                                    <div key={doc.id} className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-800 rounded-lg">
                                                        <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/solutions/${doc.id}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors">
                                                                {doc.title}
                                                            </Link>
                                                            <p className="text-xs text-zinc-500">{doc.pageCount} pages</p>
                                                        </div>
                                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatPrice(doc.price, doc.currency)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <Package className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No bundles found</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">Create your first bundle to offer documents together at a discounted price.</p>
                            <Link href="/solutions/bundles/new"><Button className="mt-4"><Plus className="h-4 w-4 mr-2" />Create Bundle</Button></Link>
                        </div>
                    )
                )}
            </div>

            <ConfirmModal open={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Delete Bundle" description="Are you sure you want to delete this bundle? The documents inside will not be deleted." onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} variant="danger" />
        </div>
    );
}
