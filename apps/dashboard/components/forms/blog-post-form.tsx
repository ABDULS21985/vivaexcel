"use client";

import * as React from "react";
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
    Switch,
    Label,
} from "@ktblog/ui/components";
import { Loader2, Globe, Sparkles, X, BarChart3, BookOpen, Type, FileText, Zap } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import {
    useGenerateTitles,
    useGenerateMetaDescription,
    useGenerateExcerpt,
    useAnalyzeContent,
    useImproveText,
    type ContentAnalysis,
} from "@/hooks/use-ai";
import { useToast } from "@/components/toast";
import type { Editor } from "@tiptap/react";

const blogPostSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional(),
    slug: z.string().min(1, "Slug is required"),
    excerpt: z.string().optional(),
    content: z.string().optional(),
    status: z.enum(["draft", "published", "scheduled", "archived"]),
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

export function BlogPostForm({
    initialData,
    onSubmit,
    isLoading,
    mode = "create",
}: BlogPostFormProps) {
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
    const [showAiPanel, setShowAiPanel] = useState(false);
    const editorRef = React.useRef<Editor | null>(null);

    const toast = useToast();

    // AI Mutations
    const generateTitles = useGenerateTitles();
    const generateMetaDescription = useGenerateMetaDescription();
    const generateExcerpt = useGenerateExcerpt();
    const analyzeContent = useAnalyzeContent();
    const improveText = useImproveText();

    const handleEditorReady = React.useCallback((editor: Editor) => {
        editorRef.current = editor;
    }, []);

    const handleAiAction = React.useCallback(
        (action: string) => {
            switch (action) {
                case "titles":
                    if (!formData.content && !formData.title) {
                        toast.warning("No content", "Add some content or a title first to generate title suggestions.");
                        return;
                    }
                    generateTitles.mutate(formData.content || formData.title, {
                        onError: () => toast.error("AI Error", "Failed to generate titles."),
                    });
                    setShowAiPanel(true);
                    break;
                case "improve": {
                    const editor = editorRef.current;
                    if (!editor) return;
                    const { from, to, empty } = editor.state.selection;
                    if (empty) {
                        toast.warning("No selection", "Select some text in the editor to improve.");
                        return;
                    }
                    const selectedText = editor.state.doc.textBetween(from, to, " ");
                    improveText.mutate(
                        { text: selectedText, tone: "professional" },
                        {
                            onSuccess: (improved) => {
                                editor
                                    .chain()
                                    .focus()
                                    .deleteRange({ from, to })
                                    .insertContentAt(from, improved)
                                    .run();
                                toast.success("Text improved", "The selected text has been replaced.");
                            },
                            onError: () => toast.error("AI Error", "Failed to improve text."),
                        }
                    );
                    break;
                }
                case "excerpt":
                    if (!formData.content) {
                        toast.warning("No content", "Add some content first to generate an excerpt.");
                        return;
                    }
                    generateExcerpt.mutate(
                        { content: formData.content },
                        {
                            onError: () => toast.error("AI Error", "Failed to generate excerpt."),
                        }
                    );
                    setShowAiPanel(true);
                    break;
                case "analyze":
                    if (!formData.content) {
                        toast.warning("No content", "Add some content first to analyze.");
                        return;
                    }
                    analyzeContent.mutate(formData.content, {
                        onError: () => toast.error("AI Error", "Failed to analyze content."),
                    });
                    setShowAiPanel(true);
                    break;
            }
        },
        [formData.content, formData.title, generateTitles, generateExcerpt, analyzeContent, improveText, toast]
    );

    const handleContentChange = React.useCallback(
        (html: string) => {
            setFormData((prev) => ({ ...prev, content: html }));
            if (errors.content) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.content;
                    return newErrors;
                });
            }
        },
        [errors.content]
    );

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
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold text-zinc-900 dark:text-white">
                            Content
                        </Label>
                        <RichTextEditor
                            initialContent={formData.content || ""}
                            onChange={handleContentChange}
                            placeholder="Start writing your post..."
                            onAiAction={handleAiAction}
                            onEditorReady={handleEditorReady}
                        />
                        {errors.content && (
                            <p className="text-sm font-medium text-red-500">{errors.content}</p>
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
                            How this post will appear in Google search results
                        </p>
                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-5 border border-zinc-200 dark:border-zinc-700 space-y-1">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400 truncate">
                                drkatangablog.com/blog/{seoSlug}
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
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
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

                    {/* AI Assistant Panel */}
                    {showAiPanel && (
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl border border-purple-200 dark:border-purple-800 space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                        AI Assistant
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowAiPanel(false)}
                                    className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                                    aria-label="Close AI panel"
                                >
                                    <X className="h-4 w-4 text-zinc-500" />
                                </button>
                            </div>

                            {/* Title Suggestions */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Type className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                    <Label className="text-sm font-medium">Title Suggestions</Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled={generateTitles.isPending || (!formData.content && !formData.title)}
                                    onClick={() =>
                                        generateTitles.mutate(formData.content || formData.title, {
                                            onError: () => toast.error("AI Error", "Failed to generate titles."),
                                        })
                                    }
                                >
                                    {generateTitles.isPending ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    Generate Titles
                                </Button>
                                {generateTitles.isError && (
                                    <p className="text-xs text-red-500">
                                        {generateTitles.error?.message || "Failed to generate titles."}
                                    </p>
                                )}
                                {generateTitles.isSuccess && generateTitles.data && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {generateTitles.data.map((title, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        title,
                                                        slug:
                                                            mode === "create" && !initialData?.slug
                                                                ? generateSlug(title)
                                                                : prev.slug,
                                                    }));
                                                    toast.success("Title applied", `"${title}" has been set as the title.`);
                                                }}
                                                className="text-xs px-2.5 py-1.5 rounded-full bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 transition-colors text-left"
                                            >
                                                {title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Meta Description */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                    <Label className="text-sm font-medium">Meta Description</Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled={generateMetaDescription.isPending || !formData.title}
                                    onClick={() =>
                                        generateMetaDescription.mutate(
                                            { title: formData.title, content: formData.content || "" },
                                            {
                                                onError: () =>
                                                    toast.error("AI Error", "Failed to generate meta description."),
                                            }
                                        )
                                    }
                                >
                                    {generateMetaDescription.isPending ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    Generate Meta Description
                                </Button>
                                {generateMetaDescription.isError && (
                                    <p className="text-xs text-red-500">
                                        {generateMetaDescription.error?.message || "Failed to generate meta description."}
                                    </p>
                                )}
                                {generateMetaDescription.isSuccess && generateMetaDescription.data && (
                                    <div className="space-y-2 pt-1">
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-md">
                                            {generateMetaDescription.data}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    excerpt: generateMetaDescription.data,
                                                }));
                                                toast.success("Applied", "Meta description set as excerpt.");
                                            }}
                                        >
                                            Use as Excerpt
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Excerpt */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                    <Label className="text-sm font-medium">Excerpt</Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled={generateExcerpt.isPending || !formData.content}
                                    onClick={() =>
                                        generateExcerpt.mutate(
                                            { content: formData.content || "" },
                                            {
                                                onError: () =>
                                                    toast.error("AI Error", "Failed to generate excerpt."),
                                            }
                                        )
                                    }
                                >
                                    {generateExcerpt.isPending ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <Sparkles className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    Generate Excerpt
                                </Button>
                                {generateExcerpt.isError && (
                                    <p className="text-xs text-red-500">
                                        {generateExcerpt.error?.message || "Failed to generate excerpt."}
                                    </p>
                                )}
                                {generateExcerpt.isSuccess && generateExcerpt.data && (
                                    <div className="space-y-2 pt-1">
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-md">
                                            {generateExcerpt.data}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    excerpt: generateExcerpt.data,
                                                }));
                                                toast.success("Applied", "Excerpt has been set.");
                                            }}
                                        >
                                            Use Excerpt
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* SEO Analysis */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                                    <Label className="text-sm font-medium">Content Analysis</Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    disabled={analyzeContent.isPending || !formData.content}
                                    onClick={() =>
                                        analyzeContent.mutate(formData.content || "", {
                                            onError: () =>
                                                toast.error("AI Error", "Failed to analyze content."),
                                        })
                                    }
                                >
                                    {analyzeContent.isPending ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <BarChart3 className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    Analyze Content
                                </Button>
                                {analyzeContent.isError && (
                                    <p className="text-xs text-red-500">
                                        {analyzeContent.error?.message || "Failed to analyze content."}
                                    </p>
                                )}
                                {analyzeContent.isSuccess && analyzeContent.data && (
                                    <div className="pt-1 space-y-3">
                                        {/* Score Metrics */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-2.5 text-center">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                    {analyzeContent.data.readabilityScore}
                                                    <span className="text-xs font-normal text-zinc-500">/100</span>
                                                </p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                    Readability
                                                </p>
                                            </div>
                                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-2.5 text-center">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                    {analyzeContent.data.seoScore}
                                                    <span className="text-xs font-normal text-zinc-500">/100</span>
                                                </p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                    SEO Score
                                                </p>
                                            </div>
                                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-2.5 text-center">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                    {analyzeContent.data.wordCount.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                    Words
                                                </p>
                                            </div>
                                            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-md p-2.5 text-center">
                                                <p className="text-lg font-bold text-zinc-900 dark:text-white">
                                                    {analyzeContent.data.estimatedReadTime}
                                                    <span className="text-xs font-normal text-zinc-500"> min</span>
                                                </p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                                                    Read Time
                                                </p>
                                            </div>
                                        </div>

                                        {/* Key Topics */}
                                        {analyzeContent.data.keyTopics.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    Key Topics
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {analyzeContent.data.keyTopics.map((topic, i) => (
                                                        <span
                                                            key={i}
                                                            className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                                        >
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Suggestions */}
                                        {analyzeContent.data.suggestions.length > 0 && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                                    Suggestions
                                                </p>
                                                <ul className="space-y-1">
                                                    {analyzeContent.data.suggestions.map((suggestion, i) => (
                                                        <li
                                                            key={i}
                                                            className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5"
                                                        >
                                                            <Zap className="h-3 w-3 text-amber-500 flex-shrink-0 mt-0.5" />
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Improve Selection hint */}
                            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-1.5">
                                    <Zap className="h-3 w-3 flex-shrink-0 mt-0.5" />
                                    Select text in the editor and use the AI toolbar menu to improve it.
                                </p>
                                {improveText.isPending && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-purple-600 dark:text-purple-400">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Improving selected text...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAiPanel(!showAiPanel)}
                    className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-900/20"
                >
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
                <div className="flex items-center gap-4">
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
            </div>
        </form>
    );
}
