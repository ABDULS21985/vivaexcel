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
    Brain,
    DollarSign,
    Globe,
    GripVertical,
    FileText,
    Shield,
    Cloud,
    Server,
    Database,
    Network,
    Lock,
    GitMerge,
    ArrowRightLeft,
    AlertTriangle,
    Workflow,
    CircleDot,
    Cpu,
    ShoppingCart,
    Layers,
    Smartphone,
    Link2,
    Binary,
    Boxes,
    Gauge,
    GraduationCap,
    HeartPulse,
    Landmark,
    Monitor,
    Zap,
    ArrowUp,
    ArrowDown,
    Trash2,
} from "lucide-react";
import {
    useUploadDocument,
    useCreateSolutionDocument,
    useAnalyzeDocument,
    useGenerateDocumentDescription,
    useGenerateSeo,
    useGenerateToc,
    useExtractTechStack,
    type DocumentType,
    type Domain,
    type MaturityLevel,
    type DiagramTool,
    type CloudPlatform,
    type ComplianceFramework,
    type TemplateFormat,
    type TOCItem,
    type CreateSolutionDocumentDto,
    type SolutionDocument,
} from "@/hooks/use-solution-documents";
import { useDigitalProducts } from "@/hooks/use-digital-products";

// ─── Constants ──────────────────────────────────────────────────────────────

const ACCEPTED_FORMATS = ".docx,.pdf,.doc,.md";
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string; icon: React.ReactNode }[] = [
    { value: "architecture_design", label: "Architecture Design", icon: <Boxes className="h-5 w-5" /> },
    { value: "system_design", label: "System Design", icon: <Server className="h-5 w-5" /> },
    { value: "api_specification", label: "API Specification", icon: <Globe className="h-5 w-5" /> },
    { value: "database_design", label: "Database Design", icon: <Database className="h-5 w-5" /> },
    { value: "infrastructure", label: "Infrastructure", icon: <Cloud className="h-5 w-5" /> },
    { value: "security_design", label: "Security Design", icon: <Lock className="h-5 w-5" /> },
    { value: "integration_design", label: "Integration Design", icon: <GitMerge className="h-5 w-5" /> },
    { value: "migration_plan", label: "Migration Plan", icon: <ArrowRightLeft className="h-5 w-5" /> },
    { value: "disaster_recovery", label: "Disaster Recovery", icon: <AlertTriangle className="h-5 w-5" /> },
    { value: "network_design", label: "Network Design", icon: <Network className="h-5 w-5" /> },
    { value: "data_flow", label: "Data Flow", icon: <Workflow className="h-5 w-5" /> },
    { value: "other", label: "Other", icon: <CircleDot className="h-5 w-5" /> },
];

const DOMAIN_OPTIONS: { value: Domain; label: string; icon: React.ReactNode }[] = [
    { value: "fintech", label: "Fintech", icon: <Landmark className="h-5 w-5" /> },
    { value: "healthtech", label: "Healthtech", icon: <HeartPulse className="h-5 w-5" /> },
    { value: "edtech", label: "Edtech", icon: <GraduationCap className="h-5 w-5" /> },
    { value: "ecommerce", label: "E-Commerce", icon: <ShoppingCart className="h-5 w-5" /> },
    { value: "saas", label: "SaaS", icon: <Cloud className="h-5 w-5" /> },
    { value: "iot", label: "IoT", icon: <Cpu className="h-5 w-5" /> },
    { value: "ai_ml", label: "AI/ML", icon: <Brain className="h-5 w-5" /> },
    { value: "cybersecurity", label: "Cybersecurity", icon: <Shield className="h-5 w-5" /> },
    { value: "cloud_infrastructure", label: "Cloud Infra", icon: <Server className="h-5 w-5" /> },
    { value: "devops", label: "DevOps", icon: <Zap className="h-5 w-5" /> },
    { value: "mobile", label: "Mobile", icon: <Smartphone className="h-5 w-5" /> },
    { value: "blockchain", label: "Blockchain", icon: <Link2 className="h-5 w-5" /> },
    { value: "other", label: "Other", icon: <CircleDot className="h-5 w-5" /> },
];

