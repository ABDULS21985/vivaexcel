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
import { Loader2, Plus, X } from "lucide-react";

export interface ServiceFormData {
    id?: string;
    name: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    category: string;
    status: "draft" | "published" | "archived";
    icon: string;
    features: string[];
    benefits: string[];
}

interface ServiceFormProps {
    initialData?: Partial<ServiceFormData>;
    onSubmit: (data: ServiceFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "archived", label: "Archived" },
];

const categoryOptions = [
    { value: "ai-data", label: "AI & Data" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "governance", label: "Governance" },
    { value: "blockchain", label: "Blockchain" },
    { value: "consulting", label: "Consulting" },
    { value: "training", label: "Training" },
];

const iconOptions = [
    { value: "brain", label: "Brain (AI)" },
    { value: "shield", label: "Shield (Security)" },
    { value: "building", label: "Building (Governance)" },
    { value: "link", label: "Link (Blockchain)" },
    { value: "users", label: "Users (Consulting)" },
    { value: "book", label: "Book (Training)" },
    { value: "chart", label: "Chart (Analytics)" },
    { value: "cloud", label: "Cloud (Cloud Services)" },
];

export function ServiceForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = "create",
}: ServiceFormProps) {
    const [formData, setFormData] = React.useState<ServiceFormData>({
        name: initialData?.name || "",
        slug: initialData?.slug || "",
        shortDescription: initialData?.shortDescription || "",
        fullDescription: initialData?.fullDescription || "",
        category: initialData?.category || "",
        status: initialData?.status || "draft",
        icon: initialData?.icon || "brain",
        features: initialData?.features || [],
        benefits: initialData?.benefits || [],
        ...(initialData?.id && { id: initialData.id }),
    });

    const [featureInput, setFeatureInput] = React.useState("");
    const [benefitInput, setBenefitInput] = React.useState("");
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleChange = (
        field: keyof ServiceFormData,
        value: string | string[]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Auto-generate slug from name
    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleNameChange = (value: string) => {
        handleChange("name", value);
        if (!initialData?.slug) {
            handleChange("slug", generateSlug(value));
        }
    };

    const addFeature = () => {
        if (featureInput.trim()) {
            handleChange("features", [...formData.features, featureInput.trim()]);
            setFeatureInput("");
        }
    };

    const removeFeature = (index: number) => {
        handleChange(
            "features",
            formData.features.filter((_, i) => i !== index)
        );
    };

    const addBenefit = () => {
        if (benefitInput.trim()) {
            handleChange("benefits", [...formData.benefits, benefitInput.trim()]);
            setBenefitInput("");
        }
    };

    const removeBenefit = (index: number) => {
        handleChange(
            "benefits",
            formData.benefits.filter((_, i) => i !== index)
        );
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Service name is required";
        }
        if (!formData.slug.trim()) {
            newErrors.slug = "Slug is required";
        }
        if (!formData.shortDescription.trim()) {
            newErrors.shortDescription = "Short description is required";
        }
        if (!formData.category) {
            newErrors.category = "Category is required";
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
            {/* Service Name */}
            <div className="space-y-2">
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Service Name <span className="text-red-500">*</span>
                </label>
                <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., AI & Machine Learning"
                    className={cn(errors.name && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                )}
            </div>

            {/* Slug and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Slug */}
                <div className="space-y-2">
                    <label
                        htmlFor="slug"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        URL Slug <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleChange("slug", e.target.value)}
                        placeholder="ai-machine-learning"
                        className={cn(errors.slug && "border-red-500")}
                        disabled={isLoading}
                    />
                    {errors.slug && (
                        <p className="text-sm text-red-500">{errors.slug}</p>
                    )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Category <span className="text-red-500">*</span>
                    </label>
                    <Select
                        value={formData.category}
                        onValueChange={(value) => handleChange("category", value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger className={cn(errors.category && "border-red-500")}>
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.category && (
                        <p className="text-sm text-red-500">{errors.category}</p>
                    )}
                </div>
            </div>

            {/* Status and Icon Row */}
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
                            handleChange("status", value as ServiceFormData["status"])
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

                {/* Icon */}
                <div className="space-y-2">
                    <label
                        htmlFor="icon"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Icon
                    </label>
                    <Select
                        value={formData.icon}
                        onValueChange={(value) => handleChange("icon", value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                        <SelectContent>
                            {iconOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Short Description */}
            <div className="space-y-2">
                <label
                    htmlFor="shortDescription"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Short Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) => handleChange("shortDescription", e.target.value)}
                    placeholder="Brief overview of the service (1-2 sentences)"
                    rows={2}
                    className={cn(errors.shortDescription && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.shortDescription && (
                    <p className="text-sm text-red-500">{errors.shortDescription}</p>
                )}
            </div>

            {/* Full Description */}
            <div className="space-y-2">
                <label
                    htmlFor="fullDescription"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Full Description
                </label>
                <Textarea
                    id="fullDescription"
                    value={formData.fullDescription}
                    onChange={(e) => handleChange("fullDescription", e.target.value)}
                    placeholder="Detailed description of the service..."
                    rows={5}
                    disabled={isLoading}
                />
            </div>

            {/* Features */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Key Features
                </label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Add a feature"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addFeature();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addFeature}
                        disabled={isLoading || !featureInput.trim()}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.features.map((feature, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full"
                            >
                                {feature}
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="ml-1 hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Benefits */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Benefits
                </label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={benefitInput}
                        onChange={(e) => setBenefitInput(e.target.value)}
                        placeholder="Add a benefit"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addBenefit();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addBenefit}
                        disabled={isLoading || !benefitInput.trim()}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.benefits.map((benefit, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                            >
                                {benefit}
                                <button
                                    type="button"
                                    onClick={() => removeBenefit(index)}
                                    className="ml-1 hover:text-red-500"
                                >
                                    <X className="h-3 w-3" />
                                </button>
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
                    {mode === "create" ? "Create Service" : "Update Service"}
                </Button>
            </div>
        </form>
    );
}

export default ServiceForm;
