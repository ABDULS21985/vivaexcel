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
import {
    Loader2,
    Bold,
    Italic,
    Underline,
    List,
    ListOrdered,
    Link,
    Image,
    Code,
    Heading1,
    Heading2,
    Quote,
    Plus,
    X,
} from "lucide-react";

export interface BlogFormData {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    status: "draft" | "published" | "scheduled";
    featuredImage: string;
    tags: string[];
    author: string;
    publishedAt?: string;
}

interface BlogFormProps {
    initialData?: Partial<BlogFormData>;
    onSubmit: (data: BlogFormData) => Promise<void>;
    onCancel?: () => void;
    isLoading?: boolean;
    mode?: "create" | "edit";
}

const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "published", label: "Published" },
    { value: "scheduled", label: "Scheduled" },
];

const categoryOptions = [
    { value: "technology", label: "Technology" },
    { value: "insights", label: "Insights" },
    { value: "news", label: "News" },
    { value: "case-studies", label: "Case Studies" },
    { value: "tutorials", label: "Tutorials" },
    { value: "announcements", label: "Announcements" },
];

// Rich Text Editor Toolbar Button
const ToolbarButton = ({
    icon: Icon,
    label,
    onClick,
    isActive = false,
}: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
    isActive?: boolean;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        className={cn(
            "p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors",
            isActive && "bg-zinc-200 dark:bg-zinc-600"
        )}
    >
        <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
    </button>
);

