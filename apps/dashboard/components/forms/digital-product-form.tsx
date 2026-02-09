"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import * as z from "zod";
import {
    Input,
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
    Switch,
    Label,
} from "@ktblog/ui/components";
import {
    Loader2,
    Globe,
    X,
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    Upload,
    FileIcon,
    Image as ImageIcon,
    Video,
    Link2,
    GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useDropzone } from "react-dropzone";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { useToast } from "@/components/toast";
import {
    useDigitalProductCategories,
    useDigitalProductTags,
    type DigitalProduct,
} from "@/hooks/use-digital-products";
import { apiClient } from "@/lib/api-client";

// ─── Schema ──────────────────────────────────────────────────────────────────

const digitalProductSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().max(500, "Short description must be 500 characters or less").optional(),
    type: z.enum([
        "powerpoint",
        "document",
        "web_template",
        "startup_kit",
        "solution_template",
        "design_system",
        "code_template",
        "other",
    ]),
    status: z
        .enum(["draft", "published", "archived", "coming_soon"])
        .default("draft"),
    price: z.number().min(0, "Price must be positive"),
    compareAtPrice: z.number().min(0, "Compare at price must be positive").optional(),
    currency: z.string().default("USD"),
    featuredImage: z.string().optional(),
    galleryImages: z.array(z.string()).optional(),
    categoryId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    isFeatured: z.boolean().default(false),
    isBestseller: z.boolean().default(false),
    seoTitle: z.string().max(255, "SEO title must be 255 characters or less").optional(),
    seoDescription: z.string().max(500, "SEO description must be 500 characters or less").optional(),
    seoKeywords: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.any()).optional(),
});

type DigitalProductFormValues = z.infer<typeof digitalProductSchema>;

interface VariantItem {
    id: string;
    name: string;
    price: number;
    features: string[];
    sortOrder: number;
}

interface PreviewItem {
    id: string;
    type: string;
    url: string;
    thumbnailUrl: string;
    sortOrder: number;
}

interface UploadedFile {
    name: string;
    size: number;
    type: string;
    url?: string;
}

