"use client";

import * as React from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, HelpCircle, GripVertical } from "lucide-react";
import {
    Button,
    Input,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Badge,
    Checkbox,
    Label,
    Textarea
} from "@digibit/ui/components";
import { PageHeader } from "@/components/page-header";
import { FormModal, ConfirmModal } from "@/components/modal";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/toast";


interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
    isActive: boolean;
    createdAt: string;
}

export default function FAQPage() {
    const { success: toastSuccess, error: toastError } = useToast();
    const [faqs, setFaqs] = React.useState<FAQ[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Modal states
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [editingFaq, setEditingFaq] = React.useState<FAQ | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isActive, setIsActive] = React.useState(true);

    const fetchFaqs = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<{ data: FAQ[] }>("/faqs");
            setFaqs(response.data || []);
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
            toastError("Failed to load FAQs");
        } finally {
            setIsLoading(false);
        }
    }, [toastError]);

    React.useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setEditingFaq(null);
        setIsActive(true);
        setIsFormOpen(true);
    };

    const handleEdit = (faq: FAQ) => {
        setEditingFaq(faq);
        setIsActive(faq.isActive);
        setIsFormOpen(true);
    };

    const handleDelete = (faq: FAQ) => {
        setEditingFaq(faq);
        setIsDeleteOpen(true);
    };

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fData = new FormData(e.currentTarget);
        const data = {
            question: fData.get("question") as string,
            answer: fData.get("answer") as string,
            order: parseInt(fData.get("order") as string) || 0,
            isActive: isActive,
        };

        setIsSubmitting(true);
        try {
            if (editingFaq) {
                await apiClient.patch(`/faqs/${editingFaq.id}`, data);
                toastSuccess("FAQ updated successfully");
            } else {
                await apiClient.post("/faqs", data);
                toastSuccess("FAQ created successfully");
            }
            setIsFormOpen(false);
            fetchFaqs();
        } catch (error) {
            console.error("Form submission failed:", error);
            toastError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!editingFaq) return;
        setIsSubmitting(true);
        try {
            await apiClient.delete(`/faqs/${editingFaq.id}`);
            toastSuccess("FAQ deleted successfully");
            setIsDeleteOpen(false);
            fetchFaqs();
        } catch (error) {
            console.error("Delete failed:", error);
            toastError("Failed to delete FAQ");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="FAQs"
                description="Manage frequently asked questions for your customer support"
                actions={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        New FAQ
                    </Button>
                }
            />

            <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/20">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-[#1e4db7] transition-colors" />
                    <Input
                        placeholder="Search frequently asked questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-zinc-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-zinc-50 animate-pulse border border-zinc-100" />
                    ))}
                </div>
            ) : filteredFaqs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFaqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="group relative bg-white border border-zinc-200/60 rounded-2xl p-6 hover:shadow-2xl hover:shadow-[#1e3a8a]/10 hover:border-[#1e3a8a]/20 transition-all duration-300 flex flex-col h-full overflow-hidden"
                        >
                            {/* Accent line on top */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1e4db7] to-[#5a85e6] opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-blue-50 text-[#1e4db7]">
                                    <HelpCircle className="h-5 w-5" />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-100 rounded-full">
                                            <MoreVertical className="h-4 w-4 text-zinc-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl border-zinc-200">
                                        <DropdownMenuItem onClick={() => handleEdit(faq)} className="rounded-lg">
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-600 rounded-lg" onClick={() => handleDelete(faq)}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            <h3 className="text-lg font-bold text-zinc-900 mb-2 line-clamp-2 leading-snug group-hover:text-[#1e4db7] transition-colors">
                                {faq.question}
                            </h3>
                            <p className="text-sm text-zinc-500 mb-6 line-clamp-4 flex-grow leading-relaxed">
                                {faq.answer}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50">
                                <Badge variant={faq.isActive ? "default" : "secondary"} className={cn(
                                    faq.isActive
                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none px-3"
                                        : "bg-zinc-100 text-zinc-500 border-none shadow-none px-3"
                                )}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", faq.isActive ? "bg-emerald-500" : "bg-zinc-400")} />
                                    {faq.isActive ? "Active" : "Hidden"}
                                </Badge>
                                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-zinc-300">
                                    <GripVertical className="h-3 w-3" />
                                    #{faq.order}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-zinc-50/50 rounded-2xl border-2 border-dashed border-zinc-200">
                    <HelpCircle className="h-12 w-12 text-zinc-200 mx-auto mb-3" />
                    <p className="text-zinc-500 font-medium">No FAQs found.</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={editingFaq ? "Edit FAQ" : "New FAQ"}
                description={editingFaq ? "Update the question and answer for this FAQ." : "Create a new frequently asked question."}
                size="xl"
            >
                <form onSubmit={onFormSubmit} className="space-y-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Question</Label>
                            <Input
                                name="question"
                                defaultValue={editingFaq?.question}
                                placeholder="e.g. How do I track my order?"
                                required
                                className="h-14 rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white transition-all shadow-none focus:shadow-xl focus:shadow-blue-500/5 text-lg font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Answer</Label>
                            <Textarea
                                name="answer"
                                defaultValue={editingFaq?.answer}
                                rows={6}
                                required
                                className="w-full rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-none resize-none leading-relaxed"
                                placeholder="Provide a detailed answer here..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Display Order</Label>
                                <Input
                                    type="number"
                                    name="order"
                                    defaultValue={editingFaq?.order ?? 0}
                                    className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white transition-all font-black text-center w-32"
                                />
                            </div>
                            <div className="flex flex-col justify-end space-y-4">
                                <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/30">
                                    <Checkbox
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) => setIsActive(checked === true)}
                                        className="h-5 w-5 rounded-md border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                    <Label htmlFor="isActive" className="text-sm font-black text-emerald-700 cursor-pointer tracking-tight">Publicly Active</Label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 justify-end pt-6 border-t border-zinc-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsFormOpen(false)}
                            className="h-12 px-8 rounded-2xl font-black text-zinc-500 hover:bg-zinc-100"
                        >
                            Discard
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-12 px-10 rounded-2xl font-black bg-[#1e4db7] hover:bg-[#143a8f] text-white shadow-xl shadow-blue-500/20 min-w-[180px]"
                        >
                            {isSubmitting ? "Processing..." : editingFaq ? "Update FAQ" : "Publish FAQ"}
                        </Button>
                    </div>
                </form>
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={confirmDelete}
                title="Delete FAQ"
                description="Are you sure you want to delete this FAQ? This action cannot be undone."
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
