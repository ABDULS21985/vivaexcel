"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
    Label,
} from "@ktblog/ui/components";
import { Loader2, Send, Save } from "lucide-react";
import Link from "next/link";

const newsletterSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    content: z.string().optional(),
    status: z.enum(["draft", "scheduled", "sent"]),
    scheduledAt: z.string().optional(), // In a real app, use a date picker
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
    initialData?: NewsletterFormValues & { id?: string };
    onSubmit: (data: NewsletterFormValues) => Promise<void>;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

export function NewsletterForm({
    initialData,
    onSubmit,
    isLoading,
    mode = "create",
}: NewsletterFormProps) {
    const [formData, setFormData] = useState<NewsletterFormValues>(
        initialData || {
            subject: "",
            content: "",
            status: "draft",
            scheduledAt: "",
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const result = newsletterSchema.safeParse(formData);
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

    const handleSelectChange = (name: keyof NewsletterFormValues, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Campaign Details
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="subject">Subject Line</Label>
                            <Input
                                id="subject"
                                name="subject"
                                placeholder="Enter email subject"
                                value={formData.subject}
                                onChange={handleChange}
                            />
                            {errors.subject && (
                                <p className="text-sm font-medium text-red-500">{errors.subject}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Email Content</Label>
                            <Textarea
                                id="content"
                                name="content"
                                placeholder="Write your email content here (supports markdown)..."
                                className="min-h-[400px] font-mono text-sm"
                                value={formData.content || ""}
                                onChange={handleChange}
                            />
                            {errors.content && (
                                <p className="text-sm font-medium text-red-500">{errors.content}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Sending Options
                        </h3>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleSelectChange("status", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm font-medium text-red-500">{errors.status}</p>
                            )}
                        </div>

                        {formData.status === "scheduled" && (
                            <div className="space-y-2">
                                <Label htmlFor="scheduledAt">Schedule Date</Label>
                                <Input
                                    type="datetime-local"
                                    id="scheduledAt"
                                    name="scheduledAt"
                                    value={formData.scheduledAt || ""}
                                    onChange={handleChange}
                                />
                                {errors.scheduledAt && (
                                    <p className="text-sm font-medium text-red-500">{errors.scheduledAt}</p>
                                )}
                            </div>
                        )}

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {mode === "create" ? "Create Draft" : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