interface DigitalProductFormProps {
    initialData?: DigitalProduct;
    onSubmit: (data: Record<string, unknown>) => void;
    isLoading?: boolean;
    mode: "create" | "edit";
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function generateTempId(): string {
    return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// ─── Metadata key-value editor ───────────────────────────────────────────────

const COMMON_METADATA_KEYS = [
    { key: "slideCount", label: "Slide Count" },
    { key: "pageCount", label: "Page Count" },
    { key: "fileFormat", label: "File Format" },
    { key: "compatibility", label: "Compatibility" },
    { key: "fileSize", label: "File Size" },
    { key: "version", label: "Version" },
    { key: "lastUpdated", label: "Last Updated" },
    { key: "language", label: "Language" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function DigitalProductForm({
    initialData,
    onSubmit,
    isLoading,
    mode = "create",
}: DigitalProductFormProps) {
    const toast = useToast();

    // Fetch categories and tags for dropdown selects
    const { data: categoriesData } = useDigitalProductCategories();
    const { data: tagsData } = useDigitalProductTags();
    const allCategories = categoriesData?.categories ?? [];
    const allTags = tagsData?.tags ?? [];

    // ─── Form State ──────────────────────────────────────────────────────────

    const [formData, setFormData] = useState<DigitalProductFormValues>(() => {
        if (initialData) {
            return {
                title: initialData.title,
                slug: initialData.slug,
                description: initialData.description ?? "",
                shortDescription: initialData.shortDescription ?? "",
                type: initialData.type,
                status: initialData.status,
                price: initialData.price,
                compareAtPrice: initialData.compareAtPrice ?? undefined,
                currency: initialData.currency || "USD",
                featuredImage: initialData.featuredImage ?? "",
                galleryImages: initialData.galleryImages ?? [],
                categoryId: initialData.category?.id ?? "",
                tagIds: initialData.tags?.map((t) => t.id) ?? [],
                isFeatured: initialData.isFeatured,
                isBestseller: initialData.isBestseller,
                seoTitle: initialData.seoTitle ?? "",
                seoDescription: initialData.seoDescription ?? "",
                seoKeywords: initialData.seoKeywords ?? [],
                metadata: initialData.metadata ?? {},
            };
        }
        return {
            title: "",
            slug: "",
            description: "",
            shortDescription: "",
            type: "document",
            status: "draft",
            price: 0,
            compareAtPrice: undefined,
            currency: "USD",
            featuredImage: "",
            galleryImages: [],
            categoryId: "",
            tagIds: [],
            isFeatured: false,
            isBestseller: false,
            seoTitle: "",
            seoDescription: "",
            seoKeywords: [],
            metadata: {},
        };
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Variants state
    const [variants, setVariants] = useState<VariantItem[]>(() => {
        if (initialData?.variants) {
            return initialData.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price,
                features: v.features ?? [],
                sortOrder: v.sortOrder,
            }));
        }
        return [];
    });

    // Previews state
    const [previews, setPreviews] = useState<PreviewItem[]>(() => {
        if (initialData?.previews) {
            return initialData.previews.map((p) => ({
                id: p.id,
                type: p.type,
                url: p.url,
                thumbnailUrl: p.thumbnailUrl ?? "",
                sortOrder: p.sortOrder,
            }));
        }
        return [];
    });

    // File upload state
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // SEO keywords input state
    const [seoKeywordInput, setSeoKeywordInput] = useState("");

    // Metadata editor state
    const [metadataKey, setMetadataKey] = useState("");
    const [metadataValue, setMetadataValue] = useState("");

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug:
                mode === "create" && !initialData?.slug
                    ? generateSlug(value)
                    : prev.slug,
        }));
        if (errors.title) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.title;
                return newErrors;
            });
        }
    };

    const handleSelectChange = (
        name: keyof DigitalProductFormValues,
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSwitchChange = (
        name: keyof DigitalProductFormValues,
        checked: boolean
    ) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handlePriceChange = (name: "price" | "compareAtPrice", value: string) => {
        const num = value === "" ? (name === "price" ? 0 : undefined) : parseFloat(value);
        setFormData((prev) => ({ ...prev, [name]: num }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDescriptionChange = useCallback(
        (html: string) => {
            setFormData((prev) => ({ ...prev, description: html }));
            if (errors.description) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.description;
                    return newErrors;
                });
            }
        },
        [errors.description]
    );

    // ─── Tag multi-select ────────────────────────────────────────────────────

    const toggleTag = (tagId: string) => {
        setFormData((prev) => {
            const currentTags = prev.tagIds ?? [];
            const newTags = currentTags.includes(tagId)
                ? currentTags.filter((id) => id !== tagId)
                : [...currentTags, tagId];
            return { ...prev, tagIds: newTags };
        });
    };

    // ─── SEO Keywords ────────────────────────────────────────────────────────

    const addSeoKeyword = () => {
        const keyword = seoKeywordInput.trim();
        if (!keyword) return;
        setFormData((prev) => ({
            ...prev,
            seoKeywords: [...(prev.seoKeywords ?? []), keyword],
        }));
        setSeoKeywordInput("");
    };

    const removeSeoKeyword = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            seoKeywords: (prev.seoKeywords ?? []).filter((_, i) => i !== index),
        }));
    };

    const handleSeoKeywordKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSeoKeyword();
        }
    };

    // ─── Metadata ────────────────────────────────────────────────────────────

    const addMetadataEntry = () => {
        const key = metadataKey.trim();
        const value = metadataValue.trim();
        if (!key) return;
        setFormData((prev) => ({
            ...prev,
            metadata: { ...(prev.metadata ?? {}), [key]: value },
        }));
        setMetadataKey("");
        setMetadataValue("");
    };

    const removeMetadataEntry = (key: string) => {
        setFormData((prev) => {
            const newMetadata = { ...(prev.metadata ?? {}) };
            delete newMetadata[key];
            return { ...prev, metadata: newMetadata };
        });
    };

    // ─── Variants ────────────────────────────────────────────────────────────

    const addVariant = () => {
        setVariants((prev) => [
            ...prev,
            {
                id: generateTempId(),
                name: "",
                price: 0,
                features: [],
                sortOrder: prev.length,
            },
        ]);
    };

    const updateVariant = (
        id: string,
        field: keyof VariantItem,
        value: string | number | string[]
    ) => {
        setVariants((prev) =>
            prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
        );
    };

    const removeVariant = (id: string) => {
        setVariants((prev) =>
            prev
                .filter((v) => v.id !== id)
                .map((v, i) => ({ ...v, sortOrder: i }))
        );
    };

    const moveVariant = (index: number, direction: "up" | "down") => {
        setVariants((prev) => {
            const newVariants = [...prev];
            const swapIndex = direction === "up" ? index - 1 : index + 1;
            if (swapIndex < 0 || swapIndex >= newVariants.length)
                return prev;
            [newVariants[index], newVariants[swapIndex]] = [
                newVariants[swapIndex],
                newVariants[index],
            ];
            return newVariants.map((v, i) => ({ ...v, sortOrder: i }));
        });
    };

    // ─── Previews ────────────────────────────────────────────────────────────

    const addPreview = () => {
        setPreviews((prev) => [
            ...prev,
            {
                id: generateTempId(),
                type: "image",
                url: "",
                thumbnailUrl: "",
                sortOrder: prev.length,
            },
        ]);
    };

    const updatePreview = (
        id: string,
        field: keyof PreviewItem,
        value: string | number
    ) => {
        setPreviews((prev) =>
            prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const removePreview = (id: string) => {
        setPreviews((prev) =>
            prev
                .filter((p) => p.id !== id)
                .map((p, i) => ({ ...p, sortOrder: i }))
        );
    };

    // ─── File Upload ─────────────────────────────────────────────────────────

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            setIsUploading(true);
            try {
                for (const file of acceptedFiles) {
                    const formDataUpload = new FormData();
                    formDataUpload.append("file", file);

                    const response = await apiClient.upload<{
                        status: string;
                        data: { url: string; filename: string };
                    }>("/digital-products/upload", formDataUpload);

                    setUploadedFiles((prev) => [
                        ...prev,
                        {
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            url: response.data.url,
                        },
                    ]);
                }
                toast.success(
                    "Files uploaded",
                    `${acceptedFiles.length} file${acceptedFiles.length !== 1 ? "s" : ""} uploaded successfully.`
                );
            } catch {
                toast.error(
                    "Upload failed",
                    "Failed to upload one or more files. Please try again."
                );
            } finally {
                setIsUploading(false);
            }
        },
        [toast]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    });

    const removeUploadedFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── Gallery Images ──────────────────────────────────────────────────────

    const [galleryImageUrl, setGalleryImageUrl] = useState("");

    const addGalleryImage = () => {
        const url = galleryImageUrl.trim();
        if (!url) return;
        setFormData((prev) => ({
            ...prev,
            galleryImages: [...(prev.galleryImages ?? []), url],
        }));
        setGalleryImageUrl("");
    };

    const removeGalleryImage = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            galleryImages: (prev.galleryImages ?? []).filter(
                (_, i) => i !== index
            ),
        }));
    };

    // ─── Validate & Submit ───────────────────────────────────────────────────

    const validate = () => {
        const result = digitalProductSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0] as string;
                newErrors[path] = issue.message;
            });
            setErrors(newErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const submissionData: Record<string, unknown> = {
            ...formData,
            variants: variants.length > 0 ? variants : undefined,
            previews: previews.length > 0 ? previews : undefined,
            files:
                uploadedFiles.length > 0
                    ? uploadedFiles.map((f) => ({
                          name: f.name,
                          size: f.size,
                          type: f.type,
                          url: f.url,
                      }))
                    : undefined,
        };

        // Clean up empty strings and undefined values
        Object.keys(submissionData).forEach((key) => {
            const val = submissionData[key];
            if (val === "" || val === undefined) {
                delete submissionData[key];
            }
        });

        onSubmit(submissionData);
    };

    // ─── SEO Preview ─────────────────────────────────────────────────────────

    const seoTitle = formData.seoTitle || formData.title || "Product Title";
    const seoSlug = formData.slug || "product-url-slug";
    const seoDescription =
        formData.seoDescription ||
        formData.shortDescription ||
        "Product description will appear here...";

    // ─── Preview type icon helper ────────────────────────────────────────────

    const getPreviewTypeIcon = (type: string) => {
        switch (type) {
            case "image":
                return <ImageIcon className="h-4 w-4" />;
            case "video":
                return <Video className="h-4 w-4" />;
            default:
                return <Link2 className="h-4 w-4" />;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ═══════ Left Column - Main fields ═══════ */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Basic Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter product title"
                                value={formData.title}
                                onChange={handleTitleChange}
                            />
                            {errors.title && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="product-url-slug"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                            {errors.slug && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.slug}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">
                                Short Description
                            </Label>
                            <Textarea
                                id="shortDescription"
                                name="shortDescription"
                                placeholder="Brief summary of the product (max 500 characters)..."
                                className="h-20"
                                value={formData.shortDescription || ""}
                                onChange={handleChange}
                            />
                            <div className="flex justify-between">
                                {errors.shortDescription && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.shortDescription}
                                    </p>
                                )}
                                <p className="text-xs text-zinc-400 ml-auto">
                                    {(formData.shortDescription || "").length}
                                    /500
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Description (Rich Text) */}
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold text-zinc-900 dark:text-white">
                            Description
                        </Label>
                        <RichTextEditor
                            initialContent={formData.description || ""}
                            onChange={handleDescriptionChange}
                            placeholder="Describe your digital product in detail..."
                        />
                        {errors.description && (
                            <p className="text-sm font-medium text-red-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Gallery Images */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Gallery Images
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Add image URLs for the product gallery.
                        </p>

                        {(formData.galleryImages ?? []).length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {(formData.galleryImages ?? []).map(
                                    (url, index) => (
                                        <div
                                            key={index}
                                            className="relative group aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeGalleryImage(index)
                                                }
                                                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Input
                                placeholder="Paste image URL..."
                                value={galleryImageUrl}
                                onChange={(e) =>
                                    setGalleryImageUrl(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        addGalleryImage();
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={addGalleryImage}
                                disabled={!galleryImageUrl.trim()}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Variants */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Variants
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Add pricing tiers or variants for this
                                    product.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addVariant}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Variant
                            </Button>
                        </div>

                        {variants.length > 0 && (
                            <div className="space-y-4">
                                {variants.map((variant, index) => (
                                    <div
                                        key={variant.id}
                                        className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                                    Variant {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveVariant(
                                                            index,
                                                            "up"
                                                        )
                                                    }
                                                    disabled={index === 0}
                                                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        moveVariant(
                                                            index,
                                                            "down"
                                                        )
                                                    }
                                                    disabled={
                                                        index ===
                                                        variants.length - 1
                                                    }
                                                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeVariant(
                                                            variant.id
                                                        )
                                                    }
                                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">
                                                    Name
                                                </Label>
                                                <Input
                                                    placeholder="e.g., Basic, Pro, Enterprise"
                                                    value={variant.name}
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            variant.id,
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs">
                                                    Price
                                                </Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={
                                                        variant.price === 0
                                                            ? ""
                                                            : variant.price.toString()
                                                    }
                                                    onChange={(e) =>
                                                        updateVariant(
                                                            variant.id,
                                                            "price",
                                                            parseFloat(
                                                                e.target.value
                                                            ) || 0
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs">
                                                Features (comma-separated)
                                            </Label>
                                            <Input
                                                placeholder="e.g., 10 slides, Custom colors, Source files"
                                                value={variant.features.join(
                                                    ", "
                                                )}
                                                onChange={(e) => {
                                                    const features = e.target.value
                                                        .split(",")
                                                        .map((f) => f.trim())
                                                        .filter(Boolean);
                                                    updateVariant(
                                                        variant.id,
                                                        "features",
                                                        features
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {variants.length === 0 && (
                            <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                                No variants added yet. Click &quot;Add
                                Variant&quot; to create pricing tiers.
                            </p>
                        )}
                    </div>

                    {/* Previews */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Preview Files
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Add preview images, videos, or links for
                                    this product.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addPreview}
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Preview
                            </Button>
                        </div>

                        {previews.length > 0 && (
                            <div className="space-y-3">
                                {previews.map((preview, index) => (
                                    <div
                                        key={preview.id}
                                        className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <div className="mt-2 text-zinc-400">
                                            {getPreviewTypeIcon(preview.type)}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <Select
                                                    value={preview.type}
                                                    onValueChange={(v) =>
                                                        updatePreview(
                                                            preview.id,
                                                            "type",
                                                            v
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="image">
                                                            Image
                                                        </SelectItem>
                                                        <SelectItem value="video">
                                                            Video
                                                        </SelectItem>
                                                        <SelectItem value="link">
                                                            Link
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <Input
                                                    placeholder="Preview URL"
                                                    value={preview.url}
                                                    onChange={(e) =>
                                                        updatePreview(
                                                            preview.id,
                                                            "url",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="sm:col-span-2"
                                                />
                                            </div>
                                            <Input
                                                placeholder="Thumbnail URL (optional)"
                                                value={preview.thumbnailUrl}
                                                onChange={(e) =>
                                                    updatePreview(
                                                        preview.id,
                                                        "thumbnailUrl",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removePreview(preview.id)
                                            }
                                            className="mt-2 p-1 text-red-400 hover:text-red-600 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {previews.length === 0 && (
                            <p className="text-sm text-zinc-400 dark:text-zinc-500 text-center py-4">
                                No previews added yet. Click &quot;Add
                                Preview&quot; to showcase your product.
                            </p>
                        )}
                    </div>

                    {/* File Upload */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Product Files
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Upload the downloadable product files.
                        </p>

                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-300 dark:border-zinc-600 hover:border-primary/50"
                            }`}
                        >
                            <input {...getInputProps()} />
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                        Uploading files...
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <Upload className="h-8 w-8 text-zinc-400" />
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {isDragActive
                                            ? "Drop files here..."
                                            : "Drag and drop files here, or click to browse"}
                                    </p>
                                    <p className="text-xs text-zinc-400">
                                        Any file type supported
                                    </p>
                                </div>
                            )}
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <FileIcon className="h-5 w-5 text-zinc-400 flex-shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                    {file.name}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {formatFileSize(file.size)}{" "}
                                                    &middot; {file.type || "Unknown type"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeUploadedFile(index)
                                            }
                                            className="p-1 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SEO Preview */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                SEO Preview
                            </h3>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            How this product will appear in Google search results
                        </p>
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-5 border border-zinc-200 dark:border-zinc-700 space-y-1">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                                drkatangablog.com/products/{seoSlug}
                            </p>
                            <h4 className="text-lg text-blue-700 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate">
                                {seoTitle}
                            </h4>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                {seoDescription}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ═══════ Right Column - Sidebar ═══════ */}
                <div className="space-y-6">
                    {/* Publishing */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Publishing
                        </h3>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) =>
                                    handleSelectChange("status", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">
                                        Published
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                    <SelectItem value="coming_soon">
                                        Coming Soon
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.status}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) =>
                                    handleSelectChange("type", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="powerpoint">
                                        PowerPoint
                                    </SelectItem>
                                    <SelectItem value="document">
                                        Document
                                    </SelectItem>
                                    <SelectItem value="web_template">
                                        Web Template
                                    </SelectItem>
                                    <SelectItem value="startup_kit">
                                        Startup Kit
                                    </SelectItem>
                                    <SelectItem value="solution_template">
                                        Solution Template
                                    </SelectItem>
                                    <SelectItem value="design_system">
                                        Design System
                                    </SelectItem>
                                    <SelectItem value="code_template">
                                        Code Template
                                    </SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.type}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.categoryId || ""}
                                onValueChange={(value) =>
                                    handleSelectChange("categoryId", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allCategories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={cat.id}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Pricing
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={
                                    formData.price === 0
                                        ? ""
                                        : formData.price.toString()
                                }
                                onChange={(e) =>
                                    handlePriceChange("price", e.target.value)
                                }
                            />
                            {errors.price && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.price}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="compareAtPrice">
                                Compare At Price
                            </Label>
                            <Input
                                id="compareAtPrice"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Original price (for strikethrough)"
                                value={
                                    formData.compareAtPrice != null
                                        ? formData.compareAtPrice.toString()
                                        : ""
                                }
                                onChange={(e) =>
                                    handlePriceChange(
                                        "compareAtPrice",
                                        e.target.value
                                    )
                                }
                            />
                            {errors.compareAtPrice && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.compareAtPrice}
                                </p>
                            )}
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Set a higher price to show a discount.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select
                                value={formData.currency}
                                onValueChange={(value) =>
                                    handleSelectChange("currency", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">
                                        USD ($)
                                    </SelectItem>
                                    <SelectItem value="EUR">
                                        EUR (&#8364;)
                                    </SelectItem>
                                    <SelectItem value="GBP">
                                        GBP (&#163;)
                                    </SelectItem>
                                    <SelectItem value="CAD">
                                        CAD (C$)
                                    </SelectItem>
                                    <SelectItem value="AUD">
                                        AUD (A$)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Featured Image
                        </h3>

                        <div className="space-y-2">
                            <Input
                                name="featuredImage"
                                placeholder="Image URL"
                                value={formData.featuredImage || ""}
                                onChange={handleChange}
                            />
                        </div>

                        {formData.featuredImage && (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={formData.featuredImage}
                                    alt="Featured"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Tags
                        </h3>

                        {allTags.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {allTags.map((tag) => {
                                    const isSelected = (
                                        formData.tagIds ?? []
                                    ).includes(tag.id);
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTag(tag.id)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                                isSelected
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                                            }`}
                                        >
                                            {tag.name}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-400 dark:text-zinc-500">
                                No tags available.
                            </p>
                        )}
                    </div>

                    {/* Toggles */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Visibility
                        </h3>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Featured</Label>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Display prominently on the store
                                </div>
                            </div>
                            <Switch
                                checked={formData.isFeatured}
                                onCheckedChange={(checked: boolean) =>
                                    handleSwitchChange("isFeatured", checked)
                                }
                            />
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Bestseller</Label>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Mark as a bestselling product
                                </div>
                            </div>
                            <Switch
                                checked={formData.isBestseller}
                                onCheckedChange={(checked: boolean) =>
                                    handleSwitchChange("isBestseller", checked)
                                }
                            />
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            SEO
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="seoTitle">SEO Title</Label>
                            <Input
                                id="seoTitle"
                                name="seoTitle"
                                placeholder="Custom title for search engines"
                                value={formData.seoTitle || ""}
                                onChange={handleChange}
                            />
                            {errors.seoTitle && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.seoTitle}
                                </p>
                            )}
                            <p className="text-xs text-zinc-400">
                                {(formData.seoTitle || "").length}/255
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seoDescription">
                                SEO Description
                            </Label>
                            <Textarea
                                id="seoDescription"
                                name="seoDescription"
                                placeholder="Custom description for search engines"
                                className="h-20"
                                value={formData.seoDescription || ""}
                                onChange={handleChange}
                            />
                            {errors.seoDescription && (
                                <p className="text-sm font-medium text-red-500">
                                    {errors.seoDescription}
                                </p>
                            )}
                            <p className="text-xs text-zinc-400">
                                {(formData.seoDescription || "").length}/500
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>SEO Keywords</Label>
                            {(formData.seoKeywords ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {(formData.seoKeywords ?? []).map(
                                        (keyword, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                            >
                                                {keyword}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeSeoKeyword(index)
                                                    }
                                                    className="hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add keyword..."
                                    value={seoKeywordInput}
                                    onChange={(e) =>
                                        setSeoKeywordInput(e.target.value)
                                    }
                                    onKeyDown={handleSeoKeywordKeyDown}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addSeoKeyword}
                                    disabled={!seoKeywordInput.trim()}
                                    className="flex-shrink-0"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Metadata
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Add custom attributes like slide count, file format,
                            etc.
                        </p>

                        {Object.entries(formData.metadata ?? {}).length > 0 && (
                            <div className="space-y-2">
                                {Object.entries(formData.metadata ?? {}).map(
                                    ([key, value]) => (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
                                        >
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                                    {COMMON_METADATA_KEYS.find(
                                                        (m) => m.key === key
                                                    )?.label || key}
                                                </p>
                                                <p className="text-sm text-zinc-900 dark:text-white truncate">
                                                    {String(value)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMetadataEntry(key)
                                                }
                                                className="p-1 text-zinc-400 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    value={metadataKey}
                                    onValueChange={setMetadataKey}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select key..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMMON_METADATA_KEYS.filter(
                                            (m) =>
                                                !(formData.metadata ?? {})[
                                                    m.key
                                                ]
                                        ).map((m) => (
                                            <SelectItem
                                                key={m.key}
                                                value={m.key}
                                            >
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Input
                                    placeholder="Value..."
                                    value={metadataValue}
                                    onChange={(e) =>
                                        setMetadataValue(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            addMetadataEntry();
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addMetadataEntry}
                                disabled={!metadataKey.trim()}
                                className="w-full"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Metadata
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit buttons */}
            <div className="flex items-center justify-end gap-4">
                <Link href="/products/digital">
                    <Button variant="outline" type="button">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {mode === "create" ? "Create Product" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
