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
    Presentation,
    Layers,
    Brain,
    RefreshCw,
    BarChart3,
    FileDown,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import {
    usePresentations,
    usePresentationStats,
    useDeletePresentation,
    useAnalyzePresentation,
    useReprocessPresentation,
    useBulkDeletePresentations,
    useBulkAnalyzePresentations,
    type Presentation as PresentationType,
    type PresentationIndustry,
    type PresentationType as PresTypeEnum,
    type PresentationFileFormat,
    type PresentationAspectRatio,
} from "@/hooks/use-presentations";

type ViewMode = "grid" | "table";
type SortOption =
    | "newest"
    | "oldest"
    | "price-high"
    | "price-low"
    | "slides-most"
    | "downloads";

const INDUSTRY_LABELS: Record<PresentationIndustry, string> = {
    technology: "Technology",
    healthcare: "Healthcare",
    finance: "Finance",
    education: "Education",
    marketing: "Marketing",
    real_estate: "Real Estate",
    consulting: "Consulting",
    manufacturing: "Manufacturing",
    retail: "Retail",
    nonprofit: "Nonprofit",
    government: "Government",
    creative: "Creative",
    legal: "Legal",
    startup: "Startup",
    general: "General",
    other: "Other",
};

const INDUSTRY_COLORS: Record<PresentationIndustry, string> = {
    technology:
        "bg-blue-100/90 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300",
    healthcare:
        "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300",
    finance:
        "bg-amber-100/90 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300",
    education:
        "bg-purple-100/90 text-purple-700 dark:bg-purple-900/80 dark:text-purple-300",
    marketing:
        "bg-orange-100/90 text-orange-700 dark:bg-orange-900/80 dark:text-orange-300",
    real_estate:
        "bg-teal-100/90 text-teal-700 dark:bg-teal-900/80 dark:text-teal-300",
    consulting:
        "bg-cyan-100/90 text-cyan-700 dark:bg-cyan-900/80 dark:text-cyan-300",
    manufacturing:
        "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
    retail:
        "bg-pink-100/90 text-pink-700 dark:bg-pink-900/80 dark:text-pink-300",
    nonprofit:
        "bg-rose-100/90 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300",
    government:
        "bg-slate-100/90 text-slate-700 dark:bg-slate-700/80 dark:text-slate-300",
    creative:
        "bg-violet-100/90 text-violet-700 dark:bg-violet-900/80 dark:text-violet-300",
    legal:
        "bg-stone-100/90 text-stone-700 dark:bg-stone-700/80 dark:text-stone-300",
    startup:
        "bg-lime-100/90 text-lime-700 dark:bg-lime-900/80 dark:text-lime-300",
    general:
        "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
    other:
        "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
};

const TYPE_LABELS: Record<PresTypeEnum, string> = {
    pitch_deck: "Pitch Deck",
    business_plan: "Business Plan",
    sales_deck: "Sales Deck",
    company_profile: "Company Profile",
    project_proposal: "Project Proposal",
    training: "Training",
    webinar: "Webinar",
    case_study: "Case Study",
    report: "Report",
    infographic: "Infographic",
    portfolio: "Portfolio",
    keynote_speech: "Keynote Speech",
    product_launch: "Product Launch",
    investor_update: "Investor Update",
    other: "Other",
};

const FORMAT_LABELS: Record<PresentationFileFormat, string> = {
    pptx: "PPTX",
    ppt: "PPT",
    key: "Keynote",
    odp: "ODP",
    pdf: "PDF",
};

const ASPECT_RATIO_LABELS: Record<PresentationAspectRatio, string> = {
    "16:9": "16:9 Widescreen",
    "4:3": "4:3 Standard",
    "16:10": "16:10",
    a4: "A4 Portrait",
    letter: "Letter",
    custom: "Custom",
};

