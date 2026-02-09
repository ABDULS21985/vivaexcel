"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
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
    cn,
} from "@digibit/ui/components";
import { Loader2, Save, ArrowLeft, Globe, Clock, FileText } from "lucide-react";
import Link from "next/link";

const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    slug: z.string().min(1, "Slug is required"),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]),
    visibility: z.enum(["public", "members", "paid"]).default("public"),
    minimumTier: z.enum(["free", "basic", "pro", "premium"]).optional(),
    categoryId: z.string().optional(),
    authorId: z.string().min(1, "Author is required"),
    featured: z.boolean().default(false),
    series: z.string().optional(),
    seriesOrder: z.number().optional(),
    canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type BlogPostFormValues = z.infer<typeof blogPostSchema>;

interface BlogPostFormProps {
    initialData?: BlogPostFormValues & { id?: string };
    onSubmit: (data: BlogPostFormValues) => Promise<void>;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function countWords(text: string): number {
    if (!text.trim()) return 0;
    return text.trim().split(/\s+/).length;
}

function estimateReadingTime(wordCount: number): string {
    const minutes = Math.ceil(wordCount / 250);
    if (minutes < 1) return "Less than 1 min read";
    if (minutes === 1) return "1 min read";
    return `${minutes} min read`;
}

export function BlogPostForm({
    initialData,
    onSubmit,
    isLoading,
    mode = "create",
}: BlogPostFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<BlogPostFormValues>(
        initialData || {
            title: "",
            subtitle: "",
            slug: "",
            excerpt: "",
            content: "",
            status: "draft",
            visibility: "public",
            minimumTier: undefined,
            categoryId: "",
            authorId: "current-user",
            featured: false,
            series: "",
            seriesOrder: undefined,
            canonicalUrl: "",
        }
    );
    const [errors, setErrors] = useState<Record<string, string>>({});

    const wordCount = useMemo(() => countWords(formData.content || ""), [formData.content]);
    const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

    const validate = () => {
        const result = blogPostSchema.safeParse(formData);
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

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: mode === "create" && !initialData?.slug ? generateSlug(value) : prev.slug,
        }));
        if (errors.title) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.title;
                return newErrors;
            });
        }
    };

    const handleSelectChange = (name: keyof BlogPostFormValues, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSwitchChange = (name: keyof BlogPostFormValues, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleNumberChange = (name: keyof BlogPostFormValues, value: string) => {
        const num = value === "" ? undefined : parseInt(value, 10);
        setFormData((prev) => ({ ...prev, [name]: num }));
    };

    const showTierSelect = formData.visibility === "members" || formData.visibility === "paid";

    // SEO Preview values
    const seoTitle = formData.title || "Post Title";
    const seoSlug = formData.slug || "post-url-slug";
    const seoDescription = formData.excerpt || "Post description will appear here...";

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main fields */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Basic Information
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Enter post title"
                                value={formData.title}
                                onChange={handleTitleChange}
                            />
                            {errors.title && (
                                <p className="text-sm font-medium text-red-500">{errors.title}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subtitle">Subtitle</Label>
                            <Input
                                id="subtitle"
                                name="subtitle"
                                placeholder="Optional subtitle or tagline"
                                value={formData.subtitle || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                name="slug"
                                placeholder="post-url-slug"
                                value={formData.slug}
                                onChange={handleChange}
                            />
                            {errors.slug && (
                                <p className="text-sm font-medium text-red-500">{errors.slug}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea
                                id="excerpt"
                                name="excerpt"
                                placeholder="Brief summary of the post..."
                                className="h-24"
                                value={formData.excerpt || ""}
                                onChange={handleChange}
                            />
                            {errors.excerpt && (
                                <p className="text-sm font-medium text-red-500">{errors.excerpt}</p>
                            )}
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                Content
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                                <span className="flex items-center gap-1.5">
                                    <FileText className="h-4 w-4" />
                                    {wordCount.toLocaleString()} words
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    {readingTime}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col">
                            <Textarea
                                name="content"
                                placeholder="Write your post content here..."
                                className="min-h-[400px] h-full font-mono text-sm flex-1"
                                value={formData.content || ""}
                                onChange={handleChange}
                            />
                            {errors.content && (
                                <p className="text-sm font-medium text-red-500">{errors.content}</p>
                            )}
                        </div>
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
                            How this post will appear in Google search results
                        </p>
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-5 border border-zinc-200 dark:border-zinc-700 space-y-1">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                                vivaexcel.com/blog/{seoSlug}
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

                {/* Right Column - Sidebar fields */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Publishing
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
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <p className="text-sm font-medium text-red-500">{errors.status}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Visibility</Label>
                            <Select
                                value={formData.visibility}
                                onValueChange={(value) => handleSelectChange("visibility", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select visibility" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">Public</SelectItem>
                                    <SelectItem value="members">Members Only</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {showTierSelect && (
                            <div className="space-y-2">
                                <Label>Minimum Tier</Label>
                                <Select
                                    value={formData.minimumTier || "free"}
                                    onValueChange={(value) => handleSelectChange("minimumTier", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select minimum tier" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="free">Free</SelectItem>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                        <SelectItem value="premium">Premium</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.categoryId || ""}
                                onValueChange={(value) => handleSelectChange("categoryId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="finance">Finance</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.categoryId && (
                                <p className="text-sm font-medium text-red-500">{errors.categoryId}</p>
                            )}
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-lg border p-4 space-y-0">
                            <div className="space-y-0.5">
                                <Label className="text-base">Featured Post</Label>
                                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Display this post on the home page
                                </div>
                            </div>
                            <Switch
                                checked={formData.featured}
                                onCheckedChange={(checked: boolean) => handleSwitchChange("featured", checked)}
                            />
                        </div>
                    </div>

                    {/* Series Section */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Series
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="series">Series Name</Label>
                            <Input
                                id="series"
                                name="series"
                                placeholder="e.g., Getting Started with React"
                                value={formData.series || ""}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Optional. Group related posts into a series.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="seriesOrder">Part Number</Label>
                            <Input
                                id="seriesOrder"
                                name="seriesOrder"
                                type="number"
                                min={1}
                                placeholder="e.g., 1"
                                value={formData.seriesOrder?.toString() || ""}
                                onChange={(e) => handleNumberChange("seriesOrder", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4">
                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                            Advanced
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="canonicalUrl">Canonical URL</Label>
                            <Input
                                id="canonicalUrl"
                                name="canonicalUrl"
                                type="url"
                                placeholder="https://..."
                                value={formData.canonicalUrl || ""}
                                onChange={handleChange}
                            />
                            {errors.canonicalUrl && (
                                <p className="text-sm font-medium text-red-500">{errors.canonicalUrl}</p>
                            )}
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Set if this post was originally published elsewhere.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-4">
                <Link href="/blog">
                    <Button variant="outline" type="button">
                        Cancel
                    </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {mode === "create" ? "Create Post" : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
