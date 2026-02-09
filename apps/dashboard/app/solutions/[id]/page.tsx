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
    Trash,
    Check,
    X,
    Plus,
    Sparkles,
    Brain,
    DollarSign,
    Globe,
    Layers,
    Eye,
    EyeOff,
    Download,
    Upload,
    FileText,
    BarChart3,
    Clock,
    TrendingUp,
    CalendarDays,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Tag,
    Gauge,
} from "lucide-react";
import {
    useSolutionDocument,
    useUpdateSolutionDocument,
    useDeleteSolutionDocument,
    useAnalyzeDocument,
    useGenerateDocumentDescription,
    useGenerateSeo,
    useGenerateToc,
    useExtractTechStack,
    useDocumentUpdates,
    usePublishUpdate,
    type DocumentType,
    type Domain,
    type MaturityLevel,
    type DiagramTool,
    type CloudPlatform,
    type ComplianceFramework,
    type TemplateFormat,
    type TOCItem,
    type UpdateSolutionDocumentDto,
} from "@/hooks/use-solution-documents";
import { useDigitalProducts } from "@/hooks/use-digital-products";

// ─── Constants ──────────────────────────────────────────────────────────────

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    architecture_design: "Architecture Design", system_design: "System Design",
    api_specification: "API Specification", database_design: "Database Design",
    infrastructure: "Infrastructure", security_design: "Security Design",
    integration_design: "Integration Design", migration_plan: "Migration Plan",
    disaster_recovery: "Disaster Recovery", network_design: "Network Design",
    data_flow: "Data Flow", other: "Other",
};

const DOMAIN_LABELS: Record<Domain, string> = {
    fintech: "Fintech", healthtech: "Healthtech", edtech: "Edtech",
    ecommerce: "E-Commerce", saas: "SaaS", iot: "IoT",
    ai_ml: "AI/ML", cybersecurity: "Cybersecurity",
    cloud_infrastructure: "Cloud Infra", devops: "DevOps",
    mobile: "Mobile", blockchain: "Blockchain", other: "Other",
};

const CLOUD_PLATFORMS: { value: CloudPlatform; label: string }[] = [
    { value: "aws", label: "AWS" }, { value: "azure", label: "Azure" },
    { value: "gcp", label: "GCP" }, { value: "multi_cloud", label: "Multi-Cloud" },
    { value: "on_premise", label: "On-Premise" },
];

const COMPLIANCE_FRAMEWORKS: { value: ComplianceFramework; label: string }[] = [
    { value: "soc2", label: "SOC2" }, { value: "hipaa", label: "HIPAA" },
    { value: "gdpr", label: "GDPR" }, { value: "iso27001", label: "ISO 27001" },
    { value: "pci_dss", label: "PCI-DSS" },
];

const TEMPLATE_FORMATS: { value: TemplateFormat; label: string }[] = [
    { value: "docx", label: "DOCX" }, { value: "pdf", label: "PDF" },
    { value: "notion", label: "Notion" }, { value: "confluence", label: "Confluence" },
    { value: "markdown", label: "Markdown" },
];

const DIAGRAM_TOOLS: { value: DiagramTool; label: string }[] = [
    { value: "draw_io", label: "Draw.io" }, { value: "lucidchart", label: "Lucidchart" },
    { value: "miro", label: "Miro" }, { value: "figma", label: "Figma" },
    { value: "visio", label: "Visio" }, { value: "plantuml", label: "PlantUML" },
    { value: "other", label: "Other" },
];

const documentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    shortDescription: z.string().max(200).optional(),
    documentType: z.string().min(1, "Document type is required"),
    domain: z.string().min(1, "Domain is required"),
    maturityLevel: z.enum(["starter", "intermediate", "enterprise"]),
    status: z.enum(["draft", "published", "archived"]),
    price: z.number().min(0),
    compareAtPrice: z.number().optional(),
    currency: z.string().default("USD"),
    cloudPlatforms: z.array(z.string()).optional(),
    technologyStack: z.array(z.string()).optional(),
    complianceFrameworks: z.array(z.string()).optional(),
    templateFormats: z.array(z.string()).optional(),
    hasEditableDiagrams: z.boolean(),
    diagramTool: z.string().optional(),
    includes: z.object({
        editableTemplates: z.boolean(),
        diagramFiles: z.boolean(),
        implementationChecklist: z.boolean(),
        costEstimator: z.boolean(),
    }).optional(),
    digitalProductId: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof documentSchema>;
