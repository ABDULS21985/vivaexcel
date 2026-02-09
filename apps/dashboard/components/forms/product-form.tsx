"use client";

import * as React from "react";
import {
    Input,
    Button,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn,
} from "@digibit/ui/components";
import { Loader2 } from "lucide-react";

export interface ProductFormData {
    id?: string;
    name: string;
    tagline: string;
    description: string;
    status: "draft" | "published" | "archived";
    accentColor: string;
    websiteUrl: string;
    features: string[];
}

interface ProductFormProps {
    initialData?: Partial<ProductFormData>;
    onSubmit: (data: ProductFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
];

const colorPresets = [
    { value: "#1E4DB7", label: "Primary Blue" },
    { value: "#143A8F", label: "Secondary Blue" },
    { value: "#F59A23", label: "Orange" },
    { value: "#E86A1D", label: "Red Orange" },
    { value: "#10B981", label: "Emerald" },
    { value: "#6366F1", label: "Indigo" },
    { value: "#8B5CF6", label: "Purple" },
];

export function ProductForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = "create",
}: ProductFormProps) {
    const [formData, setFormData] = React.useState<ProductFormData>({
        name: initialData?.name || "",
        tagline: initialData?.tagline || "",
        description: initialData?.description || "",
        status: initialData?.status || "draft",
        accentColor: initialData?.accentColor || "#1E4DB7",
        websiteUrl: initialData?.websiteUrl || "",
        features: initialData?.features || [],
        ...(initialData?.id && { id: initialData.id }),
    });

    const [featuresInput, setFeaturesInput] = React.useState(
        initialData?.features?.join(", ") || ""
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleChange = (
        field: keyof ProductFormData,
        value: string | string[]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleFeaturesChange = (value: string) => {
        setFeaturesInput(value);
        const features = value
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f.length > 0);
        handleChange("features", features);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Product name is required";
        }
        if (!formData.tagline.trim()) {
            newErrors.tagline = "Tagline is required";
        }
        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        }
        if (formData.websiteUrl && !formData.websiteUrl.startsWith("/")) {
            newErrors.websiteUrl = "Website URL should start with /";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., DigiGate"
                    className={cn(errors.name && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Tagline */}
            <div className="space-y-2">
                <label
                    htmlFor="tagline"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Tagline <span className="text-red-500">*</span>
                </label>
                <Input
                    id="tagline"
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => handleChange("tagline", e.target.value)}
                    placeholder="e.g., The Command Center for Your Digital Ecosystem"
                    className={cn(errors.tagline && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.tagline && (
                    <p className="text-sm text-red-500">{errors.tagline}</p>
                )}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label
                    htmlFor="description"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    placeholder="Describe the product..."
                    rows={4}
                    className={cn(errors.description && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                )}
            </div>

            {/* Status and Color Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div className="space-y-2">
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Status
                    </label>
                    <Select
                        value={formData.status}
                        onValueChange={(value) =>
                            handleChange("status", value as ProductFormData["status"])
                        }
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                    <label
                        htmlFor="accentColor"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                        <Select
                            value={formData.accentColor}
                            onValueChange={(value) => handleChange("accentColor", value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                            <SelectContent>
                                {colorPresets.map((color) => (
                                    <SelectItem key={color.value} value={color.value}>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: color.value }}
                                            />
                                            {color.label}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div
                            className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-600"
                            style={{ backgroundColor: formData.accentColor }}
                        />
                    </div>
                </div>
            </div>

            {/* Website URL */}
            <div className="space-y-2">
                <label
                    htmlFor="websiteUrl"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Website URL Path
                </label>
                <Input
                    id="websiteUrl"
                    type="text"
                    value={formData.websiteUrl}
                    onChange={(e) => handleChange("websiteUrl", e.target.value)}
                    placeholder="/products/your-product"
                    className={cn(errors.websiteUrl && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.websiteUrl && (
                    <p className="text-sm text-red-500">{errors.websiteUrl}</p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Path relative to globaldigibit.com
                </p>
            </div>

            {/* Features */}
            <div className="space-y-2">
                <label
                    htmlFor="features"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Features (comma-separated)
                </label>
                <Input
                    id="features"
                    type="text"
                    value={featuresInput}
                    onChange={(e) => handleFeaturesChange(e.target.value)}
                    placeholder="Feature 1, Feature 2, Feature 3"
                    disabled={isLoading}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter features separated by commas
                </p>
                {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.features.map((feature, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
                            >
                                {feature}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {mode === "create" ? "Create Product" : "Update Product"}
                </Button>
            </div>
        </form>
    );
}

export default ProductForm;
