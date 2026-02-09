"use client";

import * as React from "react";
import { Input, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Textarea, Switch, Label } from "@ktblog/ui/components";
import { Loader2, ArrowRight } from "lucide-react";

export interface RedirectFormValues {
    source: string;
    destination: string;
    type: "301" | "302";
    isActive: boolean;
    notes: string;
}

interface RedirectFormProps {
    initialData?: RedirectFormValues;
    onSubmit: (data: RedirectFormValues) => Promise<void>;
    isLoading?: boolean;
    mode?: "create" | "edit";
    existingSources?: string[];
}

export function RedirectForm({
    initialData,
    onSubmit,
    isLoading = false,
    mode = "create",
    existingSources = [],
}: RedirectFormProps) {
    const [formData, setFormData] = React.useState<RedirectFormValues>(
        initialData || {
            source: "",
            destination: "",
            type: "301",
            isActive: true,
            notes: "",
        }
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.source.trim()) {
            newErrors.source = "Source URL is required";
        } else if (!formData.source.startsWith("/")) {
            newErrors.source = "Source URL must start with /";
        }

        if (!formData.destination.trim()) {
            newErrors.destination = "Destination URL is required";
        } else if (
            !formData.destination.startsWith("/") &&
            !formData.destination.startsWith("http://") &&
            !formData.destination.startsWith("https://")
        ) {
            newErrors.destination = "Destination must be a relative path (/) or absolute URL (http/https)";
        }

        if (formData.source === formData.destination) {
            newErrors.destination = "Destination cannot be the same as source";
        }

        // Duplicate check for create mode
        if (mode === "create" && existingSources.includes(formData.source)) {
            newErrors.source = "A redirect for this source URL already exists";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            await onSubmit(formData);
        }
    };

    const handleChange = (field: keyof RedirectFormValues, value: string | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source URL */}
            <div className="space-y-2">
                <Label htmlFor="source">Source URL Path</Label>
                <Input
                    id="source"
                    placeholder="/old-blog-post"
                    value={formData.source}
                    onChange={(e) => handleChange("source", e.target.value)}
                />
                {errors.source && (
                    <p className="text-sm font-medium text-red-500">{errors.source}</p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    The URL path to redirect from. Must start with /.
                </p>
            </div>

            {/* Destination URL */}
            <div className="space-y-2">
                <Label htmlFor="destination">Destination URL</Label>
                <Input
                    id="destination"
                    placeholder="/new-blog-post or https://example.com/page"
                    value={formData.destination}
                    onChange={(e) => handleChange("destination", e.target.value)}
                />
                {errors.destination && (
                    <p className="text-sm font-medium text-red-500">{errors.destination}</p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    The URL to redirect to. Can be a relative path or absolute URL.
                </p>
            </div>

            {/* Redirect Type */}
            <div className="space-y-2">
                <Label>Redirect Type</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="301">301 - Permanent Redirect</SelectItem>
                        <SelectItem value="302">302 - Temporary Redirect</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {formData.type === "301"
                        ? "Use 301 for permanent moves. Search engines will update their index."
                        : "Use 302 for temporary redirects. The original URL is preserved in search engines."}
                </p>
            </div>

            {/* Active toggle */}
            <div className="flex flex-row items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                <div className="space-y-0.5">
                    <Label className="text-base">Active</Label>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        Enable or disable this redirect rule
                    </div>
                </div>
                <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => handleChange("isActive", checked)}
                />
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                    id="notes"
                    placeholder="e.g., Old blog post URL changed after migration..."
                    className="h-20"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Document why this redirect exists for future reference.
                </p>
            </div>

            {/* Preview */}
            {formData.source && formData.destination && (
                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider">Preview</p>
                    <div className="flex items-center gap-2 text-sm font-mono">
                        <span className="text-zinc-500">GET</span>
                        <span className="text-zinc-900 dark:text-white font-medium">{formData.source}</span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                            {formData.type}
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <span className="text-primary font-medium">{formData.destination}</span>
                    </div>
                </div>
            )}

            {/* Submit */}
            <div className="flex items-center justify-end gap-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "create" ? "Create Redirect" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}

export default RedirectForm;