type TabId = "details" | "toc" | "ai" | "versions" | "analytics";

// ─── Component ──────────────────────────────────────────────────────────────

export default function EditSolutionDocumentPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const toast = useToast();
    const [activeTab, setActiveTab] = React.useState<TabId>("details");
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [techInput, setTechInput] = React.useState("");
    const [tagInput, setTagInput] = React.useState("");
    const [keywordInput, setKeywordInput] = React.useState("");
    const [tocItems, setTocItems] = React.useState<TOCItem[]>([]);
    const [newTocTitle, setNewTocTitle] = React.useState("");
    const [newTocLevel, setNewTocLevel] = React.useState(1);
    const [aiDescription, setAiDescription] = React.useState("");
    const [aiSeo, setAiSeo] = React.useState<{ seoTitle: string; seoDescription: string; seoKeywords: string[] } | null>(null);
    const [aiTechStack, setAiTechStack] = React.useState<{ tech: string; accepted: boolean }[]>([]);
    const [updateVersion, setUpdateVersion] = React.useState("");
    const [updateNotes, setUpdateNotes] = React.useState("");

    const [formData, setFormData] = React.useState<FormValues>({
        title: "", slug: "", description: "", shortDescription: "",
        documentType: "", domain: "", maturityLevel: "intermediate",
        status: "draft", price: 0, compareAtPrice: undefined, currency: "USD",
        cloudPlatforms: [], technologyStack: [], complianceFrameworks: [],
        templateFormats: [], hasEditableDiagrams: false, diagramTool: "",
        includes: { editableTemplates: false, diagramFiles: false, implementationChecklist: false, costEstimator: false },
        digitalProductId: "", seoTitle: "", seoDescription: "", seoKeywords: [], tags: [],
    });

    // Queries
    const { data: document, isLoading: isLoadingDocument, error: fetchError } = useSolutionDocument(params.id);
    const { data: updatesData } = useDocumentUpdates(params.id);
    const updates = updatesData?.items ?? [];
    const { data: digitalProductsData } = useDigitalProducts({});
    const digitalProducts = digitalProductsData?.items ?? [];

    // Mutations
    const updateMutation = useUpdateSolutionDocument();
    const deleteMutation = useDeleteSolutionDocument();
    const analyzeMutation = useAnalyzeDocument();
    const generateDescMutation = useGenerateDocumentDescription();
    const generateSeoMutation = useGenerateSeo();
    const generateTocMutation = useGenerateToc();
    const extractTechMutation = useExtractTechStack();
    const publishUpdateMutation = usePublishUpdate();

    // Populate form when data loads
    React.useEffect(() => {
        if (document) {
            setFormData({
                title: document.title || "",
                slug: document.slug || "",
                description: document.description || "",
                shortDescription: document.shortDescription || "",
                documentType: document.documentType || "",
                domain: document.domain || "",
                maturityLevel: document.maturityLevel || "intermediate",
                status: document.status || "draft",
                price: document.price || 0,
                compareAtPrice: document.compareAtPrice ?? undefined,
                currency: document.currency || "USD",
                cloudPlatforms: document.cloudPlatforms || [],
                technologyStack: document.technologyStack || [],
                complianceFrameworks: document.complianceFrameworks || [],
                templateFormats: document.templateFormats || [],
                hasEditableDiagrams: document.hasEditableDiagrams ?? false,
                diagramTool: document.diagramTool || "",
                includes: document.includes || { editableTemplates: false, diagramFiles: false, implementationChecklist: false, costEstimator: false },
                digitalProductId: document.digitalProductId || "",
                seoTitle: document.seoTitle || "",
                seoDescription: document.seoDescription || "",
                seoKeywords: document.seoKeywords || [],
                tags: document.tags?.map((t) => t.name) || [],
            });
            setTocItems(document.tableOfContents || []);
            if (document.aiDescription) setAiDescription(document.aiDescription);
        }
    }, [document]);

    // ─── Handlers ───────────────────────────────────────────────────────────

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    };

    const handleSelectChange = (name: keyof FormValues, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    };

    const handleSwitchChange = (name: string, checked: boolean) => {
        if (name.startsWith("includes.")) {
            const key = name.split(".")[1] as keyof NonNullable<FormValues["includes"]>;
            setFormData((prev) => ({ ...prev, includes: { ...prev.includes!, [key]: checked } }));
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
            setFormData((prev) => ({ ...prev, technologyStack: [...(prev.technologyStack || []), techInput.trim()] }));
            setTechInput("");
        }
    };

    const removeTechStack = (tech: string) => {
        setFormData((prev) => ({ ...prev, technologyStack: (prev.technologyStack || []).filter((t) => t !== tech) }));
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

    const addKeyword = () => {
        if (keywordInput.trim()) {
            setFormData((prev) => ({ ...prev, seoKeywords: [...(prev.seoKeywords || []), keywordInput.trim()] }));
            setKeywordInput("");
        }
    };

    const removeKeyword = (kw: string) => {
        setFormData((prev) => ({ ...prev, seoKeywords: (prev.seoKeywords || []).filter((k) => k !== kw) }));
    };

    // TOC
    const addTocItem = () => {
        if (newTocTitle.trim()) {
            setTocItems((prev) => [...prev, { id: `toc-${Date.now()}`, title: newTocTitle.trim(), level: newTocLevel, sortOrder: prev.length }]);
            setNewTocTitle("");
        }
    };

    const removeTocItem = (id: string) => setTocItems((prev) => prev.filter((item) => item.id !== id));

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

    // AI
    const handleAnalyze = () => {
        analyzeMutation.mutate(params.id, {
            onSuccess: (doc) => {
                if (doc.aiDescription) setAiDescription(doc.aiDescription);
                if (doc.seoTitle || doc.seoDescription) setAiSeo({ seoTitle: doc.seoTitle || "", seoDescription: doc.seoDescription || "", seoKeywords: doc.seoKeywords || [] });
                toast.success("Analysis complete", "AI analysis has finished.");
            },
            onError: () => toast.error("Error", "Failed to run AI analysis."),
        });
    };

    const handleGenerateDescription = () => {
        generateDescMutation.mutate(params.id, {
            onSuccess: (data) => { setAiDescription(data.description); toast.success("Generated", "AI description generated."); },
            onError: () => toast.error("Error", "Failed to generate description."),
        });
    };

    const handleGenerateSeo = () => {
        generateSeoMutation.mutate(params.id, {
            onSuccess: (data) => { setAiSeo(data); toast.success("Generated", "SEO metadata generated."); },
            onError: () => toast.error("Error", "Failed to generate SEO."),
        });
    };

    const handleGenerateToc = () => {
        generateTocMutation.mutate(params.id, {
            onSuccess: (data) => { setTocItems(data.tableOfContents); toast.success("Generated", "TOC generated from document."); },
            onError: () => toast.error("Error", "Failed to generate TOC."),
        });
    };

    const handleExtractTech = () => {
        extractTechMutation.mutate(params.id, {
            onSuccess: (data) => { setAiTechStack(data.technologyStack.map((t) => ({ tech: t, accepted: true }))); toast.success("Extracted", "Tech stack extracted."); },
            onError: () => toast.error("Error", "Failed to extract tech stack."),
        });
    };

    const applyAiDescription = () => { setFormData((prev) => ({ ...prev, description: aiDescription })); toast.success("Applied", "AI description applied."); };

    const applyAiSeo = () => {
        if (aiSeo) {
            setFormData((prev) => ({ ...prev, seoTitle: aiSeo.seoTitle, seoDescription: aiSeo.seoDescription, seoKeywords: aiSeo.seoKeywords }));
            toast.success("Applied", "SEO metadata applied.");
        }
    };

    const applyTechStack = () => {
        const accepted = aiTechStack.filter((t) => t.accepted).map((t) => t.tech);
        setFormData((prev) => ({ ...prev, technologyStack: Array.from(new Set([...(prev.technologyStack || []), ...accepted])) }));
        toast.success("Applied", `${accepted.length} technologies added.`);
    };

    // Version updates
    const handlePublishUpdate = () => {
        if (!updateVersion.trim()) { toast.error("Error", "Version is required."); return; }
        publishUpdateMutation.mutate(
            { documentId: params.id, data: { version: updateVersion, releaseNotes: updateNotes } },
            {
                onSuccess: () => { toast.success("Published", "Version update published."); setUpdateVersion(""); setUpdateNotes(""); },
                onError: () => toast.error("Error", "Failed to publish update."),
            }
        );
    };

    // Status toggle
    const handleTogglePublish = () => {
        const newStatus = formData.status === "published" ? "draft" : "published";
        updateMutation.mutate(
            { id: params.id, data: { status: newStatus } as UpdateSolutionDocumentDto },
            {
                onSuccess: () => { setFormData((prev) => ({ ...prev, status: newStatus })); toast.success(newStatus === "published" ? "Published" : "Unpublished", `Document has been ${newStatus}.`); },
                onError: () => toast.error("Error", "Failed to update status."),
            }
        );
    };

    // Save
    const validate = (): boolean => {
        const result = documentSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => { newErrors[issue.path[0] as string] = issue.message; });
            setErrors(newErrors);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSave = () => {
        if (!validate()) { toast.error("Validation error", "Please fix the errors."); setActiveTab("details"); return; }
        const data: UpdateSolutionDocumentDto = {
            ...formData as unknown as UpdateSolutionDocumentDto,
            documentType: formData.documentType as DocumentType,
            domain: formData.domain as Domain,
            maturityLevel: formData.maturityLevel as MaturityLevel,
            diagramTool: formData.hasEditableDiagrams && formData.diagramTool ? (formData.diagramTool as DiagramTool) : undefined,
            tableOfContents: tocItems,
        };
        updateMutation.mutate({ id: params.id, data }, {
            onSuccess: () => toast.success("Saved", "Solution document updated successfully."),
            onError: (err) => toast.error("Error", err.message || "Failed to save."),
        });
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(params.id, {
            onSuccess: () => { toast.success("Deleted", "Solution document has been deleted."); router.push("/solutions"); },
            onError: () => toast.error("Error", "Failed to delete document."),
        });
    };

    // Loading / Error
    if (isLoadingDocument) {
        return (
            <div className="min-h-screen">
                <PageHeader title="Edit Solution Document" description="Loading..." breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Edit" }]} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                        <p className="text-zinc-500 dark:text-zinc-400">Loading document data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen">
                <PageHeader title="Edit Solution Document" description="Failed to load" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Edit" }]} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load document</h3>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">{fetchError.message || "An error occurred."}</p>
                        <button onClick={() => router.push("/solutions")} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Back to Solutions</button>
                    </div>
                </div>
            </div>
        );
    }

    const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
        { id: "details", label: "Details", icon: <FileText className="h-4 w-4" /> },
        { id: "toc", label: "Table of Contents", icon: <Layers className="h-4 w-4" /> },
        { id: "ai", label: "AI Analysis", icon: <Brain className="h-4 w-4" /> },
        { id: "versions", label: "Versions", icon: <Upload className="h-4 w-4" /> },
        { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
    ];

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Solution Document"
                description={`Editing "${document?.title ?? "Document"}"`}
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Edit" }]}
                backHref="/solutions"
                backLabel="Back to Solutions"
                actions={
                    <div className="flex items-center gap-3">
                        <Button variant="outline" onClick={handleTogglePublish} disabled={updateMutation.isPending}>
                            {formData.status === "published" ? <><EyeOff className="h-4 w-4 mr-2" />Unpublish</> : <><Eye className="h-4 w-4 mr-2" />Publish</>}
                        </Button>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20" onClick={() => setIsDeleteOpen(true)}>
                            <Trash className="h-4 w-4 mr-2" />Delete
                        </Button>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Tabs */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-1 flex items-center gap-1 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? "bg-primary text-white" : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"}`}>
                            {tab.icon}{tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Details Tab ──────────────────────────────────────── */}
                {activeTab === "details" && (
                    <div className="space-y-6">
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
                                <Label>Short Description</Label>
                                <Input name="shortDescription" value={formData.shortDescription || ""} onChange={handleChange} maxLength={200} />
                                <p className="text-xs text-zinc-400">{(formData.shortDescription || "").length}/200</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Full Description</Label>
                                <Textarea name="description" className="h-32" value={formData.description || ""} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label>Digital Product</Label>
                                <Select value={formData.digitalProductId || ""} onValueChange={(v) => handleSelectChange("digitalProductId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Link to digital product..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">None</SelectItem>
                                        {digitalProducts.map((dp) => (<SelectItem key={dp.id} value={dp.id}>{dp.title}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Classification</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Document Type</Label>
                                    <Select value={formData.documentType} onValueChange={(v) => handleSelectChange("documentType", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                        <SelectContent>{Object.entries(DOCUMENT_TYPE_LABELS).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}</SelectContent>
                                    </Select>
                                    {errors.documentType && <p className="text-sm font-medium text-red-500">{errors.documentType}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Domain</Label>
                                    <Select value={formData.domain} onValueChange={(v) => handleSelectChange("domain", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select domain..." /></SelectTrigger>
                                        <SelectContent>{Object.entries(DOMAIN_LABELS).map(([k, l]) => (<SelectItem key={k} value={k}>{l}</SelectItem>))}</SelectContent>
                                    </Select>
                                    {errors.domain && <p className="text-sm font-medium text-red-500">{errors.domain}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Maturity Level</Label>
                                    <Select value={formData.maturityLevel} onValueChange={(v) => handleSelectChange("maturityLevel", v)}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="starter">Starter</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Pricing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2"><Label>Price</Label><Input type="number" min={0} step={0.01} value={formData.price || ""} onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} /></div>
                                <div className="space-y-2"><Label>Compare At Price</Label><Input type="number" min={0} step={0.01} value={formData.compareAtPrice || ""} onChange={(e) => setFormData((prev) => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || undefined }))} /></div>
                                <div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={(v) => handleSelectChange("currency", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem></SelectContent></Select></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Cloud Platforms & Compliance</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {CLOUD_PLATFORMS.map((cp) => (<label key={cp.value} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={(formData.cloudPlatforms || []).includes(cp.value)} onChange={() => handleArrayToggle("cloudPlatforms", cp.value)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" /><span className="text-sm text-zinc-700 dark:text-zinc-300">{cp.label}</span></label>))}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                {COMPLIANCE_FRAMEWORKS.map((cf) => (<label key={cf.value} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={(formData.complianceFrameworks || []).includes(cf.value)} onChange={() => handleArrayToggle("complianceFrameworks", cf.value)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" /><span className="text-sm text-zinc-700 dark:text-zinc-300">{cf.label}</span></label>))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Template Formats</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {TEMPLATE_FORMATS.map((tf) => (<label key={tf.value} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={(formData.templateFormats || []).includes(tf.value)} onChange={() => handleArrayToggle("templateFormats", tf.value)} className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-primary focus:ring-primary" /><span className="text-sm text-zinc-700 dark:text-zinc-300">{tf.label}</span></label>))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Technology Stack</h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(formData.technologyStack || []).map((tech) => (<span key={tech} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full">{tech}<button type="button" onClick={() => removeTechStack(tech)} className="ml-0.5 text-zinc-400 hover:text-red-500"><X className="h-3 w-3" /></button></span>))}
                            </div>
                            <div className="flex items-center gap-2">
                                <Input placeholder="Add technology..." value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTechStack(); } }} className="flex-1" />
                                <Button type="button" variant="outline" onClick={addTechStack}><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Features</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {([
                                    { key: "hasEditableDiagrams", label: "Editable Diagrams", desc: "Includes editable diagram files" },
                                    { key: "includes.editableTemplates", label: "Editable Templates", desc: "Includes editable template files" },
                                    { key: "includes.diagramFiles", label: "Diagram Source Files", desc: "Includes diagram source files" },
                                    { key: "includes.implementationChecklist", label: "Implementation Checklist", desc: "Step-by-step checklist" },
                                    { key: "includes.costEstimator", label: "Cost Estimator", desc: "Includes cost estimation" },
                                ] as const).map((feature) => {
                                    const checked = feature.key.startsWith("includes.") ? (formData.includes as unknown as Record<string, boolean>)?.[feature.key.split(".")[1]] ?? false : (formData as unknown as Record<string, boolean>)[feature.key] ?? false;
                                    return (
                                        <div key={feature.key} className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                            <div className="space-y-0.5"><Label className="text-sm font-medium">{feature.label}</Label><p className="text-xs text-zinc-500 dark:text-zinc-400">{feature.desc}</p></div>
                                            <Switch checked={checked} onCheckedChange={(c: boolean) => handleSwitchChange(feature.key, c)} />
                                        </div>
                                    );
                                })}
                            </div>
                            {formData.hasEditableDiagrams && (
                                <div className="space-y-2 pt-2">
                                    <Label>Diagram Tool</Label>
                                    <Select value={formData.diagramTool || ""} onValueChange={(v) => handleSelectChange("diagramTool", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select tool..." /></SelectTrigger>
                                        <SelectContent>{DIAGRAM_TOOLS.map((dt) => (<SelectItem key={dt.value} value={dt.value}>{dt.label}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white flex items-center gap-2"><Globe className="h-5 w-5" />SEO & Tags</h3>
                            <div className="space-y-2"><Label>SEO Title</Label><Input name="seoTitle" value={formData.seoTitle || ""} onChange={handleChange} /></div>
                            <div className="space-y-2"><Label>SEO Description</Label><Textarea name="seoDescription" className="h-20" value={formData.seoDescription || ""} onChange={handleChange} /></div>
                            <div className="space-y-2">
                                <Label>SEO Keywords</Label>
                                <div className="flex flex-wrap gap-2 mb-2">{(formData.seoKeywords || []).map((kw) => (<span key={kw} className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-full">{kw}<button type="button" onClick={() => removeKeyword(kw)}><X className="h-3 w-3" /></button></span>))}</div>
                                <div className="flex items-center gap-2"><Input placeholder="Add keyword..." value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }} className="flex-1" /><Button type="button" variant="outline" size="sm" onClick={addKeyword}><Plus className="h-4 w-4" /></Button></div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2 mb-2">{(formData.tags || []).map((tag) => (<span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm bg-primary/10 text-primary rounded-full">{tag}<button type="button" onClick={() => removeTag(tag)}><X className="h-3 w-3" /></button></span>))}</div>
                                <div className="flex items-center gap-2"><Input placeholder="Add tag..." value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} className="flex-1" /><Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="h-4 w-4" /></Button></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={() => router.push("/solutions")}>Cancel</Button>
                            <Button onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Changes</Button>
                        </div>
                    </div>
                )}

                {/* ─── TOC Tab ─────────────────────────────────────────── */}
                {activeTab === "toc" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Table of Contents</h3>
                                <Button variant="outline" size="sm" onClick={handleGenerateToc} disabled={generateTocMutation.isPending}>
                                    {generateTocMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}Generate with AI
                                </Button>
                            </div>
                            <div className="flex items-end gap-2">
                                <div className="flex-1 space-y-1.5"><Label className="text-xs">Title</Label><Input value={newTocTitle} onChange={(e) => setNewTocTitle(e.target.value)} placeholder="Section title..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTocItem(); } }} /></div>
                                <div className="w-24 space-y-1.5"><Label className="text-xs">Level</Label><Select value={String(newTocLevel)} onValueChange={(v) => setNewTocLevel(Number(v))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">H1</SelectItem><SelectItem value="2">H2</SelectItem><SelectItem value="3">H3</SelectItem><SelectItem value="4">H4</SelectItem></SelectContent></Select></div>
                                <Button type="button" variant="outline" onClick={addTocItem} disabled={!newTocTitle.trim()}><Plus className="h-4 w-4" /></Button>
                            </div>
                            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                                {tocItems.map((item, index) => (
                                    <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 group" style={{ paddingLeft: `${(item.level - 1) * 20 + 8}px` }}>
                                        <GripVertical className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <input className="flex-1 text-sm bg-transparent border-none outline-none text-zinc-700 dark:text-zinc-300" value={item.title} onChange={(e) => updateTocItem(item.id, "title", e.target.value)} />
                                        <span className="text-[10px] font-medium text-zinc-400">H{item.level}</span>
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveTocItem(index, "up")} disabled={index === 0} className="p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                                            <button onClick={() => moveTocItem(index, "down")} disabled={index === tocItems.length - 1} className="p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                                            <button onClick={() => removeTocItem(item.id)} className="p-0.5 text-zinc-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full">{updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save TOC Changes</Button>
                        </div>
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Preview</h3>
                            <div className="space-y-1.5">{tocItems.map((item) => (<div key={item.id} style={{ paddingLeft: `${(item.level - 1) * 16}px` }}><p className={`text-zinc-700 dark:text-zinc-300 ${item.level === 1 ? "text-base font-bold" : item.level === 2 ? "text-sm font-semibold" : item.level === 3 ? "text-sm font-medium" : "text-xs"}`}>{item.title}</p></div>))}</div>
                        </div>
                    </div>
                )}

                {/* ─── AI Tab ──────────────────────────────────────────── */}
                {activeTab === "ai" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-purple-200 dark:border-purple-800 p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-purple-500" /><h3 className="font-semibold text-lg text-zinc-900 dark:text-white">AI Analysis</h3></div>
                                {document?.aiAnalyzedAt && (<span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="h-3 w-3" />Last: {new Date(document.aiAnalyzedAt).toLocaleString()}</span>)}
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center justify-between">
                                    <div><p className="font-medium text-purple-900 dark:text-purple-200">Run Full AI Analysis</p><p className="text-sm text-purple-600 dark:text-purple-400">Analyze to update description, SEO, and tech stack.</p></div>
                                    <Button onClick={handleAnalyze} disabled={analyzeMutation.isPending} className="bg-purple-600 hover:bg-purple-700 text-white">{analyzeMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}Re-Analyze</Button>
                                </div>
                            </div>
                            {document?.freshnessScore != null && (<div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center gap-2"><Gauge className="h-4 w-4 text-zinc-400" /><span className="text-sm text-zinc-600 dark:text-zinc-400">Freshness:</span><span className={`text-sm font-bold ${document.freshnessScore >= 80 ? "text-green-600" : document.freshnessScore >= 50 ? "text-amber-600" : "text-red-600"}`}>{document.freshnessScore}%</span></div>)}

                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><Label>AI Description</Label><Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={generateDescMutation.isPending}>{generateDescMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}Regenerate</Button></div>
                                {aiDescription && (<div className="space-y-2"><Textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} className="h-32" /><Button variant="outline" size="sm" onClick={applyAiDescription}><Check className="h-3.5 w-3.5 mr-1.5" />Apply</Button></div>)}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><Label>SEO Metadata</Label><Button variant="outline" size="sm" onClick={handleGenerateSeo} disabled={generateSeoMutation.isPending}>{generateSeoMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}Generate SEO</Button></div>
                                {aiSeo && (<div className="space-y-2 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg"><Input value={aiSeo.seoTitle} onChange={(e) => setAiSeo({ ...aiSeo, seoTitle: e.target.value })} /><Textarea value={aiSeo.seoDescription} onChange={(e) => setAiSeo({ ...aiSeo, seoDescription: e.target.value })} className="h-16" /><div className="flex flex-wrap gap-1">{aiSeo.seoKeywords.map((kw, i) => (<span key={i} className="px-2 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 rounded-full">{kw}</span>))}</div><Button variant="outline" size="sm" onClick={applyAiSeo}><Check className="h-3.5 w-3.5 mr-1.5" />Apply SEO</Button></div>)}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between"><Label>Tech Stack Suggestions</Label><Button variant="outline" size="sm" onClick={handleExtractTech} disabled={extractTechMutation.isPending}>{extractTechMutation.isPending ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}Extract</Button></div>
                                {aiTechStack.length > 0 && (<div className="space-y-2"><div className="flex flex-wrap gap-2">{aiTechStack.map((item, i) => (<button key={i} type="button" onClick={() => setAiTechStack((prev) => prev.map((t, idx) => idx === i ? { ...t, accepted: !t.accepted } : t))} className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${item.accepted ? "bg-primary/10 border-primary text-primary" : "bg-zinc-100 dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 text-zinc-500 line-through"}`}>{item.accepted ? <Check className="h-3 w-3 inline mr-1" /> : <X className="h-3 w-3 inline mr-1" />}{item.tech}</button>))}</div><Button variant="outline" size="sm" onClick={applyTechStack}><Tag className="h-3.5 w-3.5 mr-1.5" />Apply</Button></div>)}
                            </div>
                        </div>
                    </div>
                )}

                {/* ─── Versions Tab ──────────────────────────────────── */}
                {activeTab === "versions" && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Publish New Version</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Version *</Label><Input placeholder="e.g., 2.0.0" value={updateVersion} onChange={(e) => setUpdateVersion(e.target.value)} /></div>
                            </div>
                            <div className="space-y-2"><Label>Release Notes</Label><Textarea placeholder="What changed in this version..." className="h-24" value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} /></div>
                            <Button onClick={handlePublishUpdate} disabled={publishUpdateMutation.isPending || !updateVersion.trim()}>{publishUpdateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Publish Update</Button>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Version History</h3>
                            {updates.length > 0 ? (
                                <div className="space-y-3">
                                    {updates.map((update) => (
                                        <div key={update.id} className="flex items-start gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Upload className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-zinc-900 dark:text-white">v{update.version}</span>
                                                    {update.createdAt && <span className="text-xs text-zinc-500">{new Date(update.createdAt).toLocaleDateString()}</span>}
                                                </div>
                                                {update.releaseNotes && <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{update.releaseNotes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500"><Upload className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No version updates yet.</p></div>
                            )}
                        </div>
                    </div>
                )}

                {/* ─── Analytics Tab ─────────────────────────────────── */}
                {activeTab === "analytics" && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div><div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{(document?.viewCount ?? 0).toLocaleString()}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Views</p></div></div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"><Download className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div><div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{(document?.downloadCount ?? 0).toLocaleString()}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Downloads</p></div></div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" /></div><div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{new Intl.NumberFormat("en-US", { style: "currency", currency: document?.currency || "USD" }).format((document?.price ?? 0) * (document?.downloadCount ?? 0))}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Est. Revenue</p></div></div>
                            </div>
                            <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-5">
                                <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" /></div><div><p className="text-2xl font-bold text-zinc-900 dark:text-white">{document?.viewCount && document.downloadCount ? `${((document.downloadCount / document.viewCount) * 100).toFixed(1)}%` : "0%"}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">Conversion Rate</p></div></div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                            <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Timeline</h3>
                            <div className="space-y-3">
                                {document?.createdAt && (<div className="flex items-center gap-3 text-sm"><CalendarDays className="h-4 w-4 text-zinc-400" /><span className="text-zinc-600 dark:text-zinc-400">Created:</span><span className="font-medium text-zinc-900 dark:text-white">{new Date(document.createdAt).toLocaleString()}</span></div>)}
                                {document?.updatedAt && (<div className="flex items-center gap-3 text-sm"><Clock className="h-4 w-4 text-zinc-400" /><span className="text-zinc-600 dark:text-zinc-400">Updated:</span><span className="font-medium text-zinc-900 dark:text-white">{new Date(document.updatedAt).toLocaleString()}</span></div>)}
                                {document?.publishedAt && (<div className="flex items-center gap-3 text-sm"><Eye className="h-4 w-4 text-zinc-400" /><span className="text-zinc-600 dark:text-zinc-400">Published:</span><span className="font-medium text-zinc-900 dark:text-white">{new Date(document.publishedAt).toLocaleString()}</span></div>)}
                                {document?.aiAnalyzedAt && (<div className="flex items-center gap-3 text-sm"><Brain className="h-4 w-4 text-zinc-400" /><span className="text-zinc-600 dark:text-zinc-400">AI Analyzed:</span><span className="font-medium text-zinc-900 dark:text-white">{new Date(document.aiAnalyzedAt).toLocaleString()}</span></div>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal open={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Delete Solution Document" description="Are you sure you want to delete this solution document? This action cannot be undone." onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} variant="danger" />
        </div>
    );
}