export default function PresentationsPage() {
    const { success, error: toastError } = useToast();
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedPresentation, setSelectedPresentation] =
        React.useState<PresentationType | null>(null);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedSearch, setDebouncedSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [industryFilter, setIndustryFilter] = React.useState("all");
    const [typeFilter, setTypeFilter] = React.useState("all");
    const [formatFilter, setFormatFilter] = React.useState("all");
    const [aspectRatioFilter, setAspectRatioFilter] = React.useState("all");
    const [sortOption, setSortOption] = React.useState<SortOption>("newest");
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [viewMode, setViewMode] = React.useState<ViewMode>("table");
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
        new Set()
    );
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
        if (industryFilter !== "all") filters.industry = industryFilter;
        if (typeFilter !== "all") filters.type = typeFilter;
        if (formatFilter !== "all") filters.fileFormat = formatFilter;
        if (aspectRatioFilter !== "all") filters.aspectRatio = aspectRatioFilter;
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
        } else if (sortOption === "slides-most") {
            filters.sortBy = "slideCount";
            filters.sortOrder = "DESC";
        } else if (sortOption === "downloads") {
            filters.sortBy = "downloadCount";
            filters.sortOrder = "DESC";
        }
        return filters;
    }, [
        debouncedSearch,
        statusFilter,
        industryFilter,
        typeFilter,
        formatFilter,
        aspectRatioFilter,
        sortOption,
        cursor,
    ]);

    // Fetch data
    const {
        data: presentationsData,
        isLoading: isLoadingPresentations,
        error: presentationsError,
    } = usePresentations(apiFilters);
    const presentations = presentationsData?.items ?? [];
    const meta = presentationsData?.meta;

    const { data: statsData, isLoading: isLoadingStats } =
        usePresentationStats();

    // Mutations
    const deleteMutation = useDeletePresentation();
    const analyzeMutation = useAnalyzePresentation();
    const reprocessMutation = useReprocessPresentation();
    const bulkDeleteMutation = useBulkDeletePresentations();
    const bulkAnalyzeMutation = useBulkAnalyzePresentations();

    // Bulk selection helpers
    const isAllSelected =
        presentations.length > 0 &&
        presentations.every((p) => selectedIds.has(p.id));
    const isSomeSelected = presentations.some((p) => selectedIds.has(p.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(presentations.map((p) => p.id)));
        }
    };

    const toggleSelectPresentation = (id: string) => {
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
    const handleAnalyze = (presentation: PresentationType) => {
        analyzeMutation.mutate(presentation.id, {
            onSuccess: () => {
                success(
                    "Analysis started",
                    `AI analysis for "${presentation.title}" has been triggered.`
                );
            },
            onError: () => {
                toastError("Error", "Failed to start AI analysis.");
            },
        });
    };

    const handleReprocess = (presentation: PresentationType) => {
        reprocessMutation.mutate(presentation.id, {
            onSuccess: () => {
                success(
                    "Reprocessing started",
                    `"${presentation.title}" is being reprocessed.`
                );
            },
            onError: () => {
                toastError("Error", "Failed to reprocess presentation.");
            },
        });
    };

    const handleDelete = (presentation: PresentationType) => {
        setSelectedPresentation(presentation);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPresentation) return;

        deleteMutation.mutate(selectedPresentation.id, {
            onSuccess: () => {
                success(
                    "Presentation deleted",
                    "The presentation has been deleted successfully."
                );
                setIsDeleteOpen(false);
                setSelectedPresentation(null);
            },
            onError: () => {
                toastError("Error", "Failed to delete presentation.");
            },
        });
    };

    // Bulk actions
    const handleBulkDelete = async () => {
        setIsBulkLoading(true);
        const ids = Array.from(selectedIds);
        bulkDeleteMutation.mutate(ids, {
            onSuccess: () => {
                success(
                    "Presentations deleted",
                    `${ids.length} presentations have been deleted.`
                );
                clearSelection();
                setIsBulkLoading(false);
            },
            onError: () => {
                toastError("Error", "Failed to delete selected presentations.");
                setIsBulkLoading(false);
            },
        });
    };

    const handleBulkAnalyze = async () => {
        setIsBulkLoading(true);
        const ids = Array.from(selectedIds);
        bulkAnalyzeMutation.mutate(ids, {
            onSuccess: (result) => {
                success(
                    "Analysis started",
                    `AI analysis triggered for ${result.analyzed} presentations.`
                );
                clearSelection();
                setIsBulkLoading(false);
            },
            onError: () => {
                toastError(
                    "Error",
                    "Failed to analyze selected presentations."
                );
                setIsBulkLoading(false);
            },
        });
    };

    const handleExportCsv = () => {
        const selected = presentations.filter((p) => selectedIds.has(p.id));
        const headers = [
            "Title",
            "Industry",
            "Type",
            "Slides",
            "Format",
            "Price",
            "Status",
            "Downloads",
            "Created",
        ];
        const rows = selected.map((p) => [
            `"${p.title}"`,
            INDUSTRY_LABELS[p.industry] || p.industry,
            TYPE_LABELS[p.type] || p.type,
            p.slideCount,
            FORMAT_LABELS[p.fileFormat] || p.fileFormat,
            p.price,
            p.status,
            p.downloadCount,
            p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "",
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
            "\n"
        );
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `presentations-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        success("Export complete", "CSV file has been downloaded.");
    };

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setStatusFilter("all");
        setIndustryFilter("all");
        setTypeFilter("all");
        setFormatFilter("all");
        setAspectRatioFilter("all");
        setSortOption("newest");
        setCursor(undefined);
    };

    const hasActiveFilters =
        statusFilter !== "all" ||
        industryFilter !== "all" ||
        typeFilter !== "all" ||
        formatFilter !== "all" ||
        aspectRatioFilter !== "all";

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            published:
                "bg-green-100/90 text-green-700 dark:bg-green-900/80 dark:text-green-300",
            draft: "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-700/80 dark:text-zinc-300",
            archived:
                "bg-red-100/90 text-red-700 dark:bg-red-900/80 dark:text-red-300",
        };
        const labels: Record<string, string> = {
            published: "Published",
            draft: "Draft",
            archived: "Archived",
        };
        return (
            <span
                className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || ""}`}
            >
                {labels[status] || status}
            </span>
        );
    };

    const getIndustryBadge = (industry: PresentationIndustry) => {
        return (
            <span
                className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${INDUSTRY_COLORS[industry] || ""}`}
            >
                {INDUSTRY_LABELS[industry] || industry}
            </span>
        );
    };

    const formatPrice = (price: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency || "USD",
        }).format(price);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    // Pagination handlers
    const handleNextPage = () => {
        if (meta?.nextCursor) {
            setCursor(meta.nextCursor);
        }
    };

    const handlePrevPage = () => {
        if (meta?.previousCursor) {
            setCursor(meta.previousCursor);
        }
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Presentations"
                description="Manage your PowerPoint and presentation templates"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Presentations" },
                ]}
                actions={
                    <div className="flex items-center gap-3">
                        <Link href="/presentations/analytics">
                            <PageHeaderButton
                                variant="outline"
                                icon={<BarChart3 className="h-4 w-4" />}
                            >
                                Analytics
                            </PageHeaderButton>
                        </Link>
                        <Link href="/presentations/new">
                            <PageHeaderButton
                                icon={<Plus className="h-4 w-4" />}
                            >
                                Upload Presentation
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
                                <Presentation className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.totalPresentations ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Total Presentations
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.totalSlides ?? 0).toLocaleString()
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Total Slides
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    {isLoadingStats ? (
                                        <span className="inline-block w-12 h-6 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
                                    ) : (
                                        (statsData?.averageSlidesPerPresentation ?? 0).toFixed(1)
                                    )}
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Avg Slides/Presentation
                                </p>
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
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    AI Analyzed
                                </p>
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
                                placeholder="Search presentations..."
                                className="pl-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortOption}
                                onValueChange={(v) =>
                                    setSortOption(v as SortOption)
                                }
                            >
                                <SelectTrigger className="w-[150px]">
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpDown className="h-3.5 w-3.5" />
                                        <SelectValue placeholder="Sort by" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">
                                        Newest First
                                    </SelectItem>
                                    <SelectItem value="oldest">
                                        Oldest First
                                    </SelectItem>
                                    <SelectItem value="price-high">
                                        Price: High
                                    </SelectItem>
                                    <SelectItem value="price-low">
                                        Price: Low
                                    </SelectItem>
                                    <SelectItem value="slides-most">
                                        Most Slides
                                    </SelectItem>
                                    <SelectItem value="downloads">
                                        Most Downloads
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                variant={
                                    showAdvancedFilters ? "default" : "outline"
                                }
                                size="sm"
                                onClick={() =>
                                    setShowAdvancedFilters(!showAdvancedFilters)
                                }
                                className="h-10"
                            >
                                <Filter className="h-4 w-4 mr-1.5" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="ml-1.5 h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                                        !
                                    </span>
                                )}
                            </Button>

                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "grid"
                                            ? "bg-primary text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
                                    title="Grid view"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 transition-colors ${
                                        viewMode === "table"
                                            ? "bg-primary text-white"
                                            : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                                    }`}
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
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Industry
                                </label>
                                <Select
                                    value={industryFilter}
                                    onValueChange={setIndustryFilter}
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All Industries" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Industries
                                        </SelectItem>
                                        {Object.entries(INDUSTRY_LABELS).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Type
                                </label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="w-[170px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Types
                                        </SelectItem>
                                        {Object.entries(TYPE_LABELS).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Format
                                </label>
                                <Select
                                    value={formatFilter}
                                    onValueChange={setFormatFilter}
                                >
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="All Formats" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Formats
                                        </SelectItem>
                                        {Object.entries(FORMAT_LABELS).map(
                                            ([key, label]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                    Aspect Ratio
                                </label>
                                <Select
                                    value={aspectRatioFilter}
                                    onValueChange={setAspectRatioFilter}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="All Ratios" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Ratios
                                        </SelectItem>
                                        {Object.entries(
                                            ASPECT_RATIO_LABELS
                                        ).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white h-10"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    Clear All
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Loading state */}
                {isLoadingPresentations && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            Loading presentations...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {!isLoadingPresentations && presentationsError && (
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                            <X className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                            Failed to load presentations
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {presentationsError.message ||
                                "An error occurred while fetching presentations."}
                        </p>
                    </div>
                )}

                {/* Content when loaded */}
                {!isLoadingPresentations && !presentationsError && (
                    <>
                        {/* Bulk select all header */}
                        {presentations.length > 0 && (
                            <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(el) => {
                                            if (el)
                                                el.indeterminate =
                                                    isSomeSelected &&
                                                    !isAllSelected;
                                        }}
                                        onChange={toggleSelectAll}
                                        className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                    />
                                    <span className="font-medium">
                                        {isAllSelected
                                            ? "Deselect all"
                                            : "Select all"}
                                    </span>
                                </label>
                                <span className="text-zinc-400">
                                    {meta?.total ?? presentations.length}{" "}
                                    presentation
                                    {(meta?.total ?? presentations.length) !== 1
                                        ? "s"
                                        : ""}
                                </span>
                                {selectedIds.size > 0 && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                                        {selectedIds.size} selected
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Content: Grid or Table */}
                        {presentations.length > 0 ? (
                            viewMode === "grid" ? (
                                /* Grid View */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {presentations.map((pres) => (
                                        <div
                                            key={pres.id}
                                            className="group relative flex flex-col bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all duration-300"
                                        >
                                            {/* Checkbox */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(
                                                        pres.id
                                                    )}
                                                    onChange={() =>
                                                        toggleSelectPresentation(
                                                            pres.id
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary bg-white/80 backdrop-blur-sm cursor-pointer"
                                                />
                                            </div>

                                            {/* AI Analyzed badge */}
                                            {pres.isAiAnalyzed && (
                                                <div className="absolute top-3 right-12 z-10">
                                                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-purple-500 text-white uppercase">
                                                        AI Analyzed
                                                    </span>
                                                </div>
                                            )}

                                            {/* Thumbnail */}
                                            <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                                                {pres.thumbnailUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={pres.thumbnailUrl}
                                                        alt={pres.title}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                        <Presentation className="h-8 w-8 opacity-50" />
                                                    </div>
                                                )}
                                                <div className="absolute top-3 right-3">
                                                    {getStatusBadge(pres.status)}
                                                </div>
                                                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-black/60 text-white">
                                                    {pres.slideCount} slides
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-5 flex flex-col space-y-3">
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {getIndustryBadge(
                                                            pres.industry
                                                        )}
                                                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                                            {TYPE_LABELS[
                                                                pres.type
                                                            ] || pres.type}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                        {pres.title}
                                                    </h3>
                                                    {pres.shortDescription && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                                            {pres.shortDescription}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                        {formatPrice(
                                                            pres.price,
                                                            pres.currency
                                                        )}
                                                    </span>
                                                    {pres.compareAtPrice &&
                                                        pres.compareAtPrice >
                                                            pres.price && (
                                                            <span className="text-sm text-zinc-400 line-through">
                                                                {formatPrice(
                                                                    pres.compareAtPrice,
                                                                    pres.currency
                                                                )}
                                                            </span>
                                                        )}
                                                </div>

                                                {/* Stats */}
                                                <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <span className="flex items-center gap-1">
                                                        <Download className="h-3 w-3" />
                                                        {pres.downloadCount.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-3 w-3" />
                                                        {pres.viewCount.toLocaleString()}
                                                    </span>
                                                    <span className="uppercase text-[10px] font-medium">
                                                        {FORMAT_LABELS[
                                                            pres.fileFormat
                                                        ] || pres.fileFormat}
                                                    </span>
                                                </div>

                                                {/* Footer */}
                                                <div className="pt-4 mt-auto flex items-center justify-between border-t border-zinc-100 dark:border-zinc-700">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                        {pres.createdAt && (
                                                            <span>
                                                                {new Date(
                                                                    pres.createdAt
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <Link
                                                            href={`/presentations/${pres.id}`}
                                                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleAnalyze(
                                                                            pres
                                                                        )
                                                                    }
                                                                >
                                                                    <Sparkles className="mr-2 h-4 w-4" />
                                                                    AI Analyze
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        handleReprocess(
                                                                            pres
                                                                        )
                                                                    }
                                                                >
                                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                                    Reprocess
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            pres
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete
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
                                /* Table View */
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700/50">
                                                    <th className="w-10 px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                isAllSelected
                                                            }
                                                            ref={(el) => {
                                                                if (el)
                                                                    el.indeterminate =
                                                                        isSomeSelected &&
                                                                        !isAllSelected;
                                                            }}
                                                            onChange={
                                                                toggleSelectAll
                                                            }
                                                            className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                        />
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Presentation
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                        Industry
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                        Type
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                                                        Slides
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                        Format
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                                                        Price
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                                                        Created
                                                    </th>
                                                    <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                                {presentations.map((pres) => (
                                                    <tr
                                                        key={pres.id}
                                                        className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
                                                    >
                                                        <td className="w-10 px-4 py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedIds.has(
                                                                    pres.id
                                                                )}
                                                                onChange={() =>
                                                                    toggleSelectPresentation(
                                                                        pres.id
                                                                    )
                                                                }
                                                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                {pres.thumbnailUrl ? (
                                                                    // eslint-disable-next-line @next/next/no-img-element
                                                                    <img
                                                                        src={
                                                                            pres.thumbnailUrl
                                                                        }
                                                                        alt=""
                                                                        className="h-10 w-14 rounded object-cover flex-shrink-0 hidden sm:block"
                                                                    />
                                                                ) : (
                                                                    <div className="h-10 w-14 rounded bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0 hidden sm:block">
                                                                        <Presentation className="h-4 w-4 text-zinc-400" />
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <Link
                                                                        href={`/presentations/${pres.id}`}
                                                                        className="text-sm font-medium text-zinc-900 dark:text-white hover:text-primary transition-colors line-clamp-1"
                                                                    >
                                                                        {
                                                                            pres.title
                                                                        }
                                                                    </Link>
                                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                                        <span className="truncate">
                                                                            /
                                                                            {
                                                                                pres.slug
                                                                            }
                                                                        </span>
                                                                        {pres.isAiAnalyzed && (
                                                                            <span className="px-1 py-0.5 text-[8px] font-bold rounded bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                                                                                AI
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 hidden md:table-cell">
                                                            {getIndustryBadge(
                                                                pres.industry
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                                                {TYPE_LABELS[
                                                                    pres.type
                                                                ] || pres.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 hidden md:table-cell">
                                                            <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                {pres.slideCount}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 uppercase">
                                                                {FORMAT_LABELS[
                                                                    pres.fileFormat
                                                                ] ||
                                                                    pres.fileFormat}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 hidden lg:table-cell">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                    {formatPrice(
                                                                        pres.price,
                                                                        pres.currency
                                                                    )}
                                                                </span>
                                                                {pres.compareAtPrice &&
                                                                    pres.compareAtPrice >
                                                                        pres.price && (
                                                                        <span className="text-xs text-zinc-400 line-through">
                                                                            {formatPrice(
                                                                                pres.compareAtPrice,
                                                                                pres.currency
                                                                            )}
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {getStatusBadge(
                                                                pres.status
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 hidden xl:table-cell">
                                                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                                                {pres.createdAt
                                                                    ? new Date(
                                                                          pres.createdAt
                                                                      ).toLocaleDateString()
                                                                    : "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Link
                                                                    href={`/presentations/${pres.id}`}
                                                                    className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Link>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <button className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleAnalyze(
                                                                                    pres
                                                                                )
                                                                            }
                                                                        >
                                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                                            AI
                                                                            Analyze
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() =>
                                                                                handleReprocess(
                                                                                    pres
                                                                                )
                                                                            }
                                                                        >
                                                                            <RefreshCw className="mr-2 h-4 w-4" />
                                                                            Reprocess
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600"
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    pres
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash className="mr-2 h-4 w-4" />
                                                                            Delete
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
                            /* Empty state */
                            <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <Presentation className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                    No presentations found
                                </h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                                    {hasActiveFilters || debouncedSearch
                                        ? "Try adjusting your search or filters to find what you are looking for."
                                        : "Get started by uploading your first presentation template."}
                                </p>
                                {hasActiveFilters ? (
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="mt-4 text-primary"
                                    >
                                        Clear all filters
                                    </Button>
                                ) : (
                                    <Link href="/presentations/new">
                                        <Button className="mt-4">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Upload Presentation
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}

                        {/* Cursor Pagination */}
                        {presentations.length > 0 &&
                            (meta?.hasPreviousPage || meta?.hasNextPage) && (
                                <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 px-4 py-3">
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        {meta?.total
                                            ? `${meta.total} total presentations`
                                            : `${presentations.length} presentations`}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!meta?.hasPreviousPage}
                                            onClick={handlePrevPage}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!meta?.hasNextPage}
                                            onClick={handleNextPage}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
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
                                {selectedIds.size} presentation
                                {selectedIds.size !== 1 ? "s" : ""} selected
                            </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkAnalyze}
                                disabled={isBulkLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                {isBulkLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                ) : (
                                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                                )}
                                AI Analyze
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleExportCsv}
                                disabled={isBulkLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                <FileDown className="h-3.5 w-3.5 mr-1" />
                                Export CSV
                            </Button>

                            <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBulkDelete}
                                disabled={isBulkLoading}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/30 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 h-8 text-xs"
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-1" />
                                Delete
                            </Button>
                        </div>

                        <div className="pl-2 border-l border-zinc-700 dark:border-zinc-300">
                            <button
                                onClick={clearSelection}
                                className="p-1 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Presentation"
                description="Are you sure you want to delete this presentation? This action cannot be undone and all associated files and slides will be permanently removed."
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
