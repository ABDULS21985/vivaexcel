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
} from "@ktblog/ui/components";
import {
    Loader2,
    Plus,
    X,
    Search,
    Package,
    FileText,
    Trash,
    GripVertical,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
} from "lucide-react";
import {
    useDocumentBundle,
    useUpdateBundle,
    useDeleteBundle,
    useAddToBundle,
    useRemoveFromBundle,
    useSolutionDocuments,
    type UpdateDocumentBundleDto,
    type SolutionDocument,
} from "@/hooks/use-solution-documents";

const bundleSchema = z.object({
    name: z.string().min(1, "Bundle name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    price: z.number().min(0),
    compareAtPrice: z.number().optional(),
    currency: z.string().default("USD"),
    status: z.enum(["draft", "published", "archived"]),
});

function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "USD" }).format(price);
}

export default function EditBundlePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const toast = useToast();
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = React.useState("");

    const [formData, setFormData] = React.useState({
        name: "", slug: "", description: "", featuredImageUrl: "",
        price: 0, compareAtPrice: undefined as number | undefined,
        currency: "USD", status: "draft" as "draft" | "published" | "archived",
    });

    // Queries
    const { data: bundle, isLoading, error: fetchError } = useDocumentBundle(params.id);
    const { data: documentsData, isLoading: isLoadingDocs } = useSolutionDocuments(
        searchQuery ? { search: searchQuery, status: "published", limit: 20 } : { status: "published", limit: 20 }
    );

    const bundleDocuments = bundle?.documents ?? [];
    const availableDocuments = (documentsData?.items ?? []).filter(
        (d) => !bundleDocuments.some((bd) => bd.id === d.id)
    );

    // Mutations
    const updateMutation = useUpdateBundle();
    const deleteMutation = useDeleteBundle();
    const addToMutation = useAddToBundle();
    const removeFromMutation = useRemoveFromBundle();

    React.useEffect(() => {
        if (bundle) {
            setFormData({
                name: bundle.name || "",
                slug: bundle.slug || "",
                description: bundle.description || "",
                featuredImageUrl: bundle.featuredImageUrl || "",
                price: bundle.price || 0,
                compareAtPrice: bundle.compareAtPrice ?? undefined,
                currency: bundle.currency || "USD",
                status: bundle.status || "draft",
            });
        }
    }, [bundle]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    };

    const handleAddDocument = (doc: SolutionDocument) => {
        addToMutation.mutate({ bundleId: params.id, documentId: doc.id }, {
            onSuccess: () => toast.success("Added", `"${doc.title}" added to bundle.`),
            onError: () => toast.error("Error", "Failed to add document."),
        });
    };

    const handleRemoveDocument = (doc: SolutionDocument) => {
        removeFromMutation.mutate({ bundleId: params.id, documentId: doc.id }, {
            onSuccess: () => toast.success("Removed", `"${doc.title}" removed from bundle.`),
            onError: () => toast.error("Error", "Failed to remove document."),
        });
    };

    const handleTogglePublish = () => {
        const newStatus = formData.status === "published" ? "draft" : "published";
        updateMutation.mutate({ id: params.id, data: { status: newStatus } }, {
            onSuccess: () => { setFormData((prev) => ({ ...prev, status: newStatus })); toast.success(newStatus === "published" ? "Published" : "Unpublished", "Bundle status updated."); },
            onError: () => toast.error("Error", "Failed to update status."),
        });
    };

    const handleSave = () => {
        const result = bundleSchema.safeParse(formData);
        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.issues.forEach((issue) => { newErrors[issue.path[0] as string] = issue.message; });
            setErrors(newErrors);
            toast.error("Validation error", "Please fix the errors.");
            return;
        }

        const data: UpdateDocumentBundleDto = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            featuredImageUrl: formData.featuredImageUrl || undefined,
            price: formData.price,
            compareAtPrice: formData.compareAtPrice,
            currency: formData.currency,
            status: formData.status,
        };

        updateMutation.mutate({ id: params.id, data }, {
            onSuccess: () => toast.success("Saved", "Bundle updated successfully."),
            onError: (err) => toast.error("Error", err.message || "Failed to save."),
        });
    };

    const handleConfirmDelete = () => {
        deleteMutation.mutate(params.id, {
            onSuccess: () => { toast.success("Deleted", "Bundle has been deleted."); router.push("/solutions/bundles"); },
            onError: () => toast.error("Error", "Failed to delete bundle."),
        });
    };

    const individualTotal = bundleDocuments.reduce((sum, d) => sum + d.price, 0);
    const savings = individualTotal > 0 && formData.price > 0 ? Math.round(((individualTotal - formData.price) / individualTotal) * 100) : 0;

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <PageHeader title="Edit Bundle" description="Loading..." breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Bundles", href: "/solutions/bundles" }, { label: "Edit" }]} />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="flex flex-col items-center justify-center py-20"><Loader2 className="h-10 w-10 text-primary animate-spin mb-4" /><p className="text-zinc-500">Loading bundle data...</p></div></div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="min-h-screen">
                <PageHeader title="Edit Bundle" description="Failed to load" breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Bundles", href: "/solutions/bundles" }, { label: "Edit" }]} />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-20 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Failed to load bundle</h3>
                        <p className="text-zinc-500 mt-1">{fetchError.message}</p>
                        <button onClick={() => router.push("/solutions/bundles")} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">Back to Bundles</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Edit Bundle"
                description={`Editing "${bundle?.name ?? "Bundle"}"`}
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Solutions", href: "/solutions" }, { label: "Bundles", href: "/solutions/bundles" }, { label: "Edit" }]}
                backHref="/solutions/bundles"
                backLabel="Back to Bundles"
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

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                {/* Bundle Details */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Bundle Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2"><Label htmlFor="name">Bundle Name</Label><Input id="name" name="name" value={formData.name} onChange={handleChange} />{errors.name && <p className="text-sm font-medium text-red-500">{errors.name}</p>}</div>
                        <div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" name="slug" value={formData.slug} onChange={handleChange} />{errors.slug && <p className="text-sm font-medium text-red-500">{errors.slug}</p>}</div>
                    </div>
                    <div className="space-y-2"><Label>Description</Label><Textarea name="description" className="h-24" value={formData.description} onChange={handleChange} /></div>
                    <div className="space-y-2"><Label>Featured Image URL</Label><Input name="featuredImageUrl" value={formData.featuredImageUrl} onChange={handleChange} /></div>
                </div>

                {/* Documents */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Documents ({bundleDocuments.length})</h3>

                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input placeholder="Search documents to add..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    {searchQuery && (
                        <div className="max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded-lg divide-y divide-zinc-200 dark:divide-zinc-700">
                            {isLoadingDocs ? (
                                <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 text-primary animate-spin" /></div>
                            ) : availableDocuments.length > 0 ? (
                                availableDocuments.map((doc) => (
                                    <button key={doc.id} onClick={() => handleAddDocument(doc)} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 text-left">
                                        <FileText className="h-4 w-4 text-zinc-400" />
                                        <div className="flex-1 min-w-0"><p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{doc.title}</p></div>
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatPrice(doc.price, doc.currency)}</span>
                                        <Plus className="h-4 w-4 text-primary" />
                                    </button>
                                ))
                            ) : (
                                <p className="text-sm text-zinc-500 text-center py-4">No documents found.</p>
                            )}
                        </div>
                    )}

                    {bundleDocuments.length > 0 ? (
                        <div className="space-y-2">
                            {bundleDocuments.map((doc) => (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg group">
                                    <GripVertical className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    <FileText className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{doc.title}</p><p className="text-xs text-zinc-500">{doc.pageCount} pages</p></div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{formatPrice(doc.price, doc.currency)}</span>
                                    <button onClick={() => handleRemoveDocument(doc)} className="p-1 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500"><Package className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No documents in this bundle.</p></div>
                    )}
                </div>

                {/* Pricing */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6 space-y-4">
                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">Pricing</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2"><Label>Bundle Price</Label><Input type="number" min={0} step={0.01} value={formData.price || ""} onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} /></div>
                        <div className="space-y-2"><Label>Compare At Price</Label><Input type="number" min={0} step={0.01} value={formData.compareAtPrice || ""} onChange={(e) => setFormData((prev) => ({ ...prev, compareAtPrice: parseFloat(e.target.value) || undefined }))} /></div>
                        <div className="space-y-2"><Label>Currency</Label><Select value={formData.currency} onValueChange={(v) => setFormData((prev) => ({ ...prev, currency: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="EUR">EUR</SelectItem><SelectItem value="GBP">GBP</SelectItem></SelectContent></Select></div>
                    </div>
                    {bundleDocuments.length > 0 && (
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-center justify-between text-sm"><span className="text-zinc-600 dark:text-zinc-400">Individual total:</span><span className="font-medium text-zinc-900 dark:text-white">{formatPrice(individualTotal, formData.currency)}</span></div>
                            <div className="flex items-center justify-between text-sm mt-1"><span className="text-zinc-600 dark:text-zinc-400">Bundle price:</span><span className="font-bold text-zinc-900 dark:text-white">{formatPrice(formData.price, formData.currency)}</span></div>
                            {savings > 0 && (<div className="flex items-center justify-between text-sm mt-1 pt-2 border-t border-zinc-200 dark:border-zinc-700"><span className="text-zinc-600 dark:text-zinc-400">Savings:</span><span className="font-bold text-green-600 dark:text-green-400">{savings}% off</span></div>)}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => router.push("/solutions/bundles")}>Cancel</Button>
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>{updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save Changes</Button>
                </div>
            </div>

            <ConfirmModal open={isDeleteOpen} onOpenChange={setIsDeleteOpen} title="Delete Bundle" description="Are you sure you want to delete this bundle? The documents inside will not be deleted." onConfirm={handleConfirmDelete} isLoading={deleteMutation.isPending} variant="danger" />
        </div>
    );
}
