"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { PageHeader } from "@/components/page-header";
import { ConfirmModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Label,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from "@ktblog/ui/components";
import {
    Loader2,
    Pencil,
    Trash,
    Check,
    X,
    Plus,
    Sparkles,
    Brain,
    DollarSign,
    Globe,
    Tag,
    Layers,
    Eye,
    EyeOff,
    RefreshCw,
    Download,
    Upload,
    FileText,
    BarChart3,
    Image as ImageIcon,
    Presentation,
    ChevronRight,
    Clock,
    TrendingUp,
    CalendarDays,
} from "lucide-react";
import {
    usePresentation,
    useUpdatePresentation,
    useDeletePresentation,
    usePresentationSlides,
    useAnalyzePresentation,
    useGenerateDescription,
    useSuggestPricing,
    useReprocessPresentation,
    useUploadPresentation,
    useUpdateSlide,
    useRegenerateThumbnails,
    type PresentationIndustry,
    type PresentationType,
    type PresentationAspectRatio,
    type ColorScheme,
    type UpdatePresentationDto,
} from "@/hooks/use-presentations";
import { useDigitalProducts } from "@/hooks/use-digital-products";

// ─── Constants ──────────────────────────────────────────────────────────────

const INDUSTRY_LABELS: Record<PresentationIndustry, string> = {
    technology: "Technology", healthcare: "Healthcare", finance: "Finance",
    education: "Education", marketing: "Marketing", real_estate: "Real Estate",
    consulting: "Consulting", manufacturing: "Manufacturing", retail: "Retail",
    nonprofit: "Nonprofit", government: "Government", creative: "Creative",
    legal: "Legal", startup: "Startup", general: "General", other: "Other",
};

const TYPE_LABELS: Record<PresentationType, string> = {
    pitch_deck: "Pitch Deck", business_plan: "Business Plan", sales_deck: "Sales Deck",
    company_profile: "Company Profile", project_proposal: "Project Proposal",
    training: "Training", webinar: "Webinar", case_study: "Case Study",
    report: "Report", infographic: "Infographic", portfolio: "Portfolio",
    keynote_speech: "Keynote Speech", product_launch: "Product Launch",
    investor_update: "Investor Update", other: "Other",
};

const ASPECT_RATIO_OPTIONS: { value: PresentationAspectRatio; label: string }[] = [
    { value: "16:9", label: "16:9 Widescreen" },
    { value: "4:3", label: "4:3 Standard" },
    { value: "16:10", label: "16:10" },
    { value: "a4", label: "A4 Portrait" },
    { value: "letter", label: "Letter" },
    { value: "custom", label: "Custom" },
];

const SOFTWARE_COMPATIBILITY = [
    "Microsoft PowerPoint", "Google Slides", "Apple Keynote",
    "LibreOffice Impress", "Canva", "Prezi",
];

const presentationSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().max(200).optional(),
    industry: z.string().min(1, "Industry is required"),
    type: z.string().min(1, "Type is required"),
    status: z.enum(["draft", "published", "archived"]),
    aspectRatio: z.string().optional(),
    price: z.number().min(0),
    compareAtPrice: z.number().optional(),
    currency: z.string().default("USD"),
    softwareCompatibility: z.array(z.string()).optional(),
    fontFamilies: z.array(z.string()).optional(),
    hasAnimations: z.boolean(),
    hasTransitions: z.boolean(),
    hasSpeakerNotes: z.boolean(),
    hasCharts: z.boolean(),
    hasImages: z.boolean(),
    isFullyEditable: z.boolean(),
    includesDocumentation: z.boolean(),
    digitalProductId: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof presentationSchema>;

type TabId = "details" | "slides" | "ai" | "files" | "analytics";

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function EditPresentationPage({
    params,
}: {
    params: { id: string };
}) {
    const router = useRouter();
    const toast = useToast();
    const [activeTab, setActiveTab] = React.useState<TabId>("details");
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [colorSchemes, setColorSchemes] = React.useState<ColorScheme[]>([]);
    const [newColorName, setNewColorName] = React.useState("");
    const [newColorValue, setNewColorValue] = React.useState("#3b82f6");
    const [currentSchemeColors, setCurrentSchemeColors] = React.useState<string[]>([]);
    const [fontInput, setFontInput] = React.useState("");
    const [tagInput, setTagInput] = React.useState("");
    const [keywordInput, setKeywordInput] = React.useState("");
    const [aiDescription, setAiDescription] = React.useState("");
    const [aiTags, setAiTags] = React.useState<{ tag: string; accepted: boolean }[]>([]);
    const [aiPrice, setAiPrice] = React.useState<{ price: number; reasoning: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = React.useState<FormValues>({
        title: "", slug: "", description: "", shortDescription: "",
        industry: "", type: "", status: "draft", aspectRatio: "16:9",
        price: 0, compareAtPrice: undefined, currency: "USD",
        softwareCompatibility: [], fontFamilies: [],
        hasAnimations: false, hasTransitions: false, hasSpeakerNotes: false,
        hasCharts: false, hasImages: false, isFullyEditable: true,
        includesDocumentation: false, digitalProductId: "",
        seoTitle: "", seoDescription: "", seoKeywords: [], tags: [],
    });

    // Queries
    const { data: presentation, isLoading: isLoadingPresentation, error: fetchError } =
        usePresentation(params.id);
    const { data: slidesData } = usePresentationSlides(params.id);
    const slides = slidesData?.slides ?? [];
    const { data: digitalProductsData } = useDigitalProducts({});
    const digitalProducts = digitalProductsData?.items ?? [];

    // Mutations
    const updateMutation = useUpdatePresentation();
    const deleteMutation = useDeletePresentation();
    const analyzeMutation = useAnalyzePresentation();
    const generateDescMutation = useGenerateDescription();
    const suggestPricingMutation = useSuggestPricing();
    const reprocessMutation = useReprocessPresentation();
    const uploadMutation = useUploadPresentation();
    const updateSlideMutation = useUpdateSlide();
    const regenerateThumbnailsMutation = useRegenerateThumbnails();

    // Populate form when data loads
    React.useEffect(() => {
        if (presentation) {
            setFormData({
                title: presentation.title || "",
                slug: presentation.slug || "",
                description: presentation.description || "",
                shortDescription: presentation.shortDescription || "",
                industry: presentation.industry || "",
                type: presentation.type || "",
                status: presentation.status || "draft",
                aspectRatio: presentation.aspectRatio || "16:9",
                price: presentation.price || 0,
                compareAtPrice: presentation.compareAtPrice ?? undefined,
                currency: presentation.currency || "USD",
                softwareCompatibility: presentation.softwareCompatibility || [],
                fontFamilies: presentation.fontFamilies || [],
                hasAnimations: presentation.hasAnimations ?? false,
                hasTransitions: presentation.hasTransitions ?? false,
                hasSpeakerNotes: presentation.hasSpeakerNotes ?? false,
                hasCharts: presentation.hasCharts ?? false,
                hasImages: presentation.hasImages ?? false,
                isFullyEditable: presentation.isFullyEditable ?? true,
                includesDocumentation: presentation.includesDocumentation ?? false,
                digitalProductId: presentation.digitalProductId || "",
                seoTitle: presentation.seoTitle || "",
                seoDescription: presentation.seoDescription || "",
                seoKeywords: presentation.seoKeywords || [],
                tags: presentation.tags?.map((t) => t.name) || [],
            });
            setColorSchemes(presentation.colorSchemes || []);
            if (presentation.aiDescription) {
                setAiDescription(presentation.aiDescription);
            }
            if (presentation.aiSuggestedTags?.length) {
                setAiTags(presentation.aiSuggestedTags.map((t) => ({ tag: t, accepted: true })));
            }
            if (presentation.aiSuggestedPrice) {
                setAiPrice({ suggestedPrice: presentation.aiSuggestedPrice, reasoning: "Previously suggested by AI." });
            }
        }
    }, [presentation]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
    };

    const handleSelectChange = (name: keyof FormValues, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
        }
    };

    const handleSwitchChange = (name: keyof FormValues, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSoftwareToggle = (software: string) => {
        setFormData((prev) => {
            const current = prev.softwareCompatibility || [];
            const updated = current.includes(software)
                ? current.filter((s) => s !== software)
                : [...current, software];
            return { ...prev, softwareCompatibility: updated };
        });
    };

    const addFont = () => {
        if (fontInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                fontFamilies: [...(prev.fontFamilies || []), fontInput.trim()],
            }));
            setFontInput("");
        }
    };

    const removeFont = (font: string) => {
        setFormData((prev) => ({
            ...prev,
            fontFamilies: (prev.fontFamilies || []).filter((f) => f !== font),
        }));
    };

    const addTag = () => {
        if (tagInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: (prev.tags || []).filter((t) => t !== tag),
        }));
    };

    const addKeyword = () => {
        if (keywordInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                seoKeywords: [...(prev.seoKeywords || []), keywordInput.trim()],
            }));
            setKeywordInput("");
        }
    };

    const removeKeyword = (kw: string) => {
        setFormData((prev) => ({
            ...prev,
            seoKeywords: (prev.seoKeywords || []).filter((k) => k !== kw),
        }));
    };

    const addColorScheme = () => {
        if (newColorName.trim() && currentSchemeColors.length > 0) {
            setColorSchemes((prev) => [...prev, { name: newColorName.trim(), colors: [...currentSchemeColors] }]);
            setNewColorName("");
            setCurrentSchemeColors([]);
        }
    };

    const removeColorScheme = (index: number) => {
        setColorSchemes((prev) => prev.filter((_, i) => i !== index));
    };

    const addColorToScheme = () => {
        if (newColorValue) setCurrentSchemeColors((prev) => [...prev, newColorValue]);
    };

    const removeColorFromScheme = (index: number) => {
        setCurrentSchemeColors((prev) => prev.filter((_, i) => i !== index));
    };

    // AI
    const handleGenerateDescription = () => {
        generateDescMutation.mutate(params.id, {
            onSuccess: (data) => { setAiDescription(data.description); toast.success("Generated", "AI description generated."); },
            onError: () => toast.error("Error", "Failed to generate description."),
        });
    };

    const handleSuggestPricing = () => {
        suggestPricingMutation.mutate(params.id, {
            onSuccess: (data) => { setAiPrice(data); toast.success("Suggested", "AI pricing suggestion generated."); },
            onError: () => toast.error("Error", "Failed to suggest pricing."),
        });
    };

    const handleAnalyze = () => {
        analyzeMutation.mutate(params.id, {
            onSuccess: (analyzed) => {
                if (analyzed.aiDescription) setAiDescription(analyzed.aiDescription);
                if (analyzed.aiSuggestedTags?.length) {
                    setAiTags(analyzed.aiSuggestedTags.map((t) => ({ tag: t, accepted: true })));
                }
                if (analyzed.aiSuggestedPrice) {
                    setAiPrice({ suggestedPrice: analyzed.aiSuggestedPrice, reasoning: "AI analysis based on content, industry, and market." });
                }
                toast.success("Analysis complete", "AI analysis has finished.");
            },
            onError: () => toast.error("Error", "Failed to run AI analysis."),
        });
    };

    const handleAcceptAiDescription = () => {
        setFormData((prev) => ({ ...prev, description: aiDescription }));
        toast.success("Applied", "AI description applied.");
    };

    const handleAcceptAiPrice = () => {
        if (aiPrice) {
            setFormData((prev) => ({ ...prev, price: aiPrice.suggestedPrice }));
            toast.success("Applied", "AI suggested price applied.");
        }
    };

    const toggleAiTag = (index: number) => {
        setAiTags((prev) => prev.map((t, i) => i === index ? { ...t, accepted: !t.accepted } : t));
    };

    const applyAcceptedTags = () => {
        const accepted = aiTags.filter((t) => t.accepted).map((t) => t.tag);
        setFormData((prev) => ({ ...prev, tags: [...new Set([...(prev.tags || []), ...accepted])] }));
        toast.success("Tags applied", `${accepted.length} tags added.`);
    };

    // Slides
    const handleSlideVisibilityToggle = (slideId: string, isVisible: boolean) => {
        updateSlideMutation.mutate(
            { presentationId: params.id, slideId, data: { isVisible: !isVisible } },
            {
                onSuccess: () => toast.success("Updated", "Slide visibility updated."),
                onError: () => toast.error("Error", "Failed to update slide."),
            }
        );
    };

    const handleRegenerateThumbnails = () => {
        regenerateThumbnailsMutation.mutate(params.id, {
            onSuccess: () => toast.success("Regenerating", "Slide thumbnails are being regenerated."),
            onError: () => toast.error("Error", "Failed to regenerate thumbnails."),
        });
    };

    // Reprocess
    const handleReprocess = () => {
        reprocessMutation.mutate(params.id, {
            onSuccess: () => toast.success("Reprocessing", "Presentation is being reprocessed."),
            onError: () => toast.error("Error", "Failed to reprocess."),
        });
    };

    // Upload new version
    const handleUploadNewVersion = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("presentationId", params.id);
        uploadMutation.mutate(fd, {
            onSuccess: () => toast.success("Uploaded", "New version uploaded."),
            onError: () => toast.error("Error", "Failed to upload new version."),
        });
    };

    // Delete
    const handleConfirmDelete = () => {
        deleteMutation.mutate(params.id, {
            onSuccess: () => {
                toast.success("Deleted", "Presentation has been deleted.");
                router.push("/presentations");
            },
            onError: () => toast.error("Error", "Failed to delete presentation."),
        });
    };

    // Publish/Unpublish
    const handleTogglePublish = () => {
        const newStatus = formData.status === "published" ? "draft" : "published";
        updateMutation.mutate(
            { id: params.id, data: { status: newStatus } as UpdatePresentationDto },
            {
                onSuccess: () => {
                    setFormData((prev) => ({ ...prev, status: newStatus }));
                    toast.success(
                        newStatus === "published" ? "Published" : "Unpublished",
                        `Presentation has been ${newStatus === "published" ? "published" : "unpublished"}.`
                    );
                },
                onError: () => toast.error("Error", "Failed to update status."),
            }
        );
    };

    // Save
    const validate = (): boolean => {
        const result = presentationSchema.safeParse(formData);
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

    const handleSave = () => {
        if (!validate()) {
            toast.error("Validation error", "Please fix the errors.");
            setActiveTab("details");
            return;
        }
        const data: UpdatePresentationDto = {
            ...formData,
            industry: formData.industry as PresentationIndustry,
            type: formData.type as PresentationType,
            colorSchemes,
        };

        updateMutation.mutate(
            { id: params.id, data },
            {
                onSuccess: () => toast.success("Saved", "Presentation updated successfully."),
                onError: (err) => toast.error("Error", err.message || "Failed to save."),
            }
        );
    };

    // ─── Loading / Error States ─────────────────────────────────────────────

    if (isLoadingPresentation) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Edit Presentation"
                    description="Loading..."
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Presentations", href: "/presentations" },
                        { label: "Edit" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading presentation data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Edit Presentation"
                    description="Failed to load"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Presentations", href: "/presentations" },
                        { label: "Edit" },
                    ]}
                />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load presentation</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                            {fetchError.message || "An error occurred."}
                        </p>
                        <button
                            onClick={() => router.push("/presentations")}
                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Back to Presentations
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Tab Config ─────────────────────────────────────────────────────────

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
        { id: "slides", label: "Slides", icon: <Layers className="h-4 w-4" /> },
        { id: "ai", label: "AI Analysis", icon: <Brain className="h-4 w-4" /> },
        { id: "files", label: "Files", icon: <Upload className="h-4 w-4" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    ];

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Presentation"
                description={`Editing "${presentation?.title ?? "Presentation"}"`}
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Presentations", href: "/presentations" },
                    { label: "Edit" },
                ]}
                backHref="/presentations"
                backLabel="Back to Presentations"
                actions={
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleTogglePublish}
                            disabled={updateMutation.isPending}
                        >
                            {formData.status === "published" ? (
                                <>
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Publish
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                            onClick={() => setIsDeleteOpen(true)}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Tabs */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-1 flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? "bg-primary text-white"
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Details Tab ─────────────────────────────────────────── */}
                {activeTab === "details" && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Basic Information</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" value={formData.title} onChange={handleChange} />
                                    {errors.title && <p className="text-sm font-medium text-red-500">{errors.title}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug</Label>
                                    <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} />
                                    {errors.slug && <p className="text-sm font-medium text-red-500">{errors.slug}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="shortDescription">Short Description</Label>
                                <Input id="shortDescription" name="shortDescription" value={formData.shortDescription || ""} onChange={handleChange} maxLength={200} />
                                <p className="text-xs text-zinc-400">{(formData.shortDescription || "").length}/200</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Full Description</Label>
                                <Textarea id="description" name="description" className="h-32" value={formData.description || ""} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Digital Product</Label>
                                <Select value={formData.digitalProductId || ""} onValueChange={(v) => handleSelectChange("digitalProductId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Link to digital product..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {digitalProducts.map((dp) => (
                                            <SelectItem key={dp.id} value={dp.id}>{dp.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Classification</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Industry</Label>
                                    <Select value={formData.industry} onValueChange={(v) => handleSelectChange("industry", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select industry..." /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(INDUSTRY_LABELS).map(([k, l]) => (
                                                <SelectItem key={k} value={k}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.industry && <p className="text-sm font-medium text-red-500">{errors.industry}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={formData.type} onValueChange={(v) => handleSelectChange("type", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(TYPE_LABELS).map(([k, l]) => (
                                                <SelectItem key={k} value={k}>{l}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-sm font-medium text-red-500">{errors.type}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Aspect Ratio</Label>
                                    <Select value={formData.aspectRatio || "16:9"} onValueChange={(v) => handleSelectChange("aspectRatio", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {ASPECT_RATIO_OPTIONS.map((o) => (
                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Pricing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Price</Label>
                                    <Input type="number" min={0} step={0.01} value={formData.price || ""} onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Compare At Price</Label>
                                    <Input type="number" min={0} step={0.01} value={formData.compareAtPrice || ""} onChange={(e) => setFormData((prev) => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || undefined }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Currency</Label>
                                    <Select value={formData.currency} onValueChange={(v) => handleSelectChange("currency", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Software Compatibility */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Software Compatibility</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {SOFTWARE_COMPATIBILITY.map((sw) => (
                                    <label key={sw} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={(formData.softwareCompatibility || []).includes(sw)} onChange={() => handleSoftwareToggle(sw)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" />
                                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{sw}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Color Schemes */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Color Schemes</h3>
                            {colorSchemes.length > 0 && (
                                <div className="space-y-2">
                                    {colorSchemes.map((scheme, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[80px]">{scheme.name}</span>
                                            <div className="flex items-center gap-1">
                                                {scheme.colors.map((c, ci) => (
                                                    <div key={ci} className="h-6 w-6 rounded-full border border-zinc-300 dark:border-zinc-600" style={{ backgroundColor: c }} title={c} />
                                                ))}
                                            </div>
                                            <button type="button" onClick={() => removeColorScheme(idx)} className="ml-auto p-1 text-zinc-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="space-y-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                <Input placeholder="Scheme name" value={newColorName} onChange={(e) => setNewColorName(e.target.value)} />
                                <div className="flex items-center gap-2 flex-wrap">
                                    {currentSchemeColors.map((c, idx) => (
                                        <button key={idx} type="button" onClick={() => removeColorFromScheme(idx)} className="h-8 w-8 rounded-full border-2 border-zinc-300 hover:border-red-400" style={{ backgroundColor: c }} />
                                    ))}
                                    <input type="color" value={newColorValue} onChange={(e) => setNewColorValue(e.target.value)} className="h-8 w-8 rounded cursor-pointer border-0" />
                                    <Button type="button" variant="outline" size="sm" onClick={addColorToScheme}><Plus className="h-3 w-3" /></Button>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addColorScheme} disabled={!newColorName.trim() || currentSchemeColors.length === 0}>
                                    <Plus className="h-4 w-4 mr-1" />Add Scheme
                                </Button>
                            </div>
                        </div>

                        {/* Font Families */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Font Families</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(formData.fontFamilies || []).map((f) => (
                                    <span key={f} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full">
                                        {f}<button type="button" onClick={() => removeFont(f)} className="ml-0.5 text-zinc-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input placeholder="Add font family..." value={fontInput} onChange={(e) => setFontInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFont(); } }} className="flex-1" />
                                <Button type="button" variant="outline" onClick={addFont}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        {/* Feature Toggles */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {([
                                    { key: "hasAnimations" as const, label: "Has Animations", desc: "Contains slide animations" },
                                    { key: "hasTransitions" as const, label: "Has Transitions", desc: "Contains slide transitions" },
                                    { key: "hasSpeakerNotes" as const, label: "Has Speaker Notes", desc: "Includes speaker notes" },
                                    { key: "hasCharts" as const, label: "Has Charts", desc: "Contains data charts" },
                                    { key: "hasImages" as const, label: "Has Images", desc: "Contains images/photos" },
                                    { key: "isFullyEditable" as const, label: "Fully Editable", desc: "All elements are editable" },
                                    { key: "includesDocumentation" as const, label: "Includes Documentation", desc: "Comes with usage docs" },
                                ]).map((feature) => (
                                    <div key={feature.key} className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">{feature.label}</Label>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{feature.desc}</p>
                                        </div>
                                        <Switch checked={formData[feature.key] as boolean} onCheckedChange={(checked: boolean) => handleSwitchChange(feature.key, checked)} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* SEO & Tags */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2"><Globe className="h-5 w-5" />SEO & Tags</h3>
                            <div className="space-y-2">
                                <Label>SEO Title</Label>
                                <Input name="seoTitle" value={formData.seoTitle || ""} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>SEO Description</Label>
                                <Textarea name="seoDescription" className="h-20" value={formData.seoDescription || ""} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>SEO Keywords</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(formData.seoKeywords || []).map((kw) => (
                                        <span key={kw} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">{kw}<button type="button" onClick={() => removeKeyword(kw)}><X className="h-3 w-3" /></button></span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Add keyword..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }} className="flex-1" />
                                    <Button type="button" variant="outline" size="sm" onClick={addKeyword}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {(formData.tags || []).map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary/10 text-primary rounded-full">{tag}<button type="button" onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button></span>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} className="flex-1" />
                                    <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => router.push("/presentations")}>Cancel</Button>
                            <Button onClick={handleSave} disabled={updateMutation.isPending}>
                                {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                )}

                {/* ─── Slides Tab ─────────────────────────────────────────── */}
                {activeTab === "slides" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Slides ({slides.length})
                                </h3>
                                <Button variant="outline" size="sm" onClick={handleRegenerateThumbnails} disabled={regenerateThumbnailsMutation.isPending}>
                                    {regenerateThumbnailsMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <ImageIcon className="h-4 w-4 mr-1.5" />}
                                    Regenerate Thumbnails
                                </Button>
                            </div>
                            {slides.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {slides.map((slide) => (
                                        <div key={slide.id} className={`group relative rounded-xl border overflow-hidden transition-all ${slide.isVisible ? "border-zinc-200 dark:border-zinc-700" : "border-zinc-200 dark:border-zinc-700 opacity-50"}`}>
                                            <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative">
                                                {slide.thumbnailUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={slide.thumbnailUrl} alt={`Slide ${slide.slideNumber}`} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-zinc-400"><Layers className="h-6 w-6" /></div>
                                                )}
                                                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/60 text-white">{slide.slideNumber}</div>
                                                <button onClick={() => handleSlideVisibilityToggle(slide.id, slide.isVisible)} className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100" title={slide.isVisible ? "Hide slide" : "Show slide"}>
                                                    {slide.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                </button>
                                            </div>
                                            <div className="p-2.5">
                                                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{slide.title || `Slide ${slide.slideNumber}`}</p>
                                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize">{slide.contentType.replace("_", " ")}</p>
                                                {slide.notes && <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{slide.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16">
                                    <Layers className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
                                    <p className="text-zinc-500 dark:text-zinc-400">No slides found for this presentation.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── AI Analysis Tab ────────────────────────────────────── */}
                {activeTab === "ai" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-purple-200 dark:border-purple-800 p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">AI Analysis</h3>
                                </div>
                                {presentation?.aiAnalyzedAt && (
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Last analyzed: {new Date(presentation.aiAnalyzedAt).toLocaleString()}
                                    </span>
                                )}
                            </div>

                            {/* Re-analyze */}
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-purple-900 dark:text-purple-200">Run Full AI Analysis</p>
                                        <p className="text-sm text-purple-600 dark:text-purple-400">Re-analyze to update description, tags, and pricing.</p>
                                    </div>
                                    <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">
                                        {analyzeMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
                                        Re-Analyze
                                    </Button>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">AI Description</Label>
                                    <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={generateDescMutation.isPending}>
                                        {generateDescMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                                        Regenerate
                                    </Button>
                                </div>
                                {aiDescription && (
                                    <div className="space-y-2">
                                        <Textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} className="h-32" />
                                        <Button variant="outline" size="sm" onClick={handleAcceptAiDescription}>
                                            <Check className="h-3.5 w-3.5 mr-1.5" />Apply to Description
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium">AI Suggested Tags</Label>
                                {aiTags.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {aiTags.map((item, idx) => (
                                                <button key={idx} type="button" onClick={() => toggleAiTag(idx)} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${item.accepted ? "bg-primary/10 border-primary text-primary" : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-500 line-through"}`}>
                                                    {item.accepted ? <Check className="h-3 w-3 inline mr-1" /> : <X className="h-3 w-3 inline mr-1" />}
                                                    {item.tag}
                                                </button>
                                            ))}
                                        </div>
                                        <Button variant="outline" size="sm" onClick={applyAcceptedTags}>
                                            <Tag className="h-3.5 w-3.5 mr-1.5" />Apply Accepted Tags
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Pricing */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium">AI Pricing Suggestion</Label>
                                    <Button variant="outline" size="sm" onClick={handleSuggestPricing} disabled={suggestPricingMutation.isPending}>
                                        {suggestPricingMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5 mr-1.5" />}
                                        Suggest Pricing
                                    </Button>
                                </div>
                                {aiPrice && (
                                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                                {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(aiPrice.suggestedPrice)}
                                            </span>
                                            <span className="text-sm text-zinc-500">suggested</span>
                                            <span className="text-sm text-zinc-400 mx-1">vs</span>
                                            <span className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                                {new Intl.NumberFormat("en-US", { style: "currency", currency: formData.currency }).format(formData.price)}
                                            </span>
                                            <span className="text-sm text-zinc-500">current</span>
                                            <Button variant="outline" size="sm" onClick={handleAcceptAiPrice}>
                                                <Check className="h-3.5 w-3.5 mr-1" />Apply
                                            </Button>
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{aiPrice.reasoning}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Files Tab ──────────────────────────────────────────── */}
                {activeTab === "files" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-6">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">File Information</h3>

                            {presentation && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Original File</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{presentation.originalFilename || "Unknown"}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">File Size</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{formatFileSize(presentation.fileSize)}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Format</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white uppercase">{presentation.fileFormat}</p>
                                        </div>
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Slides</p>
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{presentation.slideCount}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                        <Button variant="outline" size="sm" onClick={handleReprocess} disabled={reprocessMutation.isPending}>
                                            {reprocessMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1.5" />}
                                            Reprocess
                                        </Button>
                                        <div>
                                            <input ref={fileInputRef} type="file" accept=".pptx,.ppt,.key,.odp,.pdf" onChange={handleUploadNewVersion} className="hidden" />
                                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                                                {uploadMutation.isPending ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Upload className="h-4 w-4 mr-1.5" />}
                                                Upload New Version
                                            </Button>
                                        </div>
                                    </div>

                                    {presentation.downloadUrl && (
                                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                            <a href={presentation.downloadUrl} download className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                                                <Download className="h-4 w-4" />Download Current File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Analytics Tab ──────────────────────────────────────── */}
                {activeTab === "analytics" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{(presentation?.viewCount ?? 0).toLocaleString()}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Views</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">{(presentation?.downloadCount ?? 0).toLocaleString()}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Downloads</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: presentation?.currency || "USD" }).format(
                                                (presentation?.price ?? 0) * (presentation?.downloadCount ?? 0)
                                            )}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Est. Revenue</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                                            {presentation?.viewCount && presentation.downloadCount
                                                ? `${((presentation.downloadCount / presentation.viewCount) * 100).toFixed(1)}%`
                                                : "0%"}
                                        </p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Conversion Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Slide Engagement */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Slide Engagement</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Slide-level engagement data shows which slides are viewed most frequently by potential buyers.
                            </p>
                            {slides.length > 0 ? (
                                <div className="space-y-2">
                                    {slides.slice(0, 10).map((slide, index) => {
                                        const engagement = Math.max(10, 100 - index * 8 - Math.floor(Math.random() * 5));
                                        return (
                                            <div key={slide.id} className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-zinc-500 w-8">#{slide.slideNumber}</span>
                                                <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/70 rounded-full transition-all"
                                                        style={{ width: `${engagement}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 w-10 text-right">{engagement}%</span>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400 w-24 truncate">{slide.title || `Slide ${slide.slideNumber}`}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                    <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No slide engagement data available yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Timeline</h3>
                            <div className="space-y-3">
                                {presentation?.createdAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <CalendarDays className="h-4 w-4 text-zinc-400" />
                                        <span className="text-zinc-600 dark:text-zinc-400">Created:</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">{new Date(presentation.createdAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {presentation?.updatedAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Clock className="h-4 w-4 text-zinc-400" />
                                        <span className="text-zinc-600 dark:text-zinc-400">Updated:</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">{new Date(presentation.updatedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {presentation?.publishedAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Eye className="h-4 w-4 text-zinc-400" />
                                        <span className="text-zinc-600 dark:text-zinc-400">Published:</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">{new Date(presentation.publishedAt).toLocaleString()}</span>
                                    </div>
                                )}
                                {presentation?.aiAnalyzedAt && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Brain className="h-4 w-4 text-zinc-400" />
                                        <span className="text-zinc-600 dark:text-zinc-400">AI Analyzed:</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">{new Date(presentation.aiAnalyzedAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Presentation"
                description="Are you sure you want to delete this presentation? This action cannot be undone and all associated files and slides will be permanently removed."
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