export function BlogForm({
    initialData,
    onSubmit,
    onCancel,
    isLoading = false,
    mode = "create",
}: BlogFormProps) {
    const [formData, setFormData] = React.useState<BlogFormData>({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        excerpt: initialData?.excerpt || "",
        content: initialData?.content || "",
        category: initialData?.category || "",
        status: initialData?.status || "draft",
        featuredImage: initialData?.featuredImage || "",
        tags: initialData?.tags || [],
        author: initialData?.author || "Admin",
        publishedAt: initialData?.publishedAt,
        ...(initialData?.id && { id: initialData.id }),
    });

    const [tagInput, setTagInput] = React.useState("");
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const contentRef = React.useRef<HTMLTextAreaElement>(null);

    const handleChange = (
        field: keyof BlogFormData,
        value: string | string[]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    // Auto-generate slug from title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    };

    const handleTitleChange = (value: string) => {
        handleChange("title", value);
        if (!initialData?.slug) {
            handleChange("slug", generateSlug(value));
        }
    };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            handleChange("tags", [...formData.tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (index: number) => {
        handleChange(
            "tags",
            formData.tags.filter((_, i) => i !== index)
        );
    };

    // Rich text editor formatting helpers (placeholder implementations)
    const insertFormat = (format: string) => {
        if (!contentRef.current) return;

        const textarea = contentRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = formData.content.substring(start, end);

        let formattedText = "";
        switch (format) {
            case "bold":
                formattedText = `**${selectedText || "bold text"}**`;
                break;
            case "italic":
                formattedText = `*${selectedText || "italic text"}*`;
                break;
            case "underline":
                formattedText = `<u>${selectedText || "underlined text"}</u>`;
                break;
            case "h1":
                formattedText = `\n# ${selectedText || "Heading 1"}\n`;
                break;
            case "h2":
                formattedText = `\n## ${selectedText || "Heading 2"}\n`;
                break;
            case "ul":
                formattedText = `\n- ${selectedText || "List item"}\n`;
                break;
            case "ol":
                formattedText = `\n1. ${selectedText || "List item"}\n`;
                break;
            case "quote":
                formattedText = `\n> ${selectedText || "Quote"}\n`;
                break;
            case "code":
                formattedText = `\`${selectedText || "code"}\``;
                break;
            case "link":
                formattedText = `[${selectedText || "link text"}](url)`;
                break;
            case "image":
                formattedText = `![${selectedText || "alt text"}](image-url)`;
                break;
            default:
                formattedText = selectedText;
        }

        const newContent =
            formData.content.substring(0, start) +
            formattedText +
            formData.content.substring(end);
        handleChange("content", newContent);

        // Focus back on textarea
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + formattedText.length,
                start + formattedText.length
            );
        }, 0);
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "Title is required";
        }
        if (!formData.slug.trim()) {
            newErrors.slug = "Slug is required";
        }
        if (!formData.excerpt.trim()) {
            newErrors.excerpt = "Excerpt is required";
        }
        if (!formData.content.trim()) {
            newErrors.content = "Content is required";
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
            {/* Title */}
            <div className="space-y-2">
                <label
                    htmlFor="title"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Title <span className="text-red-500">*</span>
                </label>
                <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter blog post title"
                    className={cn(errors.title && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.title && (
                    <p className="text-sm text-red-500">{errors.title}</p>
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
                        placeholder="blog-post-url"
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

            {/* Status and Author Row */}
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
                            handleChange("status", value as BlogFormData["status"])
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

                {/* Author */}
                <div className="space-y-2">
                    <label
                        htmlFor="author"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                        Author
                    </label>
                    <Input
                        id="author"
                        type="text"
                        value={formData.author}
                        onChange={(e) => handleChange("author", e.target.value)}
                        placeholder="Author name"
                        disabled={isLoading}
                    />
                </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
                <label
                    htmlFor="featuredImage"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Featured Image URL
                </label>
                <Input
                    id="featuredImage"
                    type="text"
                    value={formData.featuredImage}
                    onChange={(e) => handleChange("featuredImage", e.target.value)}
                    placeholder="/images/blog/featured-image.jpg"
                    disabled={isLoading}
                />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
                <label
                    htmlFor="excerpt"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Excerpt <span className="text-red-500">*</span>
                </label>
                <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleChange("excerpt", e.target.value)}
                    placeholder="Brief summary of the blog post (shown in listings)"
                    rows={3}
                    className={cn(errors.excerpt && "border-red-500")}
                    disabled={isLoading}
                />
                {errors.excerpt && (
                    <p className="text-sm text-red-500">{errors.excerpt}</p>
                )}
            </div>

            {/* Content with Rich Text Editor Toolbar */}
            <div className="space-y-2">
                <label
                    htmlFor="content"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                    Content <span className="text-red-500">*</span>
                </label>
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-50 dark:bg-zinc-700/50 border border-b-0 border-zinc-200 dark:border-zinc-600 rounded-t-lg">
                    <ToolbarButton icon={Bold} label="Bold" onClick={() => insertFormat("bold")} />
                    <ToolbarButton icon={Italic} label="Italic" onClick={() => insertFormat("italic")} />
                    <ToolbarButton icon={Underline} label="Underline" onClick={() => insertFormat("underline")} />
                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                    <ToolbarButton icon={Heading1} label="Heading 1" onClick={() => insertFormat("h1")} />
                    <ToolbarButton icon={Heading2} label="Heading 2" onClick={() => insertFormat("h2")} />
                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                    <ToolbarButton icon={List} label="Bullet List" onClick={() => insertFormat("ul")} />
                    <ToolbarButton icon={ListOrdered} label="Numbered List" onClick={() => insertFormat("ol")} />
                    <ToolbarButton icon={Quote} label="Quote" onClick={() => insertFormat("quote")} />
                    <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-600 mx-1" />
                    <ToolbarButton icon={Link} label="Link" onClick={() => insertFormat("link")} />
                    <ToolbarButton icon={Image} label="Image" onClick={() => insertFormat("image")} />
                    <ToolbarButton icon={Code} label="Code" onClick={() => insertFormat("code")} />
                </div>
                <Textarea
                    ref={contentRef}
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="Write your blog post content here... (Markdown supported)"
                    rows={15}
                    className={cn(
                        "rounded-t-none font-mono text-sm",
                        errors.content && "border-red-500"
                    )}
                    disabled={isLoading}
                />
                {errors.content && (
                    <p className="text-sm text-red-500">{errors.content}</p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Supports Markdown formatting. Use the toolbar above for quick formatting.
                </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Tags
                </label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="Add a tag"
                        disabled={isLoading}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addTag();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={isLoading || !tagInput.trim()}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 text-primary rounded-full"
                            >
                                #{tag}
                                <button
                                    type="button"
                                    onClick={() => removeTag(index)}
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
                <Button type="submit" variant="outline" disabled={isLoading}>
                    Save as Draft
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {mode === "create" ? "Publish Post" : "Update Post"}
                </Button>
            </div>
        </form>
    );
}

export default BlogForm;
