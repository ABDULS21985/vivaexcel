"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { Button, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@ktblog/ui/components";
import {
    Upload,
    Image as ImageIcon,
    FileText,
    Video,
    MoreHorizontal,
    Trash,
    Download,
    Copy,
    Search,
    Grid,
    List as ListIcon,
    Loader2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@ktblog/ui/components";
import { ConfirmModal } from "@/components/modal";
import {
    useMediaList,
    useUploadMedia,
    useDeleteMedia,
    type MediaAsset,
    type MediaFilters,
} from "@/hooks/use-media";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDimensions(asset: MediaAsset): string | undefined {
    if (asset.width && asset.height) return `${asset.width}x${asset.height}`;
    return undefined;
}

type DisplayType = "image" | "video" | "document";

function getDisplayType(asset: MediaAsset): DisplayType {
    const mime = asset.mimeType || asset.type || "";
    if (mime.startsWith("image") || asset.type === "image") return "image";
    if (mime.startsWith("video") || asset.type === "video") return "video";
    return "document";
}

function getMediaTypeFilter(tab: string): string | undefined {
    if (tab === "all") return undefined;
    return tab;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MediaPage() {
    const { success, error: toastError } = useToast();
    const [view, setView] = React.useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("all");
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedAsset, setSelectedAsset] = React.useState<MediaAsset | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // ─── Data fetching ──────────────────────────────────────────────────────────
    const filters: MediaFilters = React.useMemo(() => {
        const f: MediaFilters = {};
        const typeFilter = getMediaTypeFilter(activeTab);
        if (typeFilter) f.type = typeFilter;
        if (searchQuery.trim()) f.search = searchQuery.trim();
        return f;
    }, [activeTab, searchQuery]);

    const { data: assets = [], isLoading, isError, error: fetchError } = useMediaList(filters);

    // ─── Mutations ──────────────────────────────────────────────────────────────
    const uploadMutation = useUploadMedia();
    const deleteMutation = useDeleteMedia();

    // ─── Upload ─────────────────────────────────────────────────────────────────
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        uploadMutation.mutate(formData, {
            onSuccess: () => {
                success("File uploaded", `${file.name} has been uploaded successfully.`);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to upload file. Please try again.");
            },
        });

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ─── Delete ─────────────────────────────────────────────────────────────────
    const handleDelete = (asset: MediaAsset) => {
        setSelectedAsset(asset);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAsset) return;

        deleteMutation.mutate(selectedAsset.id, {
            onSuccess: () => {
                success("File deleted", "The file has been deleted successfully.");
                setIsDeleteOpen(false);
                setSelectedAsset(null);
            },
            onError: (err) => {
                toastError("Error", err.message || "Failed to delete file.");
            },
        });
    };

    // ─── Copy URL ───────────────────────────────────────────────────────────────
    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        success("Copied", "URL copied to clipboard.");
    };

    // ─── Icon helper ────────────────────────────────────────────────────────────
    const getIcon = (type: DisplayType) => {
        switch (type) {
            case "image": return <ImageIcon className="h-4 w-4" />;
            case "video": return <Video className="h-4 w-4" />;
            case "document": return <FileText className="h-4 w-4" />;
        }
    };

    // ─── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen">
            <PageHeader
                title="Media Library"
                description="Manage your images, videos, and documents"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Media" },
                ]}
                actions={
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*,application/pdf"
                        />
                        <PageHeaderButton
                            onClick={handleUploadClick}
                            icon={uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            disabled={uploadMutation.isPending}
                        >
                            {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                        </PageHeaderButton>
                    </>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Error Banner */}
                {isError && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 p-4 text-red-700 dark:text-red-400 text-sm">
                        Failed to load media: {fetchError?.message || "Unknown error"}
                    </div>
                )}

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <TabsList>
                            <TabsTrigger value="all">All Files</TabsTrigger>
                            <TabsTrigger value="image">Images</TabsTrigger>
                            <TabsTrigger value="video">Videos</TabsTrigger>
                            <TabsTrigger value="document">Documents</TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input
                                    placeholder="Search files..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center border rounded-lg p-1">
                                <Button
                                    variant={view === "grid" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setView("grid")}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={view === "list" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setView("list")}
                                >
                                    <ListIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="mt-0">
                        {/* Loading State */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                                <span className="ml-3 text-zinc-500 dark:text-zinc-400">Loading media...</span>
                            </div>
                        ) : view === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {assets.map((asset) => {
                                    const displayType = getDisplayType(asset);
                                    return (
                                        <div key={asset.id} className="group relative bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all">
                                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 relative flex items-center justify-center">
                                                {displayType === "image" ? (
                                                    <img src={asset.thumbnailUrl || asset.url} alt={asset.alt || asset.filename} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-zinc-400">
                                                        {getIcon(displayType)}
                                                    </div>
                                                )}

                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => handleCopyUrl(asset.url)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full" onClick={() => handleDelete(asset)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <p className="font-medium text-sm truncate" title={asset.originalName || asset.filename}>{asset.originalName || asset.filename}</p>
                                                <p className="text-xs text-zinc-500 mt-1">{formatFileSize(asset.size)} {getDimensions(asset) ? `\u2022 ${getDimensions(asset)}` : `\u2022 ${displayType}`}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400">
                                        <tr>
                                            <th className="px-6 py-3 font-medium">Name</th>
                                            <th className="px-6 py-3 font-medium">Size</th>
                                            <th className="px-6 py-3 font-medium">Type</th>
                                            <th className="px-6 py-3 font-medium">Date</th>
                                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                        {assets.map((asset) => {
                                            const displayType = getDisplayType(asset);
                                            return (
                                                <tr key={asset.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                                    <td className="px-6 py-4 flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                            {displayType === "image" ? (
                                                                <img src={asset.thumbnailUrl || asset.url} alt={asset.alt || asset.filename} className="w-full h-full object-cover" />
                                                            ) : (
                                                                getIcon(displayType)
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">{asset.originalName || asset.filename}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{formatFileSize(asset.size)}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 capitalize">
                                                            {getIcon(displayType)}
                                                            {displayType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                        {new Date(asset.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleCopyUrl(asset.url)}>
                                                                    <Copy className="mr-2 h-4 w-4" />
                                                                    Copy Link
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Download
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="text-red-600 focus:text-red-600"
                                                                    onClick={() => handleDelete(asset)}
                                                                >
                                                                    <Trash className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {!isLoading && assets.length === 0 && (
                            <div className="text-center py-12">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-6 w-6 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-1">No assets found</h3>
                                <p className="text-zinc-500 dark:text-zinc-400">
                                    No media assets match your search or filter.
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete File"
                description={`Are you sure you want to delete "${selectedAsset?.originalName || selectedAsset?.filename}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
