"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/page-header";
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
    Upload,
    FileUp,
    Loader2,
    Check,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    X,
    Plus,
    Palette,
    Type,
    Layers,
    Brain,
    DollarSign,
    Globe,
    Tag,
    GripVertical,
    Eye,
    EyeOff,
    Monitor,
    Smartphone,
    FileText,
    BarChart3,
    Image as ImageIcon,
    Presentation,
    Building2,
    Briefcase,
    GraduationCap,
    HeartPulse,
    Landmark,
    Megaphone,
    Home,
    Users,
    Factory,
    ShoppingCart,
    Lightbulb,
    Scale,
    Rocket,
    CircleDot,
} from "lucide-react";
import {
    useUploadPresentation,
    useCreatePresentation,
    useAnalyzePresentation,
    useGenerateDescription,
    useSuggestPricing,
    usePresentationSlides,
    useUpdateSlide,
    useReorderSlides,
    useRegenerateThumbnails,
    type PresentationIndustry,
    type PresentationType,
    type PresentationFileFormat,
    type PresentationAspectRatio,
    type ColorScheme,
    type CreatePresentationDto,
    type Presentation as PresentationEntity,
} from "@/hooks/use-presentations";
import { useDigitalProducts } from "@/hooks/use-digital-products";

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCEPTED_FORMATS = ".pptx,.ppt,.key,.odp,.pdf";
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

const INDUSTRY_OPTIONS: { value: PresentationIndustry; label: string; icon: React.ReactNode }[] = [
    { value: "technology", label: "Technology", icon: <Monitor className="h-5 w-5" /> },
    { value: "healthcare", label: "Healthcare", icon: <HeartPulse className="h-5 w-5" /> },
    { value: "finance", label: "Finance", icon: <Landmark className="h-5 w-5" /> },
    { value: "education", label: "Education", icon: <GraduationCap className="h-5 w-5" /> },
    { value: "marketing", label: "Marketing", icon: <Megaphone className="h-5 w-5" /> },
    { value: "real_estate", label: "Real Estate", icon: <Home className="h-5 w-5" /> },
    { value: "consulting", label: "Consulting", icon: <Briefcase className="h-5 w-5" /> },
    { value: "manufacturing", label: "Manufacturing", icon: <Factory className="h-5 w-5" /> },
    { value: "retail", label: "Retail", icon: <ShoppingCart className="h-5 w-5" /> },
    { value: "nonprofit", label: "Nonprofit", icon: <Users className="h-5 w-5" /> },
    { value: "government", label: "Government", icon: <Building2 className="h-5 w-5" /> },
    { value: "creative", label: "Creative", icon: <Palette className="h-5 w-5" /> },
    { value: "legal", label: "Legal", icon: <Scale className="h-5 w-5" /> },
    { value: "startup", label: "Startup", icon: <Rocket className="h-5 w-5" /> },
    { value: "general", label: "General", icon: <CircleDot className="h-5 w-5" /> },
    { value: "other", label: "Other", icon: <Lightbulb className="h-5 w-5" /> },
];

const TYPE_OPTIONS: { value: PresentationType; label: string }[] = [
    { value: "pitch_deck", label: "Pitch Deck" },
    { value: "business_plan", label: "Business Plan" },
    { value: "sales_deck", label: "Sales Deck" },
    { value: "company_profile", label: "Company Profile" },
    { value: "project_proposal", label: "Project Proposal" },
    { value: "training", label: "Training" },
    { value: "webinar", label: "Webinar" },
    { value: "case_study", label: "Case Study" },
    { value: "report", label: "Report" },
    { value: "infographic", label: "Infographic" },
    { value: "portfolio", label: "Portfolio" },
    { value: "keynote_speech", label: "Keynote Speech" },
    { value: "product_launch", label: "Product Launch" },
    { value: "investor_update", label: "Investor Update" },
    { value: "other", label: "Other" },
];

const ASPECT_RATIO_OPTIONS: { value: PresentationAspectRatio; label: string }[] = [
    { value: "16:9", label: "16:9 Widescreen" },
    { value: "4:3", label: "4:3 Standard" },
    { value: "16:10", label: "16:10" },
    { value: "a4", label: "A4 Portrait" },
    { value: "letter", label: "Letter" },
    { value: "custom", label: "Custom" },
];

const SOFTWARE_COMPATIBILITY = [
    "Microsoft PowerPoint",
    "Google Slides",
    "Apple Keynote",
    "LibreOffice Impress",
    "Canva",
    "Prezi",
];