const CLOUD_PLATFORMS: { value: CloudPlatform; label: string }[] = [
    { value: "aws", label: "AWS" },
    { value: "azure", label: "Azure" },
    { value: "gcp", label: "GCP" },
    { value: "multi_cloud", label: "Multi-Cloud" },
    { value: "on_premise", label: "On-Premise" },
];

const COMPLIANCE_FRAMEWORKS: { value: ComplianceFramework; label: string }[] = [
    { value: "soc2", label: "SOC2" },
    { value: "hipaa", label: "HIPAA" },
    { value: "gdpr", label: "GDPR" },
    { value: "iso27001", label: "ISO 27001" },
    { value: "pci_dss", label: "PCI-DSS" },
];

const TEMPLATE_FORMATS: { value: TemplateFormat; label: string }[] = [
    { value: "docx", label: "DOCX" },
    { value: "pdf", label: "PDF" },
    { value: "notion", label: "Notion" },
    { value: "confluence", label: "Confluence" },
    { value: "markdown", label: "Markdown" },
];

const DIAGRAM_TOOLS: { value: DiagramTool; label: string }[] = [
    { value: "draw_io", label: "Draw.io" },
    { value: "lucidchart", label: "Lucidchart" },
    { value: "miro", label: "Miro" },
    { value: "figma", label: "Figma" },
    { value: "visio", label: "Visio" },
    { value: "plantuml", label: "PlantUML" },
    { value: "other", label: "Other" },
];

const STEPS = [
    { label: "File Upload", description: "Upload your document" },
    { label: "Document Details", description: "Describe your document" },
    { label: "Table of Contents", description: "Organize structure" },
    { label: "AI Enhancement", description: "AI-powered improvements" },
];

// ─── Schema ─────────────────────────────────────────────────────────────────

const documentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().max(200, "Short description must be under 200 characters").optional(),
    documentType: z.string().min(1, "Document type is required"),
    domain: z.string().min(1, "Domain is required"),
    maturityLevel: z.enum(["starter", "intermediate", "enterprise"]).default("intermediate"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    price: z.number().min(0, "Price must be 0 or greater"),
    compareAtPrice: z.number().optional(),
    currency: z.string().default("USD"),
    cloudPlatforms: z.array(z.string()).optional(),
    technologyStack: z.array(z.string()).optional(),
    complianceFrameworks: z.array(z.string()).optional(),
    templateFormats: z.array(z.string()).optional(),
    hasEditableDiagrams: z.boolean().default(false),
    diagramTool: z.string().optional(),
    includes: z.object({
        editableTemplates: z.boolean().default(false),
        diagramFiles: z.boolean().default(false),
        implementationChecklist: z.boolean().default(false),
        costEstimator: z.boolean().default(false),
    }).optional(),
    digitalProductId: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof documentSchema>;

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

export default function NewSolutionDocumentPage() {
    const router = useRouter();
    const toast = useToast();

    // State
    const [currentStep, setCurrentStep] = React.useState(0);
    const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
    const [uploadedDocument, setUploadedDocument] = React.useState<SolutionDocument | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState(0);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [tocItems, setTocItems] = React.useState<TOCItem[]>([]);
    const [newTocTitle, setNewTocTitle] = React.useState("");
    const [newTocLevel, setNewTocLevel] = React.useState(1);
    const [techInput, setTechInput] = React.useState("");
    const [tagInput, setTagInput] = React.useState("");
    const [keywordInput, setKeywordInput] = React.useState("");
    const [aiDescription, setAiDescription] = React.useState("");
    const [aiSeo, setAiSeo] = React.useState<{ seoTitle: string; seoDescription: string; seoKeywords: string[] } | null>(null);
    const [aiTechStack, setAiTechStack] = React.useState<{ tech: string; accepted: boolean }[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const [formData, setFormData] = React.useState<FormValues>({
        title: "",
        slug: "",
        description: "",
        shortDescription: "",
        documentType: "",
        domain: "",
        maturityLevel: "intermediate",
        status: "draft",
        price: 0,
        compareAtPrice: undefined,
        currency: "USD",
        cloudPlatforms: [],
        technologyStack: [],
        complianceFrameworks: [],
        templateFormats: [],
        hasEditableDiagrams: false,
        diagramTool: "",
        includes: {
            editableTemplates: false,
            diagramFiles: false,
            implementationChecklist: false,
            costEstimator: false,
        },
        digitalProductId: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: [],
        tags: [],
    });

    // Queries
    const { data: digitalProductsData } = useDigitalProducts({});
    const digitalProducts = digitalProductsData?.items ?? [];

    // Mutations
    const uploadMutation = useUploadDocument();
    const createMutation = useCreateSolutionDocument();
    const analyzeMutation = useAnalyzeDocument();
    const generateDescMutation = useGenerateDocumentDescription();
    const generateSeoMutation = useGenerateSeo();
    const generateTocMutation = useGenerateToc();
    const extractTechMutation = useExtractTechStack();

    // ─── File upload handlers ───────────────────────────────────────────────

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!["docx", "pdf", "doc", "md"].includes(ext || "")) {
            toast.error("Invalid file", "Please upload a .docx, .pdf, .doc, or .md file.");
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error("File too large", "Maximum file size is 100MB.");
            return;
        }
        setUploadedFile(file);
        handleUpload(file);
    };

    const handleUpload = (file: File) => {
        setIsUploading(true);
        setUploadProgress(0);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval);
                    return 90;
                }
                return prev + Math.random() * 15;
            });
        }, 500);

        const fd = new FormData();
        fd.append("file", file);

        uploadMutation.mutate(fd, {
            onSuccess: (doc) => {
                clearInterval(progressInterval);
                setUploadProgress(100);
                setUploadedDocument(doc);
                setFormData((prev) => ({
                    ...prev,
                    title: doc.title || file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "),
                    slug: doc.slug || generateSlug(doc.title || file.name.replace(/\.[^.]+$/, "")),
                }));
                if (doc.tableOfContents?.length) {
                    setTocItems(doc.tableOfContents);
                }
                setIsUploading(false);
                toast.success("Upload complete", "Document uploaded and metadata extracted.");
            },
            onError: () => {
                clearInterval(progressInterval);
                setIsUploading(false);
                setUploadProgress(0);
                toast.error("Upload failed", "Failed to upload document. Please try again.");
            },
        });
    };

    // ─── Form handlers ──────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "title" && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
        }
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

    const handleSwitchChange = (name: string, checked: boolean) => {
        if (name.startsWith("includes.")) {
            const key = name.split(".")[1] as keyof NonNullable<FormValues["includes"]>;
            setFormData((prev) => ({
                ...prev,
                includes: { ...prev.includes!, [key]: checked },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: checked }));
        }
    };

    const handleArrayToggle = (field: keyof FormValues, value: string) => {
        setFormData((prev) => {
            const current = (prev[field] as string[]) || [];
            const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const addTechStack = () => {
        if (techInput.trim()) {
            setFormData((prev) => ({
                ...prev,
                technologyStack: [...(prev.technologyStack || []), techInput.trim()],
            }));
            setTechInput("");
        }
    };

    const removeTechStack = (tech: string) => {
        setFormData((prev) => ({
            ...prev,
            technologyStack: (prev.technologyStack || []).filter((t) => t !== tech),
        }));
    };

    const addTag = () => {
        if (tagInput.trim()) {
            setFormData((prev) => ({ ...prev, tags: [...(prev.tags || []), tagInput.trim()] }));
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }));
    };

    // ─── TOC handlers ───────────────────────────────────────────────────────

    const addTocItem = () => {
        if (newTocTitle.trim()) {
            const newItem: TOCItem = {
                id: `toc-${Date.now()}`,
                title: newTocTitle.trim(),
                level: newTocLevel,
                sortOrder: tocItems.length,
            };
            setTocItems((prev) => [...prev, newItem]);
            setNewTocTitle("");
        }
    };

    const removeTocItem = (id: string) => {
        setTocItems((prev) => prev.filter((item) => item.id !== id));
    };

    const moveTocItem = (index: number, direction: "up" | "down") => {
        setTocItems((prev) => {
            const items = [...prev];
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= items.length) return prev;
            [items[index], items[newIndex]] = [items[newIndex], items[index]];
            return items.map((item, i) => ({ ...item, sortOrder: i }));
        });
    };

    const updateTocItem = (id: string, field: keyof TOCItem, value: string | number) => {
        setTocItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleGenerateToc = () => {
        if (!uploadedDocument) return;
        generateTocMutation.mutate(uploadedDocument.id, {
            onSuccess: (data) => {
                setTocItems(data.tableOfContents);
                toast.success("TOC generated", "Table of contents generated from document.");
            },
            onError: () => toast.error("Error", "Failed to generate table of contents."),
        });
    };

    // ─── AI handlers ────────────────────────────────────────────────────────

    const handleRunAnalysis = () => {
        if (!uploadedDocument) return;
        analyzeMutation.mutate(uploadedDocument.id, {
            onSuccess: (doc) => {
                setUploadedDocument(doc);
                if (doc.aiDescription) setAiDescription(doc.aiDescription);
                if (doc.seoTitle || doc.seoDescription) {
                    setAiSeo({
                        seoTitle: doc.seoTitle || "",
                        seoDescription: doc.seoDescription || "",
                        seoKeywords: doc.seoKeywords || [],
                    });
                }
                toast.success("Analysis complete", "AI analysis has finished.");
            },
            onError: () => toast.error("Error", "Failed to run AI analysis."),
        });
    };

    const handleGenerateDescription = () => {
        if (!uploadedDocument) return;
        generateDescMutation.mutate(uploadedDocument.id, {
            onSuccess: (data) => {
                setAiDescription(data.description);
                toast.success("Generated", "AI description generated.");
            },
            onError: () => toast.error("Error", "Failed to generate description."),
        });
    };

    const handleGenerateSeo = () => {
        if (!uploadedDocument) return;
        generateSeoMutation.mutate(uploadedDocument.id, {
            onSuccess: (data) => {
                setAiSeo(data);
                toast.success("Generated", "SEO metadata generated.");
            },
            onError: () => toast.error("Error", "Failed to generate SEO metadata."),
        });
    };

    const handleExtractTechStack = () => {
        if (!uploadedDocument) return;
        extractTechMutation.mutate(uploadedDocument.id, {
            onSuccess: (data) => {
                setAiTechStack(data.technologyStack.map((t) => ({ tech: t, accepted: true })));
                toast.success("Extracted", "Technology stack extracted from document.");
            },
            onError: () => toast.error("Error", "Failed to extract tech stack."),
        });
    };

    const applyAiDescription = () => {
        setFormData((prev) => ({ ...prev, description: aiDescription }));
        toast.success("Applied", "AI description applied.");
    };

    const applyAiSeo = () => {
        if (aiSeo) {
            setFormData((prev) => ({
                ...prev,
                seoTitle: aiSeo.seoTitle,
                seoDescription: aiSeo.seoDescription,
                seoKeywords: aiSeo.seoKeywords,
            }));
            toast.success("Applied", "SEO metadata applied.");
        }
    };

    const applyTechStack = () => {
        const accepted = aiTechStack.filter((t) => t.accepted).map((t) => t.tech);
        setFormData((prev) => ({
            ...prev,
            technologyStack: [...new Set([...(prev.technologyStack || []), ...accepted])],
        }));
        toast.success("Applied", `${accepted.length} technologies added.`);
    };

    const toggleAiTech = (index: number) => {
        setAiTechStack((prev) => prev.map((t, i) => i === index ? { ...t, accepted: !t.accepted } : t));
    };

    // ─── Validation & Submit ────────────────────────────────────────────────

    const validate = (): boolean => {
        const result = documentSchema.safeParse(formData);
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

    const handleSubmit = (status: "draft" | "published") => {
        if (!validate()) {
            toast.error("Validation error", "Please fix the errors before saving.");
            setCurrentStep(1);
            return;
        }

        const data: CreateSolutionDocumentDto = {
            ...formData,
            status,
            documentType: formData.documentType as DocumentType,
            domain: formData.domain as Domain,
            maturityLevel: formData.maturityLevel as MaturityLevel,
            diagramTool: formData.hasEditableDiagrams && formData.diagramTool ? (formData.diagramTool as DiagramTool) : undefined,
            tableOfContents: tocItems,
        };

        createMutation.mutate(data, {
            onSuccess: (doc) => {
                toast.success(
                    status === "published" ? "Published" : "Saved as Draft",
                    `Solution document "${doc.title}" has been ${status === "published" ? "published" : "saved as draft"}.`
                );
                router.push("/solutions");
            },
            onError: (err) => {
                toast.error("Error", err.message || "Failed to create document.");
            },
        });
    };

    // ─── Navigation ─────────────────────────────────────────────────────────

    const canProceed = () => {
        if (currentStep === 0) return !!uploadedDocument || !!uploadedFile;
        if (currentStep === 1) return !!formData.title && !!formData.documentType && !!formData.domain;
        return true;
    };

    const nextStep = () => {
        if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    };

    // ─── Animation variants ─────────────────────────────────────────────────

    const stepVariants = {
        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
    };

    const [direction, setDirection] = React.useState(0);

    const goToStep = (step: number) => {
        setDirection(step > currentStep ? 1 : -1);
        setCurrentStep(step);
    };

    const handleNext = () => {
        setDirection(1);
        nextStep();
    };

    const handlePrev = () => {
        setDirection(-1);
        prevStep();
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Upload Solution Document"
                description="Add a new solution design document to the marketplace"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Solutions", href: "/solutions" },
                    { label: "New Document" },
                ]}
                backHref="/solutions"
                backLabel="Back to Solutions"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Step Indicator */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    <div className="flex items-center justify-between">
                        {STEPS.map((step, index) => (
                            <React.Fragment key={index}>
                                <button
                                    onClick={() => index <= Math.max(currentStep, uploadedDocument ? 3 : 0) && goToStep(index)}
                                    className="flex items-center gap-3 group"
                                    disabled={index > Math.max(currentStep, uploadedDocument ? 3 : 0)}
                                >
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                        index < currentStep
                                            ? "bg-green-500 text-white"
                                            : index === currentStep
                                            ? "bg-primary text-white"
                                            : "bg-zinc-100 dark:bg-zinc-700 text-zinc-400"
                                    }`}>
                                        {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                                    </div>
                                    <div className="hidden sm:block text-left">
                                        <p className={`text-sm font-medium ${index === currentStep ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500">{step.description}</p>
                                    </div>
                                </button>
                                {index < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-4 rounded ${index < currentStep ? "bg-green-500" : "bg-zinc-200 dark:bg-zinc-700"}`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={currentStep}
                        custom={direction}
                        variants={stepVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "tween", duration: 0.3 }}
                    >
                        {/* ─── Step 1: File Upload ─────────────────────────────── */}
                        {currentStep === 0 && (
                            <div className="space-y-6">
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                                        isDragging
                                            ? "border-primary bg-primary/5"
                                            : uploadedFile
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                            : "border-zinc-300 dark:border-zinc-600 hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                    }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept={ACCEPTED_FORMATS}
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    {isUploading ? (
                                        <div className="space-y-4">
                                            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Uploading and processing document...</p>
                                            <div className="max-w-xs mx-auto">
                                                <div className="h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                                </div>
                                                <p className="text-xs text-zinc-500 mt-1">{Math.round(uploadProgress)}%</p>
                                            </div>
                                        </div>
                                    ) : uploadedFile ? (
                                        <div className="space-y-3">
                                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                                                <Check className="h-6 w-6 text-green-600" />
                                            </div>
                                            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{uploadedFile.name}</p>
                                            <p className="text-xs text-zinc-500">{formatFileSize(uploadedFile.size)}</p>
                                            <p className="text-xs text-primary">Click to replace file</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center mx-auto">
                                                <Upload className="h-8 w-8 text-zinc-400" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
                                                    Drag and drop your document here
                                                </p>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                    or click to browse files
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 text-xs text-zinc-400">
                                                <span>Accepted: .docx, .pdf, .doc, .md</span>
                                                <span>|</span>
                                                <span>Max: 100MB</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Extracted metadata */}
                                {uploadedDocument && (
                                    <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Extracted Metadata</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Pages</p>
                                                <p className="text-xl font-bold text-zinc-900 dark:text-white">{uploadedDocument.pageCount}</p>
                                            </div>
                                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Words</p>
                                                <p className="text-xl font-bold text-zinc-900 dark:text-white">{uploadedDocument.wordCount.toLocaleString()}</p>
                                            </div>
                                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Headings Found</p>
                                                <p className="text-xl font-bold text-zinc-900 dark:text-white">{uploadedDocument.tableOfContents?.length || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── Step 2: Document Details ────────────────────────── */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Basic Information</h3>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Title *</Label>
                                            <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Microservices Architecture for E-Commerce" />
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
                                        <Input id="shortDescription" name="shortDescription" value={formData.shortDescription || ""} onChange={handleChange} maxLength={200} placeholder="Brief summary for cards and listings" />
                                        <p className="text-xs text-zinc-400">{(formData.shortDescription || "").length}/200</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Full Description</Label>
                                        <Textarea id="description" name="description" className="h-32" value={formData.description || ""} onChange={handleChange} placeholder="Detailed description of the solution document..." />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Digital Product Link</Label>
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

                                {/* Document Type Selector */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Document Type *</h3>
                                    {errors.documentType && <p className="text-sm font-medium text-red-500">{errors.documentType}</p>}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {DOCUMENT_TYPE_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleSelectChange("documentType", opt.value)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                    formData.documentType === opt.value
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                                                }`}
                                            >
                                                {opt.icon}
                                                <span className="text-xs font-medium text-center">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Domain Selector */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Domain *</h3>
                                    {errors.domain && <p className="text-sm font-medium text-red-500">{errors.domain}</p>}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {DOMAIN_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => handleSelectChange("domain", opt.value)}
                                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                                    formData.domain === opt.value
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                                                }`}
                                            >
                                                {opt.icon}
                                                <span className="text-xs font-medium text-center">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Maturity Level */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Maturity Level</h3>
                                    <div className="flex items-center gap-3">
                                        {(["starter", "intermediate", "enterprise"] as MaturityLevel[]).map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => handleSelectChange("maturityLevel", level)}
                                                className={`flex-1 py-3 px-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                                                    formData.maturityLevel === level
                                                        ? "border-primary bg-primary/5 text-primary"
                                                        : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
                                                }`}
                                            >
                                                {level.charAt(0).toUpperCase() + level.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Cloud Platforms */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Cloud Platforms</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {CLOUD_PLATFORMS.map((cp) => (
                                            <label key={cp.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={(formData.cloudPlatforms || []).includes(cp.value)} onChange={() => handleArrayToggle("cloudPlatforms", cp.value)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{cp.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Technology Stack */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Technology Stack</h3>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {(formData.technologyStack || []).map((tech) => (
                                            <span key={tech} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full">
                                                {tech}
                                                <button type="button" onClick={() => removeTechStack(tech)} className="ml-0.5 text-zinc-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input placeholder="Add technology..." value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTechStack(); } }} className="flex-1" />
                                        <Button type="button" variant="outline" onClick={addTechStack}><Plus className="h-4 w-4" /></Button>
                                    </div>
                                </div>

                                {/* Compliance Frameworks */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Compliance Frameworks</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {COMPLIANCE_FRAMEWORKS.map((cf) => (
                                            <label key={cf.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={(formData.complianceFrameworks || []).includes(cf.value)} onChange={() => handleArrayToggle("complianceFrameworks", cf.value)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{cf.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Template Formats */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Template Formats</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {TEMPLATE_FORMATS.map((tf) => (
                                            <label key={tf.value} className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={(formData.templateFormats || []).includes(tf.value)} onChange={() => handleArrayToggle("templateFormats", tf.value)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" />
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{tf.label}</span>
                                            </label>
                                        ))}
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

                                {/* Feature Toggles */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Features & Includes</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">Editable Diagrams</Label>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Includes editable diagram files</p>
                                            </div>
                                            <Switch checked={formData.hasEditableDiagrams} onCheckedChange={(checked: boolean) => handleSwitchChange("hasEditableDiagrams", checked)} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">Editable Templates</Label>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Includes editable template files</p>
                                            </div>
                                            <Switch checked={formData.includes?.editableTemplates || false} onCheckedChange={(checked: boolean) => handleSwitchChange("includes.editableTemplates", checked)} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">Diagram Files</Label>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Includes source diagram files</p>
                                            </div>
                                            <Switch checked={formData.includes?.diagramFiles || false} onCheckedChange={(checked: boolean) => handleSwitchChange("includes.diagramFiles", checked)} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">Implementation Checklist</Label>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Includes step-by-step checklist</p>
                                            </div>
                                            <Switch checked={formData.includes?.implementationChecklist || false} onCheckedChange={(checked: boolean) => handleSwitchChange("includes.implementationChecklist", checked)} />
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">Cost Estimator</Label>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Includes cost estimation tools</p>
                                            </div>
                                            <Switch checked={formData.includes?.costEstimator || false} onCheckedChange={(checked: boolean) => handleSwitchChange("includes.costEstimator", checked)} />
                                        </div>
                                    </div>

                                    {formData.hasEditableDiagrams && (
                                        <div className="space-y-2 pt-2">
                                            <Label>Diagram Tool</Label>
                                            <Select value={formData.diagramTool || ""} onValueChange={(v) => handleSelectChange("diagramTool", v)}>
                                                <SelectTrigger><SelectValue placeholder="Select diagram tool..." /></SelectTrigger>
                                                <SelectContent>
                                                    {DIAGRAM_TOOLS.map((dt) => (
                                                        <SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ─── Step 3: Table of Contents ───────────────────────── */}
                        {currentStep === 2 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* TOC Builder */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Table of Contents</h3>
                                        <Button variant="outline" size="sm" onClick={handleGenerateToc} disabled={!uploadedDocument || generateTocMutation.isPending}>
                                            {generateTocMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                                            Generate with AI
                                        </Button>
                                    </div>

                                    {/* Add TOC Item */}
                                    <div className="flex items-end gap-2">
                                        <div className="flex-1 space-y-1.5">
                                            <Label className="text-xs">Title</Label>
                                            <Input value={newTocTitle} onChange={(e) => setNewTocTitle(e.target.value)} placeholder="Section title..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTocItem(); } }} />
                                        </div>
                                        <div className="w-24 space-y-1.5">
                                            <Label className="text-xs">Level</Label>
                                            <Select value={String(newTocLevel)} onValueChange={(v) => setNewTocLevel(Number(v))}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1">H1</SelectItem>
                                                    <SelectItem value="2">H2</SelectItem>
                                                    <SelectItem value="3">H3</SelectItem>
                                                    <SelectItem value="4">H4</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="button" variant="outline" onClick={addTocItem} disabled={!newTocTitle.trim()}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* TOC Items List */}
                                    <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                                        {tocItems.length > 0 ? (
                                            tocItems.map((item, index) => (
                                                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 group" style={{ paddingLeft: `${(item.level - 1) * 20 + 8}px` }}>
                                                    <GripVertical className="h-4 w-4 text-zinc-400 flex-shrink-0 cursor-grab" />
                                                    <input
                                                        className="flex-1 text-sm bg-transparent border-none outline-none text-zinc-700 dark:text-zinc-300"
                                                        value={item.title}
                                                        onChange={(e) => updateTocItem(item.id, "title", e.target.value)}
                                                    />
                                                    <span className="text-[10px] font-medium text-zinc-400 uppercase">H{item.level}</span>
                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => moveTocItem(index, "up")} disabled={index === 0} className="p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30">
                                                            <ArrowUp className="h-3 w-3" />
                                                        </button>
                                                        <button onClick={() => moveTocItem(index, "down")} disabled={index === tocItems.length - 1} className="p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30">
                                                            <ArrowDown className="h-3 w-3" />
                                                        </button>
                                                        <button onClick={() => removeTocItem(item.id)} className="p-0.5 text-zinc-400 hover:text-red-500">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                                                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No table of contents items yet.</p>
                                                <p className="text-xs mt-1">Add items manually or generate with AI.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* TOC Preview */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Preview</h3>
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        {tocItems.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {tocItems.map((item) => {
                                                    const Tag = `h${Math.min(item.level + 1, 6)}` as keyof JSX.IntrinsicElements;
                                                    return (
                                                        <div key={item.id} style={{ paddingLeft: `${(item.level - 1) * 16}px` }}>
                                                            <p className={`text-zinc-700 dark:text-zinc-300 ${
                                                                item.level === 1 ? "text-base font-bold" :
                                                                item.level === 2 ? "text-sm font-semibold" :
                                                                item.level === 3 ? "text-sm font-medium" :
                                                                "text-xs font-normal"
                                                            }`}>
                                                                {item.title}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-zinc-400 text-sm">Table of contents preview will appear here.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Step 4: AI Enhancement ──────────────────────────── */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                {/* Run Full Analysis */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-zinc-900 dark:text-white">Run Full AI Analysis</p>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Analyze your document to generate description, SEO, and tech stack suggestions.</p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={handleRunAnalysis}
                                            disabled={!uploadedDocument || analyzeMutation.isPending}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            {analyzeMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                            Run Full Analysis
                                        </Button>
                                    </div>
                                    {uploadedDocument?.freshnessScore != null && (
                                        <div className="mt-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <Gauge className="h-4 w-4 text-zinc-400" />
                                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Freshness Score:</span>
                                                <span className={`text-sm font-bold ${
                                                    uploadedDocument.freshnessScore >= 80 ? "text-green-600" :
                                                    uploadedDocument.freshnessScore >= 50 ? "text-amber-600" : "text-red-600"
                                                }`}>
                                                    {uploadedDocument.freshnessScore}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* AI Description */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">AI Description</h3>
                                        <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={!uploadedDocument || generateDescMutation.isPending}>
                                            {generateDescMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                                            Generate
                                        </Button>
                                    </div>
                                    {aiDescription ? (
                                        <div className="space-y-3">
                                            <Textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} className="h-32" />
                                            <Button variant="outline" size="sm" onClick={applyAiDescription}>
                                                <Check className="h-3.5 w-3.5 mr-1.5" />Apply to Description
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Click "Generate" to create an AI-powered description.</p>
                                    )}
                                </div>

                                {/* AI SEO */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2"><Globe className="h-5 w-5" />SEO Metadata</h3>
                                        <Button variant="outline" size="sm" onClick={handleGenerateSeo} disabled={!uploadedDocument || generateSeoMutation.isPending}>
                                            {generateSeoMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                                            Generate SEO
                                        </Button>
                                    </div>
                                    {aiSeo ? (
                                        <div className="space-y-3">
                                            <div className="space-y-2">
                                                <Label className="text-xs">SEO Title</Label>
                                                <Input value={aiSeo.seoTitle} onChange={(e) => setAiSeo({ ...aiSeo, seoTitle: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">SEO Description</Label>
                                                <Textarea value={aiSeo.seoDescription} onChange={(e) => setAiSeo({ ...aiSeo, seoDescription: e.target.value })} className="h-20" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Keywords</Label>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {aiSeo.seoKeywords.map((kw, i) => (
                                                        <span key={i} className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300">{kw}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={applyAiSeo}>
                                                <Check className="h-3.5 w-3.5 mr-1.5" />Apply SEO Metadata
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Click "Generate SEO" to create optimized metadata.</p>
                                    )}
                                </div>

                                {/* AI Tech Stack */}
                                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Technology Stack Suggestions</h3>
                                        <Button variant="outline" size="sm" onClick={handleExtractTechStack} disabled={!uploadedDocument || extractTechMutation.isPending}>
                                            {extractTechMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                                            Extract Tech Stack
                                        </Button>
                                    </div>
                                    {aiTechStack.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap gap-2">
                                                {aiTechStack.map((item, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => toggleAiTech(index)}
                                                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                                            item.accepted
                                                                ? "bg-primary/10 border-primary text-primary"
                                                                : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-500 line-through"
                                                        }`}
                                                    >
                                                        {item.accepted ? <Check className="h-3 w-3 inline mr-1" /> : <X className="h-3 w-3 inline mr-1" />}
                                                        {item.tech}
                                                    </button>
                                                ))}
                                            </div>
                                            <Button variant="outline" size="sm" onClick={applyTechStack}>
                                                <Check className="h-3.5 w-3.5 mr-1.5" />Apply Accepted Technologies
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Click "Extract Tech Stack" to identify technologies mentioned in the document.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
                    <Button
                        variant="outline"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>

                    <div className="flex items-center gap-3">
                        {currentStep === STEPS.length - 1 ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => handleSubmit("draft")}
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Save as Draft
                                </Button>
                                <Button
                                    onClick={() => handleSubmit("published")}
                                    disabled={createMutation.isPending}
                                >
                                    {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Publish
                                </Button>
                            </>
                        ) : (
                            <Button onClick={handleNext} disabled={!canProceed()}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
