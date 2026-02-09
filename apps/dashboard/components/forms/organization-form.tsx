"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as z from "zod";
import {
    Input,
    Button,
    Textarea,
    Switch,
    Label,
} from "@ktblog/ui/components";
import { Loader2, Building, Globe, ImageIcon } from "lucide-react";

const organizationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    logoUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
    isActive: z.boolean().default(true),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
    initialData?: OrganizationFormValues & { id?: string };
    onSubmit: (data: OrganizationFormValues) => Promise<void>;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

export function OrganizationForm({
    initialData,
    onSubmit,
    isLoading,
    mode = "create",
}: OrganizationFormProps) {
    const [formData, setFormData] = useState<OrganizationFormValues>(
        initialData || {
            name: "",
            slug: "",
            description: "",
            website: "",
            logoUrl: "",
            isActive: true,
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const result = organizationSchema.safeParse(formData);
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
        if (validate()) {
            await onSubmit(formData);
        }
    };

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

    const handleSwitchChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, isActive: checked }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Organization Details
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Acme Corp"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            {errors.name && (
                                <p className="text-sm font-medium text-red-500">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="acme-corp"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                            {errors.slug && (
                                <p className="text-sm font-medium text-red-500">{errors.slug}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Brief description of the organization..."
                                className="h-24"
                                value={formData.description || ""}
                                onChange={handleChange}
                            />
                            {errors.description && (
                                <p className="text-sm font-medium text-red-500">{errors.description}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Online Presence
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="website">Website URL</Label>
                            <Input
                                id="website"
                                name="website"
                                placeholder="https://example.com"
                                value={formData.website || ""}
                                onChange={handleChange}
                            />
                            {errors.website && (
                                <p className="text-sm font-medium text-red-500">{errors.website}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">Logo URL</Label>
                            <div className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <Input
                                        id="logoUrl"
                                        name="logoUrl"
                                        placeholder="https://example.com/logo.png"
                                        value={formData.logoUrl || ""}
                                        onChange={handleChange}
                                    />
                                </div>
                                {formData.logoUrl && (
                                    <div className="h-10 w-10 rounded border overflow-hidden flex-shrink-0 bg-white">
                                        <img
                                            src={formData.logoUrl}
                                            alt="Logo preview"
                                            className="h-full w-full object-contain"
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.logoUrl && (
                                <p className="text-sm font-medium text-red-500">{errors.logoUrl}</p>
                            )}
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4 space-y-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Active Status</Label>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Activate or deactivate this organization
                                </div>
                            </div>
                            <Switch
                                checked={formData.isActive}
                                onCheckedChange={handleSwitchChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "create" ? "Create Organization" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
