"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { Button, Input, Tabs, TabsList, TabsTrigger, TabsContent } from "@digibit/ui/components";
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
    List as ListIcon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@digibit/ui/components";
import { ConfirmModal } from "@/components/modal";

interface MediaAsset {
    id: string;
    filename: string;
    type: "image" | "document" | "video";
    url: string;
    size: string;
    dimensions?: string;
    uploadedAt: string;
}

const initialAssets: MediaAsset[] = [
    {
        id: "1",
        filename: "hero-banner-v2.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=2070",
        size: "2.4 MB",
        dimensions: "1920x1080",
        uploadedAt: "2024-03-20T10:30:00Z",
    },
    {
        id: "2",
        filename: "project-proposal.pdf",
        type: "document",
        url: "#",
        size: "1.2 MB",
        uploadedAt: "2024-03-19T14:15:00Z",
    },
    {
        id: "3",
        filename: "product-demo.mp4",
        type: "video",
        url: "#",
        size: "15.4 MB",
        dimensions: "1920x1080",
        uploadedAt: "2024-03-18T09:00:00Z",
    },
    {
        id: "4",
        filename: "team-photo.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070",
        size: "3.1 MB",
        dimensions: "2400x1600",
        uploadedAt: "2024-03-17T11:20:00Z",
    },
    {
        id: "5",
        filename: "quarterly-report.xlsx",
        type: "document",
        url: "#",
        size: "540 KB",
        uploadedAt: "2024-03-16T16:45:00Z",
    },
    {
        id: "6",
        filename: "office-tour.jpg",
        type: "image",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2070",
        size: "4.2 MB",
        dimensions: "3000x2000",
        uploadedAt: "2024-03-15T13:10:00Z",
    },
];

export default function MediaPage() {
    const { success, error } = useToast();
    const [assets, setAssets] = React.useState<MediaAsset[]>(initialAssets);
    const [view, setView] = React.useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("all");
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [selectedAsset, setSelectedAsset] = React.useState<MediaAsset | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const filteredAssets = assets.filter((asset) => {
        const matchesSearch = asset.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = activeTab === "all" || asset.type === activeTab;
        return matchesSearch && matchesType;
    });

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            // Simulate upload delay
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const newAsset: MediaAsset = {
                id: Math.random().toString(36).substr(2, 9),
                filename: file.name,
                type: file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "document",
                url: URL.createObjectURL(file),
                size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                uploadedAt: new Date().toISOString(),
            };

            setAssets((prev) => [newAsset, ...prev]);
            success("File uploaded", `${file.name} has been uploaded successfully.`);
        } catch {
            error("Error", "Failed to upload file. Please try again.");
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = (asset: MediaAsset) => {
        setSelectedAsset(asset);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedAsset) return;

        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setAssets((prev) => prev.filter((a) => a.id !== selectedAsset.id));
            success("File deleted", "The file has been deleted successfully.");
            setIsDeleteOpen(false);
            setSelectedAsset(null);
        } catch {
            error("Error", "Failed to delete file.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        success("Copied", "URL copied to clipboard.");
    };

    const getIcon = (type: MediaAsset["type"]) => {
        switch (type) {
            case "image": return <ImageIcon className="h-4 w-4" />;
            case "video": return <Video className="h-4 w-4" />;
            case "document": return <FileText className="h-4 w-4" />;
        }
    };

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
                            icon={isLoading ? "..." : <Upload className="h-4 w-4" />}
                            disabled={isLoading}
                        >
                            {isLoading ? "Uploading..." : "Upload File"}
                        </PageHeaderButton>
                    </>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        {view === "grid" ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {filteredAssets.map((asset) => (
                                    <div key={asset.id} className="group relative bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-all">
                                        <div className="aspect-square bg-zinc-100 dark:bg-zinc-900 relative flex items-center justify-center">
                                            {asset.type === "image" ? (
                                                <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="text-zinc-400">
                                                    {getIcon(asset.type)}
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
                                            <p className="font-medium text-sm truncate" title={asset.filename}>{asset.filename}</p>
                                            <p className="text-xs text-zinc-500 mt-1">{asset.size} • {asset.dimensions || asset.type}</p>
                                        </div>
                                    </div>
                                ))}
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
                                        {filteredAssets.map((asset) => (
                                            <tr key={asset.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                        {asset.type === "image" ? (
                                                            <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover" />
                                                        ) : (
                                                            getIcon(asset.type)
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-zinc-900 dark:text-white truncate max-w-[200px]">{asset.filename}</span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{asset.size}</td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300 capitalize">
                                                        {getIcon(asset.type)}
                                                        {asset.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                                    {new Date(asset.uploadedAt).toLocaleDateString()}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {filteredAssets.length === 0 && (
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
                description={`Are you sure you want to delete "${selectedAsset?.filename}"? This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