// ─── Schema ─────────────────────────────────────────────────────────────────

const presentationSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().max(200, "Short description must be under 200 characters").optional(),
    industry: z.string().min(1, "Industry is required"),
    type: z.string().min(1, "Presentation type is required"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    aspectRatio: z.string().optional(),
    price: z.number().min(0, "Price must be 0 or greater"),
    compareAtPrice: z.number().optional(),
    currency: z.string().default("USD"),
    softwareCompatibility: z.array(z.string()).optional(),
    fontFamilies: z.array(z.string()).optional(),
    hasAnimations: z.boolean().default(false),
    hasTransitions: z.boolean().default(false),
    hasSpeakerNotes: z.boolean().default(false),
    hasCharts: z.boolean().default(false),
    hasImages: z.boolean().default(false),
    isFullyEditable: z.boolean().default(true),
    includesDocumentation: z.boolean().default(false),
    digitalProductId: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof presentationSchema>;

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function NewPresentationPage() {
    const router = useRouter();
    const toast = useToast();

    // State
    const [currentStep, setCurrentStep] = React.useState(0);
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
    const [uploadedPresentation, setUploadedPresentation] = React.useState<PresentationEntity | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [isUploading, setIsUploading] = React.useState(false);
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
    const [aiPrice, setAiPrice] = React.useState<{ suggestedPrice: number; reasoning: string } | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = React.useState<FormValues>({
        title: "",
        slug: "",
        description: "",
        shortDescription: "",
        industry: "",
        type: "",
        status: "draft",
        aspectRatio: "16:9",
        price: 0,
        compareAtPrice: undefined,
        currency: "USD",
        softwareCompatibility: [],
        fontFamilies: [],
        hasAnimations: false,
        hasTransitions: false,
        hasSpeakerNotes: false,
        hasCharts: false,
        hasImages: false,
        isFullyEditable: true,
        includesDocumentation: false,
        digitalProductId: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
        tags: [],
    });

    // Mutations
    const uploadMutation = useUploadPresentation();
    const createMutation = useCreatePresentation();
    const analyzeMutation = useAnalyzePresentation();
    const generateDescMutation = useGenerateDescription();
    const suggestPricingMutation = useSuggestPricing();
    const reorderSlidesMutation = useReorderSlides();
    const updateSlideMutation = useUpdateSlide();
    const regenerateThumbnailsMutation = useRegenerateThumbnails();

    // Queries
    const { data: digitalProductsData } = useDigitalProducts({});
    const digitalProducts = digitalProductsData?.items ?? [];

    const { data: slidesData } = usePresentationSlides(
        uploadedPresentation?.id ?? ""
    );
    const slides = slidesData?.slides ?? [];

    const steps = [
        { label: "Upload File", icon: <Upload className="h-4 w-4" /> },
        { label: "Details", icon: <FileText className="h-4 w-4" /> },
        { label: "AI Enhancement", icon: <Brain className="h-4 w-4" /> },
        { label: "Slide Preview", icon: <Layers className="h-4 w-4" /> },
    ];

    // ─── File Upload Handlers ───────────────────────────────────────────────

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) validateAndSetFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) validateAndSetFile(file);
    };

    const validateAndSetFile = (file: File) => {
        const validExtensions = [".pptx", ".ppt", ".key", ".odp", ".pdf"];
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        if (!validExtensions.includes(ext)) {
            toast.error(
                "Invalid file type",
                "Please upload a .pptx, .ppt, .key, .odp, or .pdf file."
            );
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error(
                "File too large",
                `Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}.`
            );
            return;
        }
        setUploadedFile(file);
    };

    const handleUpload = async () => {
        if (!uploadedFile) return;

        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress since fetch doesn't support progress natively
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 500);

        const formData = new FormData();
        formData.append("file", uploadedFile);

        uploadMutation.mutate(formData, {
            onSuccess: (presentation) => {
                clearInterval(progressInterval);
                setUploadProgress(100);
                setUploadedPresentation(presentation);

                // Auto-populate form fields from extracted metadata
                setFormData((prev) => ({
                    ...prev,
                    title: presentation.title || prev.title,
                    slug: presentation.slug || generateSlug(presentation.title || ""),
                    description: presentation.description || prev.description,
                    shortDescription: presentation.shortDescription || prev.shortDescription,
                    industry: presentation.industry || prev.industry,
                    type: presentation.type || prev.type,
                    aspectRatio: presentation.aspectRatio || prev.aspectRatio,
                    softwareCompatibility:
                        presentation.softwareCompatibility?.length
                            ? presentation.softwareCompatibility
                            : prev.softwareCompatibility,
                    fontFamilies: presentation.fontFamilies?.length
                        ? presentation.fontFamilies
                        : prev.fontFamilies,
                    hasAnimations: presentation.hasAnimations ?? prev.hasAnimations,
                    hasTransitions: presentation.hasTransitions ?? prev.hasTransitions,
                    hasSpeakerNotes: presentation.hasSpeakerNotes ?? prev.hasSpeakerNotes,
                    hasCharts: presentation.hasCharts ?? prev.hasCharts,
                    hasImages: presentation.hasImages ?? prev.hasImages,
                }));

                if (presentation.colorSchemes?.length) {
                    setColorSchemes(presentation.colorSchemes);
                }

                toast.success(
                    "Upload complete",
                    "Presentation uploaded and processed successfully."
                );

                setTimeout(() => {
                    setIsUploading(false);
                    setCurrentStep(1);
                }, 800);
            },
            onError: (err) => {
                clearInterval(progressInterval);
                setIsUploading(false);
                setUploadProgress(0);
                toast.error(
                    "Upload failed",
                    err.message || "Failed to upload presentation."
                );
            },
        });
    };

    // ─── Form Handlers ──────────────────────────────────────────────────────

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setFormData((prev) => ({
            ...prev,
            title: value,
            slug: generateSlug(value),
        }));
        if (errors.title) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.title;
                return next;
            });
        }
    };

    const handleSelectChange = (name: keyof FormValues, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
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

    const removeKeyword = (keyword: string) => {
        setFormData((prev) => ({
            ...prev,
            seoKeywords: (prev.seoKeywords || []).filter((k) => k !== keyword),
        }));
    };

    const addColorScheme = () => {
        if (newColorName.trim() && currentSchemeColors.length > 0) {
            setColorSchemes((prev) => [
                ...prev,
                { name: newColorName.trim(), colors: [...currentSchemeColors] },
            ]);
            setNewColorName("");
            setCurrentSchemeColors([]);
        }
    };

    const removeColorScheme = (index: number) => {
        setColorSchemes((prev) => prev.filter((_, i) => i !== index));
    };

    const addColorToScheme = () => {
        if (newColorValue) {
            setCurrentSchemeColors((prev) => [...prev, newColorValue]);
        }
    };

    const removeColorFromScheme = (index: number) => {
        setCurrentSchemeColors((prev) => prev.filter((_, i) => i !== index));
    };

    // ─── AI Enhancement Handlers ────────────────────────────────────────────

    const handleGenerateDescription = () => {
        if (!uploadedPresentation) return;
        generateDescMutation.mutate(uploadedPresentation.id, {
            onSuccess: (data) => {
                setAiDescription(data.description);
                toast.success(
                    "Description generated",
                    "AI has generated a description for your presentation."
                );
            },
            onError: () => {
                toast.error("Error", "Failed to generate description.");
            },
        });
    };

    const handleSuggestPricing = () => {
        if (!uploadedPresentation) return;
        suggestPricingMutation.mutate(uploadedPresentation.id, {
            onSuccess: (data) => {
                setAiPrice(data);
                toast.success(
                    "Price suggested",
                    `AI suggests ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(data.suggestedPrice)}`
                );
            },
            onError: () => {
                toast.error("Error", "Failed to suggest pricing.");
            },
        });
    };

    const handleAnalyze = () => {
        if (!uploadedPresentation) return;
        analyzeMutation.mutate(uploadedPresentation.id, {
            onSuccess: (analyzed) => {
                setUploadedPresentation(analyzed);
                if (analyzed.aiDescription) {
                    setAiDescription(analyzed.aiDescription);
                }
                if (analyzed.aiSuggestedTags?.length) {
                    setAiTags(
                        analyzed.aiSuggestedTags.map((tag) => ({
                            tag,
                            accepted: true,
                        }))
                    );
                }
                if (analyzed.aiSuggestedPrice) {
                    setAiPrice({
                        suggestedPrice: analyzed.aiSuggestedPrice,
                        reasoning: "Based on AI analysis of content, industry, and market trends.",
                    });
                }
                toast.success(
                    "Analysis complete",
                    "AI analysis has been completed successfully."
                );
            },
            onError: () => {
                toast.error("Error", "Failed to run AI analysis.");
            },
        });
    };

    const handleRunFullAnalysis = () => {
        handleAnalyze();
    };

    const handleAcceptAiDescription = () => {
        setFormData((prev) => ({ ...prev, description: aiDescription }));
        toast.success("Applied", "AI description applied to the form.");
    };

    const handleAcceptAiPrice = () => {
        if (aiPrice) {
            setFormData((prev) => ({ ...prev, price: aiPrice.suggestedPrice }));
            toast.success("Applied", "AI suggested price applied.");
        }
    };

    const toggleAiTag = (index: number) => {
        setAiTags((prev) =>
            prev.map((t, i) =>
                i === index ? { ...t, accepted: !t.accepted } : t
            )
        );
    };

    const applyAcceptedTags = () => {
        const accepted = aiTags
            .filter((t) => t.accepted)
            .map((t) => t.tag);
        setFormData((prev) => ({
            ...prev,
            tags: Array.from(new Set([...(prev.tags || []), ...accepted])),
        }));
        toast.success(
            "Tags applied",
            `${accepted.length} tags have been added.`
        );
    };

    // ─── Slide Management ───────────────────────────────────────────────────

    const handleSlideVisibilityToggle = (slideId: string, isVisible: boolean) => {
        if (!uploadedPresentation) return;
        updateSlideMutation.mutate(
            {
                presentationId: uploadedPresentation.id,
                slideId,
                data: { isVisible: !isVisible },
            },
            {
                onSuccess: () => {
                    toast.success("Updated", "Slide visibility has been updated.");
                },
                onError: () => {
                    toast.error("Error", "Failed to update slide.");
                },
            }
        );
    };

    const handleRegenerateThumbnails = () => {
        if (!uploadedPresentation) return;
        regenerateThumbnailsMutation.mutate(uploadedPresentation.id, {
            onSuccess: () => {
                toast.success(
                    "Thumbnails regenerated",
                    "Slide thumbnails are being regenerated."
                );
            },
            onError: () => {
                toast.error("Error", "Failed to regenerate thumbnails.");
            },
        });
    };

    // ─── Validation & Submit ────────────────────────────────────────────────

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

    const handleSubmit = async (asDraft: boolean) => {
        const data = { ...formData };
        if (asDraft) data.status = "draft";
        else data.status = "published";

        setFormData(data);

        if (!validate()) {
            toast.error("Validation error", "Please fix the errors in the form.");
            setCurrentStep(1);
            return;
        }

        const submitData: CreatePresentationDto = {
            ...data,
            industry: data.industry as PresentationIndustry,
            type: data.type as PresentationType,
            aspectRatio: data.aspectRatio as PresentationAspectRatio | undefined,
            colorSchemes,
        };

        // If uploaded, link to existing presentation via update; otherwise create
        if (uploadedPresentation) {
            // Use create with the uploadedPresentation reference
            submitData.digitalProductId = data.digitalProductId || undefined;
        }

        createMutation.mutate(submitData, {
            onSuccess: () => {
                toast.success(
                    "Presentation saved",
                    asDraft
                        ? "Presentation saved as draft."
                        : "Presentation has been published."
                );
                router.push("/presentations");
            },
            onError: (err) => {
                toast.error(
                    "Error",
                    err.message || "Failed to save presentation."
                );
            },
        });
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Upload Presentation"
                description="Upload and configure a new presentation template"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Presentations", href: "/presentations" },
                    { label: "Upload New" },
                ]}
                backHref="/presentations"
                backLabel="Back to Presentations"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Step Indicator */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                <button
                                    onClick={() => {
                                        if (index === 0 || uploadedPresentation || uploadedFile) {
                                            setCurrentStep(index);
                                        }
                                    }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                                        currentStep === index
                                            ? "bg-primary text-white"
                                            : currentStep > index
                                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                              : "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
                                    }`}
                                >
                                    {currentStep > index ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        step.icon
                                    )}
                                    <span className="hidden sm:inline">
                                        {step.label}
                                    </span>
                                </button>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-px mx-2 ${
                                            currentStep > index
                                                ? "bg-green-300 dark:bg-green-700"
                                                : "bg-zinc-200 dark:bg-zinc-700"
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: File Upload */}
                    {currentStep === 0 && (
                        <motion.div
                            key="step-upload"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-8">
                                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">
                                    Upload Presentation File
                                </h2>

                                {!uploadedFile ? (
                                    <motion.div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        whileHover={{ scale: 1.01 }}
                                        className={`relative border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-colors ${
                                            isDragging
                                                ? "border-primary bg-primary/5"
                                                : "border-zinc-300 dark:border-zinc-600 hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-700/50"
                                        }`}
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPTED_FORMATS}
                                            onChange={handleFileSelect}
                                            className="hidden"
                                        />
                                        <motion.div
                                            animate={
                                                isDragging
                                                    ? { y: [0, -8, 0] }
                                                    : {}
                                            }
                                            transition={{
                                                repeat: isDragging
                                                    ? Infinity
                                                    : 0,
                                                duration: 1,
                                            }}
                                        >
                                            <FileUp className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                                        </motion.div>
                                        <p className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                                            {isDragging
                                                ? "Drop your file here"
                                                : "Drag and drop your presentation file"}
                                        </p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                                            or click to browse your files
                                        </p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">
                                            Accepted formats: .pptx, .ppt,
                                            .key, .odp, .pdf (max 200MB)
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* File info */}
                                        <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Presentation className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                                    {uploadedFile.name}
                                                </p>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {formatFileSize(
                                                        uploadedFile.size
                                                    )}
                                                </p>
                                            </div>
                                            {!isUploading && (
                                                <button
                                                    onClick={() => {
                                                        setUploadedFile(null);
                                                        setUploadedPresentation(
                                                            null
                                                        );
                                                        setUploadProgress(0);
                                                    }}
                                                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Progress bar */}
                                        {isUploading && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-zinc-600 dark:text-zinc-400">
                                                        Uploading and
                                                        processing...
                                                    </span>
                                                    <span className="font-medium text-zinc-900 dark:text-white">
                                                        {Math.round(
                                                            uploadProgress
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-primary rounded-full"
                                                        initial={{ width: 0 }}
                                                        animate={{
                                                            width: `${uploadProgress}%`,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Upload complete indicator */}
                                        {uploadedPresentation && (
                                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-300">
                                                        Upload complete
                                                    </p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        {uploadedPresentation.slideCount}{" "}
                                                        slides extracted,
                                                        metadata processed
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex items-center justify-end gap-3">
                                            {!uploadedPresentation &&
                                                !isUploading && (
                                                    <Button
                                                        onClick={handleUpload}
                                                        disabled={isUploading}
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Upload & Process
                                                    </Button>
                                                )}
                                            {uploadedPresentation && (
                                                <Button
                                                    onClick={() =>
                                                        setCurrentStep(1)
                                                    }
                                                >
                                                    Continue to Details
                                                    <ChevronRight className="h-4 w-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Presentation Details */}
                    {currentStep === 1 && (
                        <motion.div
                            key="step-details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            {/* Basic Info */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Basic Information
                                </h3>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="e.g., Modern Business Pitch Deck"
                                            value={formData.title}
                                            onChange={handleTitleChange}
                                        />
                                        {errors.title && (
                                            <p className="text-sm font-medium text-red-500">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug</Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            placeholder="modern-business-pitch-deck"
                                            value={formData.slug}
                                            onChange={handleChange}
                                        />
                                        {errors.slug && (
                                            <p className="text-sm font-medium text-red-500">
                                                {errors.slug}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shortDescription">
                                        Short Description
                                    </Label>
                                    <Input
                                        id="shortDescription"
                                        name="shortDescription"
                                        placeholder="Brief one-liner about this presentation"
                                        value={formData.shortDescription || ""}
                                        onChange={handleChange}
                                        maxLength={200}
                                    />
                                    <p className="text-xs text-zinc-400">
                                        {(formData.shortDescription || "").length}/200
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Full Description
                                    </Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Detailed description of the presentation..."
                                        className="h-32"
                                        value={formData.description || ""}
                                        onChange={handleChange}
                                    />
                                </div>

                                {/* Digital Product Link */}
                                <div className="space-y-2">
                                    <Label>
                                        Link to Digital Product (optional)
                                    </Label>
                                    <Select
                                        value={formData.digitalProductId || ""}
                                        onValueChange={(v) =>
                                            handleSelectChange(
                                                "digitalProductId",
                                                v
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a digital product..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">
                                                None
                                            </SelectItem>
                                            {digitalProducts.map((dp) => (
                                                <SelectItem
                                                    key={dp.id}
                                                    value={dp.id}
                                                >
                                                    {dp.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Industry Selector */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Industry
                                </h3>
                                {errors.industry && (
                                    <p className="text-sm font-medium text-red-500">
                                        {errors.industry}
                                    </p>
                                )}
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                                    {INDUSTRY_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() =>
                                                handleSelectChange(
                                                    "industry",
                                                    opt.value
                                                )
                                            }
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                                                formData.industry === opt.value
                                                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                                    : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                                            }`}
                                        >
                                            {opt.icon}
                                            <span className="truncate w-full text-center">
                                                {opt.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type & Aspect Ratio */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Classification
                                </h3>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Presentation Type</Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v) =>
                                                handleSelectChange("type", v)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TYPE_OPTIONS.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm font-medium text-red-500">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aspect Ratio</Label>
                                        <Select
                                            value={formData.aspectRatio || "16:9"}
                                            onValueChange={(v) =>
                                                handleSelectChange(
                                                    "aspectRatio",
                                                    v
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ratio..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ASPECT_RATIO_OPTIONS.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt.value}
                                                            value={opt.value}
                                                        >
                                                            {opt.label}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Pricing
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price</Label>
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                            value={formData.price || ""}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    price:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0,
                                                }))
                                            }
                                        />
                                        {errors.price && (
                                            <p className="text-sm font-medium text-red-500">
                                                {errors.price}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="compareAtPrice">
                                            Compare At Price
                                        </Label>
                                        <Input
                                            id="compareAtPrice"
                                            name="compareAtPrice"
                                            type="number"
                                            min={0}
                                            step={0.01}
                                            placeholder="0.00"
                                            value={formData.compareAtPrice || ""}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    compareAtPrice:
                                                        parseFloat(
                                                            e.target.value
                                                        ) || undefined,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Currency</Label>
                                        <Select
                                            value={formData.currency}
                                            onValueChange={(v) =>
                                                handleSelectChange(
                                                    "currency",
                                                    v
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="USD">
                                                    USD
                                                </SelectItem>
                                                <SelectItem value="EUR">
                                                    EUR
                                                </SelectItem>
                                                <SelectItem value="GBP">
                                                    GBP
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Software Compatibility */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Software Compatibility
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {SOFTWARE_COMPATIBILITY.map((software) => (
                                        <label
                                            key={software}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={(
                                                    formData.softwareCompatibility ||
                                                    []
                                                ).includes(software)}
                                                onChange={() =>
                                                    handleSoftwareToggle(
                                                        software
                                                    )
                                                }
                                                className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                                                {software}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Color Schemes */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Color Schemes
                                </h3>

                                {colorSchemes.length > 0 && (
                                    <div className="space-y-2">
                                        {colorSchemes.map((scheme, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg"
                                            >
                                                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 min-w-[80px]">
                                                    {scheme.name}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {scheme.colors.map(
                                                        (color, ci) => (
                                                            <div
                                                                key={ci}
                                                                className="h-6 w-6 rounded-full border border-zinc-300 dark:border-zinc-600"
                                                                style={{
                                                                    backgroundColor:
                                                                        color,
                                                                }}
                                                                title={color}
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeColorScheme(idx)
                                                    }
                                                    className="ml-auto p-1 text-zinc-400 hover:text-red-500 transition-colors"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-3 p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            placeholder="Scheme name"
                                            value={newColorName}
                                            onChange={(e) =>
                                                setNewColorName(e.target.value)
                                            }
                                            className="flex-1"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {currentSchemeColors.map(
                                            (color, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() =>
                                                        removeColorFromScheme(
                                                            idx
                                                        )
                                                    }
                                                    className="h-8 w-8 rounded-full border-2 border-zinc-300 dark:border-zinc-600 hover:border-red-400 transition-colors"
                                                    style={{
                                                        backgroundColor: color,
                                                    }}
                                                    title={`${color} - click to remove`}
                                                />
                                            )
                                        )}
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={newColorValue}
                                                onChange={(e) =>
                                                    setNewColorValue(
                                                        e.target.value
                                                    )
                                                }
                                                className="h-8 w-8 rounded cursor-pointer border-0"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addColorToScheme}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addColorScheme}
                                        disabled={
                                            !newColorName.trim() ||
                                            currentSchemeColors.length === 0
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Scheme
                                    </Button>
                                </div>
                            </div>

                            {/* Font Families */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Font Families
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {(formData.fontFamilies || []).map(
                                        (font) => (
                                            <span
                                                key={font}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full"
                                            >
                                                {font}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFont(font)
                                                    }
                                                    className="ml-0.5 text-zinc-400 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Add font family..."
                                        value={fontInput}
                                        onChange={(e) =>
                                            setFontInput(e.target.value)
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addFont();
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addFont}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Feature Toggles */}
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">
                                    Features
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { key: "hasAnimations" as const, label: "Has Animations", desc: "Contains slide animations" },
                                        { key: "hasTransitions" as const, label: "Has Transitions", desc: "Contains slide transitions" },
                                        { key: "hasSpeakerNotes" as const, label: "Has Speaker Notes", desc: "Includes speaker notes" },
                                        { key: "hasCharts" as const, label: "Has Charts", desc: "Contains data charts" },
                                        { key: "hasImages" as const, label: "Has Images", desc: "Contains images/photos" },
                                        { key: "isFullyEditable" as const, label: "Fully Editable", desc: "All elements are editable" },
                                        { key: "includesDocumentation" as const, label: "Includes Documentation", desc: "Comes with usage docs" },
                                    ].map((feature) => (
                                        <div
                                            key={feature.key}
                                            className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4"
                                        >
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">
                                                    {feature.label}
                                                </Label>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {feature.desc}
                                                </p>
                                            </div>
                                            <Switch
                                                checked={
                                                    formData[feature.key] as boolean
                                                }
                                                onCheckedChange={(checked: boolean) =>
                                                    handleSwitchChange(
                                                        feature.key,
                                                        checked
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(0)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={() => setCurrentStep(2)}>
                                    Continue to AI Enhancement
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: AI Enhancement */}
                    {currentStep === 2 && (
                        <motion.div
                            key="step-ai"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-purple-200 dark:border-purple-800 p-6 space-y-6">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                        AI Enhancement
                                    </h2>
                                </div>

                                {/* Run Full Analysis */}
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-purple-900 dark:text-purple-200">
                                                Run Full AI Analysis
                                            </p>
                                            <p className="text-sm text-purple-600 dark:text-purple-400">
                                                Generate description, suggest
                                                tags, and recommend pricing all
                                                at once.
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleRunFullAnalysis}
                                            disabled={
                                                analyzeMutation.isPending ||
                                                !uploadedPresentation
                                            }
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            {analyzeMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Brain className="h-4 w-4 mr-2" />
                                            )}
                                            Run Full Analysis
                                        </Button>
                                    </div>
                                </div>

                                {/* Generate Description */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                            AI Description
                                        </Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleGenerateDescription}
                                            disabled={
                                                generateDescMutation.isPending ||
                                                !uploadedPresentation
                                            }
                                        >
                                            {generateDescMutation.isPending ? (
                                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                                            )}
                                            Generate Description
                                        </Button>
                                    </div>
                                    {aiDescription && (
                                        <div className="space-y-2">
                                            <Textarea
                                                value={aiDescription}
                                                onChange={(e) =>
                                                    setAiDescription(
                                                        e.target.value
                                                    )
                                                }
                                                className="h-32"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={
                                                    handleAcceptAiDescription
                                                }
                                            >
                                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                                Apply to Form
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Suggest Tags */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">
                                        AI Suggested Tags
                                    </Label>
                                    {aiTags.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {aiTags.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() =>
                                                            toggleAiTag(idx)
                                                        }
                                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                                            item.accepted
                                                                ? "bg-primary/10 border-primary text-primary"
                                                                : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-500 line-through"
                                                        }`}
                                                    >
                                                        {item.accepted ? (
                                                            <Check className="h-3 w-3 inline mr-1" />
                                                        ) : (
                                                            <X className="h-3 w-3 inline mr-1" />
                                                        )}
                                                        {item.tag}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={applyAcceptedTags}
                                            >
                                                <Tag className="h-3.5 w-3.5 mr-1.5" />
                                                Apply Accepted Tags
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Suggest Pricing */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">
                                            AI Pricing Suggestion
                                        </Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSuggestPricing}
                                            disabled={
                                                suggestPricingMutation.isPending ||
                                                !uploadedPresentation
                                            }
                                        >
                                            {suggestPricingMutation.isPending ? (
                                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                            ) : (
                                                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                            )}
                                            Suggest Pricing
                                        </Button>
                                    </div>
                                    {aiPrice && (
                                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg space-y-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                                                    {new Intl.NumberFormat(
                                                        "en-US",
                                                        {
                                                            style: "currency",
                                                            currency: "USD",
                                                        }
                                                    ).format(
                                                        aiPrice.suggestedPrice
                                                    )}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleAcceptAiPrice}
                                                >
                                                    <Check className="h-3.5 w-3.5 mr-1" />
                                                    Apply
                                                </Button>
                                            </div>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                {aiPrice.reasoning}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* SEO Metadata */}
                                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                    <h3 className="font-medium text-zinc-900 dark:text-white flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        SEO Metadata
                                    </h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="seoTitle">
                                            SEO Title
                                        </Label>
                                        <Input
                                            id="seoTitle"
                                            name="seoTitle"
                                            placeholder="SEO title..."
                                            value={formData.seoTitle || ""}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="seoDescription">
                                            SEO Description
                                        </Label>
                                        <Textarea
                                            id="seoDescription"
                                            name="seoDescription"
                                            placeholder="SEO description..."
                                            className="h-20"
                                            value={
                                                formData.seoDescription || ""
                                            }
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>SEO Keywords</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {(formData.seoKeywords || []).map(
                                                (kw) => (
                                                    <span
                                                        key={kw}
                                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full"
                                                    >
                                                        {kw}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeKeyword(
                                                                    kw
                                                                )
                                                            }
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Add keyword..."
                                                value={keywordInput}
                                                onChange={(e) =>
                                                    setKeywordInput(
                                                        e.target.value
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addKeyword();
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addKeyword}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="space-y-2">
                                        <Label>Tags</Label>
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {(formData.tags || []).map(
                                                (tag) => (
                                                    <span
                                                        key={tag}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary/10 text-primary rounded-full"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeTag(tag)
                                                            }
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Add tag..."
                                                value={tagInput}
                                                onChange={(e) =>
                                                    setTagInput(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addTag();
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addTag}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(1)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={() => setCurrentStep(3)}>
                                    Continue to Slides
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Slide Preview Manager */}
                    {currentStep === 3 && (
                        <motion.div
                            key="step-slides"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                        Slide Preview Manager
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRegenerateThumbnails}
                                            disabled={
                                                regenerateThumbnailsMutation.isPending
                                            }
                                        >
                                            {regenerateThumbnailsMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                            ) : (
                                                <ImageIcon className="h-4 w-4 mr-1.5" />
                                            )}
                                            Regenerate Thumbnails
                                        </Button>
                                    </div>
                                </div>

                                {slides.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {slides.map((slide) => (
                                            <div
                                                key={slide.id}
                                                className={`group relative rounded-xl border overflow-hidden transition-all ${
                                                    slide.isVisible
                                                        ? "border-zinc-200 dark:border-zinc-700"
                                                        : "border-zinc-200 dark:border-zinc-700 opacity-50"
                                                }`}
                                            >
                                                <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 relative">
                                                    {slide.thumbnailUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={
                                                                slide.thumbnailUrl
                                                            }
                                                            alt={`Slide ${slide.slideNumber}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                                            <Layers className="h-6 w-6" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-black/60 text-white">
                                                        {slide.slideNumber}
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handleSlideVisibilityToggle(
                                                                slide.id,
                                                                slide.isVisible
                                                            )
                                                        }
                                                        className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 text-white hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                                                        title={
                                                            slide.isVisible
                                                                ? "Hide slide"
                                                                : "Show slide"
                                                        }
                                                    >
                                                        {slide.isVisible ? (
                                                            <Eye className="h-3 w-3" />
                                                        ) : (
                                                            <EyeOff className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="p-2.5">
                                                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                                                        {slide.title ||
                                                            `Slide ${slide.slideNumber}`}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize">
                                                        {slide.contentType.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <Layers className="h-10 w-10 text-zinc-400 mx-auto mb-4" />
                                        <p className="text-zinc-500 dark:text-zinc-400">
                                            {uploadedPresentation
                                                ? "Slides are being processed. They will appear shortly."
                                                : "Upload a presentation first to see slide previews."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Submit Actions */}
                            <div className="flex items-center justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(2)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleSubmit(true)}
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        )}
                                        Save as Draft
                                    </Button>
                                    <Button
                                        onClick={() => handleSubmit(false)}
                                        disabled={createMutation.isPending}
                                    >
                                        {createMutation.isPending && (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        )}
                                        Publish
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
