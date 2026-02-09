"use client";

import * as React from "react";
import {
    cn,
    Button,
    Badge,
    Skeleton,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Textarea,
} from "@digibit/ui/components";
import {
    Sparkles,
    Type,
    FileText,
    Search,
    Wand2,
    Copy,
    Check,
    AlertCircle,
    ChevronRight,
    X,
    Image,
} from "lucide-react";
import {
    useGenerateTitles,
    useGenerateMetaDescription,
    useGenerateExcerpt,
    useAnalyzeContent,
    useImproveText,
    useGenerateAltText,
    type WritingTone,
} from "../../hooks/use-ai";
import { SeoScoreCard } from "./seo-score-card";
import { ContentAnalysisCard } from "./content-analysis";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AiAssistantPanelProps {
    /** The current blog post content */
    content: string;
    /** The current blog post title */
    title: string;
    /** Whether the panel is open */
    isOpen: boolean;
    /** Callback to close the panel */
    onClose: () => void;
    /** Callback when a title suggestion is selected */
    onSelectTitle?: (title: string) => void;
    /** Callback when a meta description is generated */
    onApplyMetaDescription?: (description: string) => void;
    /** Callback when an excerpt is generated */
    onApplyExcerpt?: (excerpt: string) => void;
    /** Callback when improved text is generated */
    onApplyImprovedText?: (text: string) => void;
    /** Currently selected text in the editor */
    selectedText?: string;
    className?: string;
}

// ─── Helper: Copyable Text Block ─────────────────────────────────────────────

function CopyableText({
    text,
    onApply,
    applyLabel = "Apply",
}: {
    text: string;
    onApply?: (text: string) => void;
    applyLabel?: string;
}) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="group relative rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-3">
            <p className="text-sm text-zinc-700 dark:text-zinc-300 pr-8">
                {text}
            </p>
            <div className="flex items-center gap-2 mt-2">
                <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                >
                    {copied ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                </button>
                {onApply && (
                    <button
                        onClick={() => onApply(text)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                        <ChevronRight className="h-3 w-3" />
                        {applyLabel}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Helper: Error Message ───────────────────────────────────────────────────

function ErrorMessage({ message }: { message: string }) {
    return (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
        </div>
    );
}

// ─── Helper: Loading Skeleton ────────────────────────────────────────────────

function LoadingBlock({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        "h-4 rounded",
                        i === lines - 1 ? "w-3/4" : "w-full"
                    )}
                />
            ))}
        </div>
    );
}

// ─── Title Generator Tab ─────────────────────────────────────────────────────

