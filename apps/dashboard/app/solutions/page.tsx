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
    LayoutGrid,
    List,
    ArrowUpDown,
    Filter,
    X,
    Loader2,
    Download,
    Eye,
    Trash2,
    CheckCircle,
    FileText,
    Layers,
    Brain,
    RefreshCw,
    BarChart3,
    FileDown,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    Package,
} from "lucide-react";
import {
    useSolutionDocuments,
    useSolutionDocumentStats,
    useDeleteSolutionDocument,
    useAnalyzeDocument,
    useBulkDeleteDocuments,
    useBulkAnalyzeDocuments,
    type SolutionDocument,
    type DocumentType,
    type Domain,
    type MaturityLevel,
    type CloudPlatform,
    type ComplianceFramework,
    type TemplateFormat,
} from "@/hooks/use-solution-documents";

type ViewMode = "grid" | "table";
type SortOption =
    | "newest"
    | "oldest"
    | "price-high"
    | "price-low"
    | "pages-most"
    | "downloads";

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    architecture_design: "Architecture Design",
    system_design: "System Design",
    api_specification: "API Specification",
    database_design: "Database Design",
    infrastructure: "Infrastructure",
    security_design: "Security Design",
    integration_design: "Integration Design",
    migration_plan: "Migration Plan",
    disaster_recovery: "Disaster Recovery",
    network_design: "Network Design",
    data_flow: "Data Flow",
    other: "Other",
};

