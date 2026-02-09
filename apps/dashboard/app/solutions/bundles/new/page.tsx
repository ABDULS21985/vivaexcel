"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as z from "zod";
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
} from "@ktblog/ui/components";
import {
    Loader2,
    Plus,
    X,
    Search,
    Package,
    FileText,
    DollarSign,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Check,
} from "lucide-react";
import {
    useCreateBundle,
    useSolutionDocuments,
    type SolutionDocument,
    type CreateDocumentBundleDto,
} from "@/hooks/use-solution-documents";

// ─── Schema ─────────────────────────────────────────────────────────────────

const bundleSchema = z.object({
    name: z.string().min(1, "Bundle name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be 0 or greater"),
    compareAtPrice: z.number().optional(),
    currency: z.string().default("USD"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
});

function generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(price);
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function NewBundlePage() {
    const router = useRouter();
    const toast = useToast();
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedDocuments, setSelectedDocuments] = React.useState<SolutionDocument[]>([]);

    const [formData, setFormData] = React.useState({
        name: "",
        slug: "",
        description: "",
        featuredImageUrl: "",
        price: 0,
        compareAtPrice: undefined as number | undefined,
        currency: "USD",
        status: "draft" as "draft" | "published" | "archived",
    });

    // Search documents
    const { data: documentsData, isLoading: isLoadingDocs } = useSolutionDocuments(
        searchQuery ? { search: searchQuery, status: "published", limit: 20 } : { status: "published", limit: 20 }
    );
    const availableDocuments = (documentsData?.items ?? []).filter(
        (d) => !selectedDocuments.some((s) => s.id === d.id)
    );

    const createMutation = useCreateBundle();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "name" && !formData.slug) {
            setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
        }
        if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    };

    const addDocument = (doc: SolutionDocument) => {
        setSelectedDocuments((prev) => [...prev, doc]);
    };

    const removeDocument = (id: string) => {
        setSelectedDocuments((prev) => prev.filter((d) => d.id !== id));
    };

    const moveDocument = (index: number, direction: "up" | "down") => {
        setSelectedDocuments((prev) => {
            const items = [...prev];
            const newIndex = direction === "up" ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= items.length) return prev;
            [items[index], items[newIndex]] = [items[newIndex], items[index]];
            return items;
        });
    };

    const individualTotal = selectedDocuments.reduce((sum, d) => sum + d.price, 0);
    const savings = individualTotal > 0 && formData.price > 0 ? Math.round(((individualTotal - formData.price) / individualTotal) * 100) : 0;

    const handleSubmit = () => {
        const result = bundleSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => { newErrors[issue.path[0] as string] = issue.message; });
            setErrors(newErrors);
            toast.error("Validation error", "Please fix the errors.");
            return;
        }
        if (selectedDocuments.length === 0) {
            toast.error("No documents", "Add at least one document to the bundle.");
            return;
        }

        const data: CreateDocumentBundleDto = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            featuredImageUrl: formData.featuredImageUrl || undefined,
            price: formData.price,
            compareAtPrice: formData.compareAtPrice,
            currency: formData.currency,
            status: formData.status,
            documentIds: selectedDocuments.map((d) => d.id),
        };

        createMutation.mutate(data, {
            onSuccess: (bundle) => {
                toast.success("Bundle created", `"${bundle.name}" has been created.`);
                router.push("/solutions/bundles");
            },
            onError: (err) => toast.error("Error", err.message || "Failed to create bundle."),
        });
    };

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Create Bundle"
                description="Group solution documents together at a discounted price"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Solutions", href: "/solutions" },
                    { label: "Bundles", href: "/solutions/bundles" },
                    { label: "New Bundle" },
                ]}
                backHref="/solutions/bundles"
                backLabel="Back to Bundles"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Bundle Details */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Bundle Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bundle Name *</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Complete SaaS Architecture Bundle" />
                            {errors.name && <p className="text-sm font-medium text-red-500">{errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} />
                            {errors.slug && <p className="text-sm font-medium text-red-500">{errors.slug}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea name="description" className="h-24" value={formData.description} onChange={handleChange} placeholder="Describe what's included in this bundle..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Featured Image URL</Label>
                        <Input name="featuredImageUrl" value={formData.featuredImageUrl} onChange={handleChange} placeholder="https://..." />
                    </div>
                </div>

                {/* Document Selector */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Documents ({selectedDocuments.length})</h3>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input placeholder="Search documents to add..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    {/* Available Documents */}
                    {searchQuery && (
                        <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg divide-y divide-zinc-200 dark:divide-zinc-700">
                            {isLoadingDocs ? (
                                <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 text-primary animate-spin" /></div>
                            ) : availableDocuments.length > 0 ? (
                                availableDocuments.map((doc) => (
                                    <button key={doc.id} onClick={() => addDocument(doc)} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors text-left">
                                        <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{doc.title}</p>
                                            <p className="text-xs text-zinc-500">{doc.pageCount} pages</p>
                                        </div>
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatPrice(doc.price, doc.currency)}</span>
                                        <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 text-center py-4">No documents found.</p>
                            )}
                        </div>
                    )}

                    {/* Selected Documents */}
                    {selectedDocuments.length > 0 ? (
                        <div className="space-y-2">
                            {selectedDocuments.map((doc, index) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg group">
                                    <GripVertical className="h-4 w-4 text-zinc-400 flex-shrink-0 cursor-grab" />
                                    <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{doc.title}</p>
                                        <p className="text-xs text-zinc-500">{doc.pageCount} pages</p>
                                    </div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatPrice(doc.price, doc.currency)}</span>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => moveDocument(index, "up")} disabled={index === 0} className="p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                                        <button onClick={() => moveDocument(index, "down")} disabled={index === selectedDocuments.length - 1} className="p-0.5 text-zinc-400 hover:text-zinc-700 disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
                                        <button onClick={() => removeDocument(doc.id)} className="p-0.5 text-zinc-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500">
                            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No documents added yet. Search above to add documents.</p>
                        </div>
                    )}
                </div>

                {/* Pricing */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Pricing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Bundle Price *</Label>
                            <Input type="number" min={0} step={0.01} value={formData.price || ""} onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Compare At Price</Label>
                            <Input type="number" min={0} step={0.01} value={formData.compareAtPrice || ""} onChange={(e) => setFormData((prev) => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || undefined }))} />
                        </div>
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={formData.currency} onValueChange={(v) => setFormData((prev) => ({ ...prev, currency: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD</SelectItem>
                                    <SelectItem value="EUR">EUR</SelectItem>
                                    <SelectItem value="GBP">GBP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Price comparison */}
                    {selectedDocuments.length > 0 && (
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-zinc-600 dark:text-zinc-400">Individual total:</span>
                                <span className="font-medium text-zinc-900 dark:text-white">{formatPrice(individualTotal, formData.currency)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm mt-1">
                                <span className="text-zinc-600 dark:text-zinc-400">Bundle price:</span>
                                <span className="font-bold text-zinc-900 dark:text-white">{formatPrice(formData.price, formData.currency)}</span>
                            </div>
                            {savings > 0 && (
                                <div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                                    <span className="text-zinc-600 dark:text-zinc-400">Savings:</span>
                                    <span className="font-bold text-green-600 dark:text-green-400">{savings}% off</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => router.push("/solutions/bundles")}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Bundle
                    </Button>
                </div>
            </div>
        </div>
    );
}