function TitleGeneratorSection({
    content,
    onSelectTitle,
}: {
    content: string;
    onSelectTitle?: (title: string) => void;
}) {
    const { mutate, data, isPending, error, reset } = useGenerateTitles();

    const handleGenerate = () => {
        if (!content.trim()) return;
        reset();
        mutate(content);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Title Generator
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Generate SEO-optimized title suggestions from your
                        content.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleGenerate}
                isLoading={isPending}
                disabled={!content.trim()}
                size="sm"
                variant="outline"
                leftIcon={<Type className="h-4 w-4" />}
                className="w-full"
            >
                Generate Title Suggestions
            </Button>

            {error && (
                <ErrorMessage
                    message={
                        (error as { message?: string })?.message ||
                        "Failed to generate titles. Please try again."
                    }
                />
            )}

            {isPending && <LoadingBlock lines={5} />}

            {data && data.length > 0 && (
                <div className="space-y-2">
                    {data.map((title, index) => (
                        <CopyableText
                            key={index}
                            text={title}
                            onApply={onSelectTitle}
                            applyLabel="Use this title"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Meta Description Generator Tab ─────────────────────────────────────────

function MetaDescriptionSection({
    title,
    content,
    onApply,
}: {
    title: string;
    content: string;
    onApply?: (description: string) => void;
}) {
    const { mutate, data, isPending, error, reset } =
        useGenerateMetaDescription();

    const handleGenerate = () => {
        if (!content.trim()) return;
        reset();
        mutate({ title, content });
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Meta Description
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Generate an SEO-optimized meta description (150-160
                    characters).
                </p>
            </div>

            <Button
                onClick={handleGenerate}
                isLoading={isPending}
                disabled={!content.trim()}
                size="sm"
                variant="outline"
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
            >
                Generate Meta Description
            </Button>

            {error && (
                <ErrorMessage
                    message={
                        (error as { message?: string })?.message ||
                        "Failed to generate meta description."
                    }
                />
            )}

            {isPending && <LoadingBlock lines={2} />}

            {data && (
                <div className="space-y-2">
                    <CopyableText
                        text={data}
                        onApply={onApply}
                        applyLabel="Apply"
                    />
                    <p className="text-xs text-zinc-400">
                        {data.length} / 160 characters
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Excerpt Generator Tab ───────────────────────────────────────────────────

function ExcerptSection({
    content,
    onApply,
}: {
    content: string;
    onApply?: (excerpt: string) => void;
}) {
    const { mutate, data, isPending, error, reset } = useGenerateExcerpt();

    const handleGenerate = () => {
        if (!content.trim()) return;
        reset();
        mutate({ content, maxLength: 160 });
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Excerpt Generator
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Generate a concise, engaging excerpt for your post.
                </p>
            </div>

            <Button
                onClick={handleGenerate}
                isLoading={isPending}
                disabled={!content.trim()}
                size="sm"
                variant="outline"
                leftIcon={<FileText className="h-4 w-4" />}
                className="w-full"
            >
                Generate Excerpt
            </Button>

            {error && (
                <ErrorMessage
                    message={
                        (error as { message?: string })?.message ||
                        "Failed to generate excerpt."
                    }
                />
            )}

            {isPending && <LoadingBlock lines={2} />}

            {data && (
                <CopyableText
                    text={data}
                    onApply={onApply}
                    applyLabel="Apply"
                />
            )}
        </div>
    );
}

// ─── Writing Improver Tab ────────────────────────────────────────────────────

function WritingImproverSection({
    selectedText,
    onApply,
}: {
    selectedText?: string;
    onApply?: (text: string) => void;
}) {
    const [text, setText] = React.useState(selectedText || "");
    const [tone, setTone] = React.useState<WritingTone>("professional");
    const { mutate, data, isPending, error, reset } = useImproveText();

    React.useEffect(() => {
        if (selectedText) {
            setText(selectedText);
        }
    }, [selectedText]);

    const handleImprove = () => {
        if (!text.trim()) return;
        reset();
        mutate({ text, tone });
    };

    const tones: { value: WritingTone; label: string }[] = [
        { value: "professional", label: "Professional" },
        { value: "casual", label: "Casual" },
        { value: "technical", label: "Technical" },
    ];

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Writing Improver
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Select or paste text, choose a tone, and get an improved
                    version.
                </p>
            </div>

            <Textarea
                value={text}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setText(e.target.value)
                }
                placeholder="Paste or type text to improve..."
                className="min-h-[100px] text-sm"
            />

            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                    Tone:
                </span>
                <div className="flex gap-1.5">
                    {tones.map((t) => (
                        <button
                            key={t.value}
                            onClick={() => setTone(t.value)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                                tone === t.value
                                    ? "bg-primary text-white"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            )}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <Button
                onClick={handleImprove}
                isLoading={isPending}
                disabled={!text.trim()}
                size="sm"
                variant="outline"
                leftIcon={<Wand2 className="h-4 w-4" />}
                className="w-full"
            >
                Improve Text
            </Button>

            {error && (
                <ErrorMessage
                    message={
                        (error as { message?: string })?.message ||
                        "Failed to improve text."
                    }
                />
            )}

            {isPending && <LoadingBlock lines={4} />}

            {data && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                            Improved
                        </Badge>
                        <span className="text-xs text-zinc-400">
                            {tone} tone
                        </span>
                    </div>
                    <CopyableText
                        text={data}
                        onApply={onApply}
                        applyLabel="Replace text"
                    />
                </div>
            )}
        </div>
    );
}

// ─── Alt Text Generator Tab ─────────────────────────────────────────────────

function AltTextSection() {
    const [description, setDescription] = React.useState("");
    const { mutate, data, isPending, error, reset } = useGenerateAltText();

    const handleGenerate = () => {
        if (!description.trim()) return;
        reset();
        mutate(description);
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    Alt Text Generator
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Generate accessible alt text for your images.
                </p>
            </div>

            <Textarea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                }
                placeholder="Describe the image (e.g., 'A developer working at a laptop with code on screen')..."
                className="min-h-[80px] text-sm"
            />

            <Button
                onClick={handleGenerate}
                isLoading={isPending}
                disabled={!description.trim()}
                size="sm"
                variant="outline"
                leftIcon={<Image className="h-4 w-4" />}
                className="w-full"
            >
                Generate Alt Text
            </Button>

            {error && (
                <ErrorMessage
                    message={
                        (error as { message?: string })?.message ||
                        "Failed to generate alt text."
                    }
                />
            )}

            {isPending && <LoadingBlock lines={1} />}

            {data && <CopyableText text={data} applyLabel="Copy" />}
        </div>
    );
}

// ─── Content Analyzer Tab ────────────────────────────────────────────────────

function ContentAnalyzerSection({ content }: { content: string }) {
    const { mutate, data, isPending, error, reset } = useAnalyzeContent();

    const handleAnalyze = () => {
        if (!content.trim()) return;
        reset();
        mutate(content);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Content Analyzer
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Analyze readability, SEO, and get improvement
                        suggestions.
                    </p>
                </div>
            </div>

            <Button
                onClick={handleAnalyze}
                isLoading={isPending}
                disabled={!content.trim()}
                size="sm"
                variant="outline"
                leftIcon={<Search className="h-4 w-4" />}
                className="w-full"
            >
                Analyze Content
            </Button>

            {error && (
                <ErrorMessage
                    message={
                        (error as { message?: string })?.message ||
                        "Failed to analyze content."
                    }
                />
            )}

            {isPending && (
                <div className="space-y-4">
                    <Skeleton className="h-32 rounded-lg" />
                    <Skeleton className="h-48 rounded-lg" />
                </div>
            )}

            {data && (
                <div className="space-y-4">
                    <SeoScoreCard
                        score={data.seoScore}
                        suggestions={data.suggestions}
                    />
                    <ContentAnalysisCard analysis={data} />
                </div>
            )}
        </div>
    );
}

// ─── Main Panel Component ────────────────────────────────────────────────────

export function AiAssistantPanel({
    content,
    title,
    isOpen,
    onClose,
    onSelectTitle,
    onApplyMetaDescription,
    onApplyExcerpt,
    onApplyImprovedText,
    selectedText,
    className,
}: AiAssistantPanelProps) {
    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col",
                "animate-in slide-in-from-right duration-300",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            AI Writing Assistant
                        </h2>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Powered by Claude
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <Tabs defaultValue="titles" className="w-full">
                    <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 border-b border-zinc-200 dark:border-zinc-800">
                        <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0 h-auto">
                            <div className="flex overflow-x-auto px-2 py-2 gap-1">
                                <TabsTrigger
                                    value="titles"
                                    className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Titles
                                </TabsTrigger>
                                <TabsTrigger
                                    value="meta"
                                    className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Meta
                                </TabsTrigger>
                                <TabsTrigger
                                    value="excerpt"
                                    className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Excerpt
                                </TabsTrigger>
                                <TabsTrigger
                                    value="improve"
                                    className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Improve
                                </TabsTrigger>
                                <TabsTrigger
                                    value="analyze"
                                    className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Analyze
                                </TabsTrigger>
                                <TabsTrigger
                                    value="alt-text"
                                    className="text-xs px-3 py-1.5 rounded-md data-[state=active]:bg-primary data-[state=active]:text-white"
                                >
                                    Alt Text
                                </TabsTrigger>
                            </div>
                        </TabsList>
                    </div>

                    <div className="p-5">
                        <TabsContent value="titles" className="mt-0">
                            <TitleGeneratorSection
                                content={content}
                                onSelectTitle={onSelectTitle}
                            />
                        </TabsContent>

                        <TabsContent value="meta" className="mt-0">
                            <MetaDescriptionSection
                                title={title}
                                content={content}
                                onApply={onApplyMetaDescription}
                            />
                        </TabsContent>

                        <TabsContent value="excerpt" className="mt-0">
                            <ExcerptSection
                                content={content}
                                onApply={onApplyExcerpt}
                            />
                        </TabsContent>

                        <TabsContent value="improve" className="mt-0">
                            <WritingImproverSection
                                selectedText={selectedText}
                                onApply={onApplyImprovedText}
                            />
                        </TabsContent>

                        <TabsContent value="analyze" className="mt-0">
                            <ContentAnalyzerSection content={content} />
                        </TabsContent>

                        <TabsContent value="alt-text" className="mt-0">
                            <AltTextSection />
                        </TabsContent>
                    </div>
                </Tabs>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
                    AI-generated content should be reviewed before publishing.
                </p>
            </div>
        </div>
    );
}

export default AiAssistantPanel;