const DOCUMENT_TYPE_COLORS: Record<DocumentType, string> = {
    architecture_design: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    system_design: "bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300",
    api_specification: "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300",
    database_design: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    infrastructure: "bg-cyan-100/90 text-cyan-700 dark:bg-cyan-900/80 dark:text-cyan-300",
    security_design: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    integration_design: "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
    migration_plan: "bg-orange-100/90 text-orange-700 dark:bg-orange-900/80 dark:text-orange-300",
    disaster_recovery: "bg-rose-100/90 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300",
    network_design: "bg-teal-100/90 text-teal-700 dark:bg-teal-900/80 dark:text-teal-300",
    data_flow: "bg-violet-100/90 text-violet-700 dark:bg-violet-900/80 dark:text-violet-300",
    other: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const DOMAIN_LABELS: Record<Domain, string> = {
    fintech: "Fintech",
    healthtech: "Healthtech",
    edtech: "Edtech",
    ecommerce: "E-Commerce",
    saas: "SaaS",
    iot: "IoT",
    ai_ml: "AI/ML",
    cybersecurity: "Cybersecurity",
    cloud_infrastructure: "Cloud Infra",
    devops: "DevOps",
    mobile: "Mobile",
    blockchain: "Blockchain",
    other: "Other",
};

const DOMAIN_COLORS: Record<Domain, string> = {
    fintech: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
    healthtech: "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300",
    edtech: "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
    ecommerce: "bg-orange-100/90 text-orange-700 dark:bg-orange-900/80 dark:text-orange-300",
    saas: "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    iot: "bg-cyan-100/90 text-cyan-700 dark:bg-cyan-900/80 dark:text-cyan-300",
    ai_ml: "bg-violet-100/90 text-violet-700 dark:bg-violet-900/80 dark:text-violet-300",
    cybersecurity: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
    cloud_infrastructure: "bg-sky-100/90 text-sky-700 dark:bg-sky-900/80 dark:text-sky-300",
    devops: "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    mobile: "bg-pink-100/90 text-pink-700 dark:bg-pink-900/80 dark:text-pink-300",
    blockchain: "bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/80 dark:text-indigo-300",
    other: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const MATURITY_LABELS: Record<MaturityLevel, string> = {
    starter: "Starter",
    intermediate: "Intermediate",
    enterprise: "Enterprise",
};

const CLOUD_PLATFORM_LABELS: Record<CloudPlatform, string> = {
    aws: "AWS",
    azure: "Azure",
    gcp: "GCP",
    multi_cloud: "Multi-Cloud",
    on_premise: "On-Premise",
};

const COMPLIANCE_LABELS: Record<ComplianceFramework, string> = {
    soc2: "SOC2",
    hipaa: "HIPAA",
    gdpr: "GDPR",
    iso27001: "ISO 27001",
    pci_dss: "PCI-DSS",
};

const TEMPLATE_FORMAT_LABELS: Record<TemplateFormat, string> = {
    docx: "DOCX",
    pdf: "PDF",
    notion: "Notion",
    confluence: "Confluence",
    markdown: "Markdown",
};

export default function SolutionsPage() {
    const { success, error: toastError } = useToast();
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedDocument, setSelectedDocument] = React.useState<SolutionDocument | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [documentTypeFilter, setDocumentTypeFilter] = React.useState("all");
    const [domainFilter, setDomainFilter] = React.useState("all");
    const [maturityFilter, setMaturityFilter] = React.useState("all");
    const [cloudPlatformFilter, setCloudPlatformFilter] = React.useState("all");
    const [complianceFilter, setComplianceFilter] = React.useState("all");
    const [templateFormatFilter, setTemplateFormatFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>("table");
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [isBulkLoading, setIsBulkLoading] = React.useState(false);
    const [cursor, setCursor] = React.useState<string | undefined>(undefined);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Build API filters
    const apiFilters = React.useMemo(() => {
        const filters: Record<string, unknown> = {};
        if (debouncedSearch) filters.search = debouncedSearch;
        if (statusFilter !== "all") filters.status = statusFilter;
        if (documentTypeFilter !== "all") filters.documentType = documentTypeFilter;
        if (domainFilter !== "all") filters.domain = domainFilter;
        if (maturityFilter !== "all") filters.maturityLevel = maturityFilter;
        if (cloudPlatformFilter !== "all") filters.cloudPlatform = cloudPlatformFilter;
        if (complianceFilter !== "all") filters.complianceFramework = complianceFilter;
        if (templateFormatFilter !== "all") filters.templateFormat = templateFormatFilter;
        if (cursor) filters.cursor = cursor;
        if (sortOption === "newest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "DESC";
        } else if (sortOption === "oldest") {
            filters.sortBy = "createdAt";
            filters.sortOrder = "ASC";
        } else if (sortOption === "price-high") {
            filters.sortBy = "price";
            filters.sortOrder = "DESC";
        } else if (sortOption === "price-low") {
            filters.sortBy = "price";
            filters.sortOrder = "ASC";
        } else if (sortOption === "pages-most") {
            filters.sortBy = "pageCount";
            filters.sortOrder = "DESC";
        } else if (sortOption === "downloads") {
            filters.sortBy = "downloadCount";
            filters.sortOrder = "DESC";
        }
        return filters;
    }, [debouncedSearch, statusFilter, documentTypeFilter, domainFilter, maturityFilter, cloudPlatformFilter, complianceFilter, templateFormatFilter, sortOption, cursor]);

    // Fetch data
    const { data: documentsData, isLoading: isLoadingDocuments, error: documentsError } = useSolutionDocuments(apiFilters);
    const documents = documentsData?.items ?? [];
    const meta = documentsData?.meta;
    const { data: statsData, isLoading: isLoadingStats } = useSolutionDocumentStats();

    // Mutations
    const deleteMutation = useDeleteSolutionDocument();
    const analyzeMutation = useAnalyzeDocument();
    const bulkDeleteMutation = useBulkDeleteDocuments();
    const bulkAnalyzeMutation = useBulkAnalyzeDocuments();

    // Bulk selection helpers
    const isAllSelected = documents.length > 0 && documents.every((d) => selectedIds.has(d.id));
    const isSomeSelected = documents.some((d) => selectedIds.has(d.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(documents.map((d) => d.id)));
        }
    };

    const toggleSelectDocument = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
    };

    // Actions
    const handleAnalyze = (doc: SolutionDocument) => {
        analyzeMutation.mutate(doc.id, {
            onSuccess: () => {
                success("Analysis started", `AI analysis for "${doc.title}" has been triggered.`);
            },
            onError: () => {
                toastError("Error", "Failed to start AI analysis.");
            },
        });
    };

    const handleDelete = (doc: SolutionDocument) => {
        setSelectedDocument(doc);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedDocument) return;
        deleteMutation.mutate(selectedDocument.id, {
            onSuccess: () => {
                success("Document deleted", "The solution document has been deleted successfully.");
                setIsDeleteOpen(false);
                setSelectedDocument(null);
            },
            onError: () => {
                toastError("Error", "Failed to delete document.");
            },
        });
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        setIsBulkLoading(true);
        const ids = Array.from(selectedIds);
        bulkDeleteMutation.mutate(ids, {
            onSuccess: () => {
                success("Documents deleted", `${ids.length} documents have been deleted.`);
                clearSelection();
                setIsBulkLoading(false);
            },
            onError: () => {
                toastError("Error", "Failed to delete selected documents.");
                setIsBulkLoading(false);
            },
        });
    };

    const handleBulkAnalyze = async () => {
        setIsBulkLoading(true);
        const ids = Array.from(selectedIds);
        bulkAnalyzeMutation.mutate(ids, {
            onSuccess: (result) => {
                success("Analysis started", `AI analysis triggered for ${result.analyzed} documents.`);
                clearSelection();
                setIsBulkLoading(false);
            },
            onError: () => {
                toastError("Error", "Failed to analyze selected documents.");
                setIsBulkLoading(false);
            },
        });
    };

    const handleExportCsv = () => {
        const selected = documents.filter((d) => selectedIds.has(d.id));
        const headers = ["Title", "Type", "Domain", "Maturity", "Pages", "Formats", "Price", "Status", "Created"];
        const rows = selected.map((d) => [
            `"${d.title}"`,
            DOCUMENT_TYPE_LABELS[d.documentType] || d.documentType,
            DOMAIN_LABELS[d.domain] || d.domain,
            MATURITY_LABELS[d.maturityLevel] || d.maturityLevel,
            d.pageCount,
            d.templateFormats?.join("; ") || "",
            d.price,
            d.status,
            d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "",
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `solution-documents-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        success("Export complete", "CSV file has been downloaded.");
    };

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("all");
        setDocumentTypeFilter("all");
        setDomainFilter("all");
        setMaturityFilter("all");
        setCloudPlatformFilter("all");
        setComplianceFilter("all");
        setTemplateFormatFilter("all");
        setSortOption("newest");
        setCursor(undefined);
    };

    const hasActiveFilters =
        statusFilter !== "all" ||
        documentTypeFilter !== "all" ||
        domainFilter !== "all" ||
        maturityFilter !== "all" ||
        cloudPlatformFilter !== "all" ||
        complianceFilter !== "all" ||
        templateFormatFilter !== "all";

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published: "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
            draft: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
            archived: "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
        };
        const labels: Record<string, string> = { published: "Published", draft: "Draft", archived: "Archived" };
        return (
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getTypeBadge = (documentType: DocumentType) => (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${DOCUMENT_TYPE_COLORS[documentType] || ""}`}>
            {DOCUMENT_TYPE_LABELS[documentType] || documentType}
        </span>
    );

    const getDomainBadge = (domain: Domain) => (
        <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${DOMAIN_COLORS[domain] || ""}`}>
            {DOMAIN_LABELS[domain] || domain}
        </span>
    );

    const getFreshnessBadge = (score?: number | null) => {
        if (score == null) return null;
        const color = score >= 80 ? "text-green-600 dark:text-green-400" : score >= 50 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400";
        return <span className={`text-[10px] font-bold ${color}`}>{score}%</span>;
    };

    const formatPrice = (price: number, currency: string) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(price);

    // Pagination handlers
    const handleNextPage = () => {
        if (meta?.nextCursor) setCursor(meta.nextCursor);
    };
    const handlePrevPage = () => {
        if (meta?.previousCursor) setCursor(meta.previousCursor);
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Solution Documents"
                description="Manage your SDD marketplace solution design documents"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Solutions" },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <Link href="/solutions/bundles">
                            <PageHeaderButton variant="outline" icon={<Package className="h-4 w-4" />}>
                                Bundles
                            </PageHeaderButton>
                        </Link>
                        <Link href="/solutions/analytics">
                            <PageHeaderButton variant="outline" icon={<BarChart3 className="h-4 w-4" />}>
                                Analytics
                            </PageHeaderButton>
                        </Link>
                        <Link href="/solutions/new">
                            <PageHeaderButton icon={<Plus className="h-4 w-4" />}>
                                Upload Document
                            </PageHeaderButton>
                        </Link>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.totalDocuments ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Documents</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.totalBundles ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Bundles</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.averagePageCount ?? 0).toFixed(1)
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Avg Page Count</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.aiAnalyzedCount ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">AI Analyzed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search, Filters, and View Toggle */}
                <div className="space-y-4 bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                placeholder="Search solution documents..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select value={documentTypeFilter} onValueChange={setDocumentTypeFilter}>
                                <SelectTrigger className="w-[170px]">
                                    <SelectValue placeholder="Document Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {Object.entries(DOCUMENT_TYPE_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={domainFilter} onValueChange={setDomainFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Domains</SelectItem>
                                    {Object.entries(DOMAIN_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={maturityFilter} onValueChange={setMaturityFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Maturity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    {Object.entries(MATURITY_LABELS).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="price-high">Price: High</SelectItem>
                                    <SelectItem value="price-low">Price: Low</SelectItem>
                                    <SelectItem value="pages-most">Most Pages</SelectItem>
                                    <SelectItem value="downloads">Most Downloads</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={showAdvancedFilters ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className="h-10"
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-1.5 h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">!</span>
                                )}
                            </Button>

                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-colors ${viewMode === "grid" ? "bg-primary text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 transition-colors ${viewMode === "table" ? "bg-primary text-white" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}
                                    title="Table view"
                                >
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced filters row */}
                    {showAdvancedFilters && (
                        <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Cloud Platform</label>
                                <Select value={cloudPlatformFilter} onValueChange={setCloudPlatformFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Platforms" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Platforms</SelectItem>
                                        {Object.entries(CLOUD_PLATFORM_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Compliance</label>
                                <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Frameworks" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Frameworks</SelectItem>
                                        {Object.entries(COMPLIANCE_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Template Format</label>
                                <Select value={templateFormatFilter} onValueChange={setTemplateFormatFilter}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Formats" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Formats</SelectItem>
                                        {Object.entries(TEMPLATE_FORMAT_LABELS).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-10">
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {isLoadingDocuments && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading solution documents...</p>
                    </div>
                )}

                {/* Error state */}
                {!isLoadingDocuments && documentsError && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load documents</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {documentsError.message || "An error occurred while fetching solution documents."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoadingDocuments && !documentsError && (
                    <>
                        {/* Bulk select header */}
                        {documents.length > 0 && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => { if (el) el.indeterminate = isSomeSelected && !isAllSelected; }}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium">{isAllSelected ? "Deselect all" : "Select all"}</span>
                                </label>
                                <span className="text-zinc-400">
                                    {meta?.total ?? documents.length} document{(meta?.total ?? documents.length) !== 1 ? "s" : ""}
                                </span>
                                {selectedIds.size > 0 && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">{selectedIds.size} selected</span>
                                )}
                            </div>
                        )}

                        {/* Grid or Table */}
                        {documents.length > 0 ? (
                            viewMode === "grid" ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {documents.map((doc) => (
                                        <div key={doc.id} className="group relative flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-300">
                                            <div className="absolute top-3 left-3 z-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(doc.id)}
                                                    onChange={() => toggleSelectDocument(doc.id)}
                                                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary bg-white/80 backdrop-blur-sm cursor-pointer"
                                                />
                                            </div>
                                            {doc.isAiAnalyzed && (
                                                <div className="absolute top-3 right-12 z-10">
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500 text-white uppercase">AI Analyzed</span>
                                                </div>
                                            )}
                                            <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                                {doc.coverImageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={doc.coverImageUrl} alt={doc.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                        <FileText className="h-8 w-8 opacity-50" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3">{getStatusBadge(doc.status)}</div>
                                                <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                                                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/60 text-white">{doc.pageCount} pages</span>
                                                    {doc.diagramCount > 0 && (
                                                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/60 text-white">{doc.diagramCount} diagrams</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 p-5 flex flex-col space-y-3">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {getTypeBadge(doc.documentType)}
                                                        {getDomainBadge(doc.domain)}
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                        {doc.title}
                                                    </h3>
                                                    {doc.shortDescription && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{doc.shortDescription}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">{formatPrice(doc.price, doc.currency)}</span>
                                                    {doc.compareAtPrice && doc.compareAtPrice > doc.price && (
                                                        <span className="text-sm text-zinc-400 line-through">{formatPrice(doc.compareAtPrice, doc.currency)}</span>
                                                    )}
                                                    {getFreshnessBadge(doc.freshnessScore)}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span className="flex items-center gap-1"><Download className="h-3 w-3" />{doc.downloadCount.toLocaleString()}</span>
                                                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{doc.viewCount.toLocaleString()}</span>
                                                    <span className="uppercase text-[10px] font-medium">{MATURITY_LABELS[doc.maturityLevel]}</span>
                                                </div>
                                                <div className="pt-4 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        {doc.createdAt && <span>{new Date(doc.createdAt).toLocaleDateString()}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Link href={`/solutions/${doc.id}`} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleAnalyze(doc)}>
                                                                    <Sparkles className="mr-2 h-4 w-4" />AI Analyze
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(doc)}>
                                                                    <Trash className="mr-2 h-4 w-4" />Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                    <th className="w-10 px-4 py-3">
                                                        <input type="checkbox" checked={isAllSelected} ref={(el) => { if (el) el.indeterminate = isSomeSelected && !isAllSelected; }} onChange={toggleSelectAll} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" />
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Document</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Type</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Domain</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Pages</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Formats</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Price</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">Freshness</th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">Updated</th>
                                                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {documents.map((doc) => (
                                                    <tr key={doc.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                                        <td className="w-10 px-4 py-3">
                                                            <input type="checkbox" checked={selectedIds.has(doc.id)} onChange={() => toggleSelectDocument(doc.id)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {doc.coverImageUrl ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img src={doc.coverImageUrl} alt="" className="h-10 w-14 rounded object-cover flex-shrink-0 hidden sm:block" />
                                                                ) : (
                                                                    <div className="h-10 w-14 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 hidden sm:block">
                                                                        <FileText className="h-4 w-4 text-zinc-400" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <Link href={`/solutions/${doc.id}`} className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1">
                                                                        {doc.title}
                                                                    </Link>
                                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                                        <span className="truncate">/{doc.slug}</span>
                                                                        {doc.isAiAnalyzed && (
                                                                            <span className="px-1 py-0.5 text-[8px] font-bold rounded bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">AI</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 hidden md:table-cell">{getTypeBadge(doc.documentType)}</td>
                                                        <td className="px-4 py-3 hidden md:table-cell">{getDomainBadge(doc.domain)}</td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">{doc.pageCount}</span>
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <div className="flex flex-wrap gap-1">
                                                                {doc.templateFormats?.slice(0, 3).map((f) => (
                                                                    <span key={f} className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 uppercase">{f}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">{formatPrice(doc.price, doc.currency)}</span>
                                                                {doc.compareAtPrice && doc.compareAtPrice > doc.price && (
                                                                    <span className="text-xs text-zinc-400 line-through">{formatPrice(doc.compareAtPrice, doc.currency)}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                                                        <td className="px-4 py-3 hidden xl:table-cell">{getFreshnessBadge(doc.freshnessScore)}</td>
                                                        <td className="px-4 py-3 hidden xl:table-cell">
                                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">{doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "-"}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link href={`/solutions/${doc.id}`} className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors" title="Edit">
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem onClick={() => handleAnalyze(doc)}>
                                                                            <Sparkles className="mr-2 h-4 w-4" />AI Analyze
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(doc)}>
                                                                            <Trash className="mr-2 h-4 w-4" />Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <FileText className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No solution documents found</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || debouncedSearch
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Get started by uploading your first solution design document."}
                                </p>
                                {hasActiveFilters ? (
                                    <Button variant="ghost" onClick={clearFilters} className="mt-4 text-primary">Clear all filters</Button>
                                ) : (
                                    <Link href="/solutions/new">
                                        <Button className="mt-4"><Plus className="h-4 w-4 mr-2" />Upload Document</Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Cursor Pagination */}
                        {documents.length > 0 && (meta?.hasPreviousPage || meta?.hasNextPage) && (
                            <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {meta?.total ? `${meta.total} total documents` : `${documents.length} documents`}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" disabled={!meta?.hasPreviousPage} onClick={handlePrevPage}>
                                        <ChevronLeft className="h-4 w-4 mr-1" />Previous
                                    </Button>
                                    <Button variant="outline" size="sm" disabled={!meta?.hasNextPage} onClick={handleNextPage}>
                                        Next<ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-2xl px-5 py-3 border border-zinc-700 dark:border-zinc-300">
                        <div className="flex items-center gap-2 pr-3 border-r border-zinc-700 dark:border-zinc-300">
                            <CheckCircle className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium whitespace-nowrap">
                                {selectedIds.size} document{selectedIds.size !== 1 ? "s" : ""} selected
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Button variant="ghost" size="sm" onClick={handleBulkAnalyze} disabled={isBulkLoading} className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs">
                                {isBulkLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
                                AI Analyze
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleExportCsv} disabled={isBulkLoading} className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs">
                                <FileDown className="h-3.5 w-3.5 mr-1" />Export CSV
                            </Button>
                            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />
                            <Button variant="ghost" size="sm" onClick={handleBulkDelete} disabled={isBulkLoading} className="text-red-400 hover:text-red-300 hover:bg-red-900/30 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 h-8 text-xs">
                                <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                            </Button>
                        </div>
                        <div className="pl-2 border-l border-zinc-700 dark:border-zinc-300">
                            <button onClick={clearSelection} className="p-1 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Solution Document"
                description="Are you sure you want to delete this solution document? This action cannot be undone and all associated files will be permanently removed."
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
