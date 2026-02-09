"use client";

import * as React from "react";
import { Plus, Search, Edit2, Trash2, MoreVertical, MessageSquare, Star, UserCheck, Building, Globe, Activity, HelpCircle, GripVertical } from "lucide-react";
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
import { FileUpload } from "@/components/FileUpload";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/toast";


interface Testimony {
    id: string;
    quote: string;
    author: string;
    position: string;
    company: string;
    rating: number;
    avatarUrl?: string;
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

export default function TestimonyPage() {
    const { success: toastSuccess, error: toastError } = useToast();
    const [testimonies, setTestimonies] = React.useState<Testimony[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Modal states
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [editingTestimony, setEditingTestimony] = React.useState<Testimony | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Form state for custom controls
    const [avatarUrl, setAvatarUrl] = React.useState("");
    const [formData, setFormData] = React.useState({
        isVerified: true,
        isActive: true,
        rating: 5
    });

    const fetchTestimonies = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<{ data: Testimony[] }>("/testimonies");
            setTestimonies(response.data || []);
        } catch (error) {
            console.error("Failed to fetch testimonies:", error);
            toastError("Failed to load testimonies");
        } finally {
            setIsLoading(false);
        }
    }, [toastError]);

    React.useEffect(() => {
        fetchTestimonies();
    }, [fetchTestimonies]);

    const filteredTestimonies = testimonies.filter(t =>
        t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.quote.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        setEditingTestimony(null);
        setAvatarUrl("");
        setIsFormOpen(true);
    };

    const handleEdit = (testimony: Testimony) => {
        setEditingTestimony(testimony);
        setAvatarUrl(testimony.avatarUrl || "");
        setFormData({
            isVerified: testimony.isVerified,
            isActive: testimony.isActive,
            rating: testimony.rating
        });
        setIsFormOpen(true);
    };

    const handleDelete = (testimony: Testimony) => {
        setEditingTestimony(testimony);
        setIsDeleteOpen(true);
    };

    const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fData = new FormData(e.currentTarget);
        const data = {
            quote: fData.get("quote") as string,
            author: fData.get("author") as string,
            position: fData.get("position") as string,
            company: fData.get("company") as string,
            rating: formData.rating,
            avatarUrl: avatarUrl,
            isVerified: formData.isVerified,
            isActive: formData.isActive
        };

        setIsSubmitting(true);
        try {
            if (editingTestimony) {
                await apiClient.patch(`/testimonies/${editingTestimony.id}`, data);
                toastSuccess("Testimony updated successfully");
            } else {
                await apiClient.post("/testimonies", data);
                toastSuccess("Testimony created successfully");
            }
            setIsFormOpen(false);
            fetchTestimonies();
        } catch (error) {
            console.error("Form submission failed:", error);
            toastError("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!editingTestimony) return;
        setIsSubmitting(true);
        try {
            await apiClient.delete(`/testimonies/${editingTestimony.id}`);
            toastSuccess("Testimony deleted successfully");
            setIsDeleteOpen(false);
            fetchTestimonies();
        } catch (error) {
            console.error("Delete failed:", error);
            toastError("Failed to delete testimony");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Testimonials"
                description="Manage customer feedback and success stories"
                actions={
                    <Button onClick={handleCreate}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Testimony
                    </Button>
                }
            />

            <div className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/20">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-[#1e4db7] transition-colors" />
                    <Input
                        placeholder="Search testimonials by author, company, or quote..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-zinc-50 border-none rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-medium"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 rounded-2xl bg-zinc-50 animate-pulse border border-zinc-100" />
                    ))}
                </div>
            ) : filteredTestimonies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTestimonies.map((testimony) => (
                        <div
                            key={testimony.id}
                            className="group relative bg-white border border-zinc-200/60 rounded-3xl p-8 hover:shadow-2xl hover:shadow-[#1e3a8a]/10 hover:border-[#1e3a8a]/20 transition-all duration-500 flex flex-col overflow-hidden"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#1e4db7]/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-8">
                                <div className="relative h-16 w-16">
                                    {testimony.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={testimony.avatarUrl}
                                            alt={testimony.author}
                                            className="h-full w-full rounded-2xl object-cover ring-4 ring-white shadow-xl"
                                        />
                                    ) : (
                                        <div className="h-full w-full rounded-2xl bg-[#1e4db7]/10 flex items-center justify-center text-[#1e4db7] font-black text-2xl shadow-inner">
                                            {testimony.author.charAt(0)}
                                        </div>
                                    )}
                                    {testimony.isVerified && (
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-lg">
                                            <UserCheck className="h-3.5 w-3.5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full text-amber-600 border border-amber-100 shadow-sm">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-black tracking-tight">{testimony.rating.toFixed(1)}</span>
                                </div>
                                <div className="absolute top-8 right-8">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all hover:bg-zinc-100 rounded-full">
                                                <MoreVertical className="h-4 w-4 text-zinc-400" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl border-zinc-200">
                                            <DropdownMenuItem onClick={() => handleEdit(testimony)} className="rounded-lg">
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600 rounded-lg" onClick={() => handleDelete(testimony)}>
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            <p className="text-base italic text-zinc-600 mb-8 line-clamp-4 relative z-10 leading-relaxed font-medium">
                                <MessageSquare className="absolute -left-6 -top-4 h-8 w-8 text-[#1e4db7]/5 -z-10" />
                                &ldquo;{testimony.quote}&rdquo;
                            </p>

                            <div className="mt-auto space-y-1">
                                <h4 className="font-black text-zinc-900 leading-tight text-lg tracking-tight">
                                    {testimony.author}
                                </h4>
                                <div className="flex items-center gap-2">
                                    <span className="h-px w-4 bg-[#1e4db7]/30" />
                                    <p className="text-xs text-[#1e4db7] font-bold uppercase tracking-widest">
                                        {testimony.position}
                                    </p>
                                </div>
                                <p className="text-xs text-zinc-400 font-semibold tracking-wide ml-6">
                                    {testimony.company}
                                </p>
                            </div>

                            <div className="mt-6 pt-6 border-t border-zinc-50 flex justify-between items-center">
                                <Badge variant={testimony.isActive ? "default" : "secondary"} className={cn(
                                    testimony.isActive
                                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-none shadow-none px-3"
                                        : "bg-zinc-100 text-zinc-500 border-none shadow-none px-3"
                                )}>
                                    <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", testimony.isActive ? "bg-emerald-500" : "bg-zinc-400")} />
                                    {testimony.isActive ? "Active" : "Hidden"}
                                </Badge>
                                <span className="text-[10px] text-zinc-300 font-black uppercase tracking-widest">
                                    {new Date(testimony.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-zinc-50/50 rounded-3xl border-2 border-dashed border-zinc-200">
                    <MessageSquare className="h-16 w-16 text-zinc-200 mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold text-lg">No testimonials found.</p>
                    <p className="text-zinc-400 text-sm mt-1">Start by adding your first customer feedback.</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={editingTestimony ? "Edit Testimony" : "New Testimony"}
                description={editingTestimony ? "Update the customer feedback details." : "Add a new customer testimonial to your website."}
                size="xl"
            >
                <form onSubmit={onFormSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Author Details */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Author Name</Label>
                                <Input
                                    name="author"
                                    defaultValue={editingTestimony?.author}
                                    placeholder="e.g. John Doe"
                                    required
                                    className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white transition-all shadow-none focus:shadow-xl focus:shadow-blue-500/5"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Position</Label>
                                    <Input
                                        name="position"
                                        defaultValue={editingTestimony?.position}
                                        placeholder="e.g. CEO"
                                        required
                                        className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Company</Label>
                                    <Input
                                        name="company"
                                        defaultValue={editingTestimony?.company}
                                        placeholder="Acme Corp"
                                        required
                                        className="h-12 rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 ml-1">Testimony Quote</Label>
                                <Textarea
                                    name="quote"
                                    defaultValue={editingTestimony?.quote}
                                    rows={5}
                                    required
                                    className="w-full rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white p-4 text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-none resize-none"
                                    placeholder="What did the customer say...?"
                                />
                            </div>
                        </div>

                        {/* Right Column: Media & Status */}
                        <div className="space-y-6">
                            <FileUpload
                                label="Author Avatar"
                                description="Select a high-quality photo"
                                value={avatarUrl}
                                onChange={setAvatarUrl}
                                accept="image/*"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-2xl border border-blue-50 bg-blue-50/30">
                                    <Checkbox
                                        id="isVerified"
                                        checked={formData.isVerified}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked === true }))}
                                        className="h-5 w-5 rounded-md border-blue-200 data-[state=checked]:bg-[#1e4db7] data-[state=checked]:border-[#1e4db7]"
                                    />
                                    <Label htmlFor="isVerified" className="text-sm font-black text-[#1e4db7] cursor-pointer tracking-tight">
                                        Verified
                                    </Label>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/30">
                                    <Checkbox
                                        id="isActive"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked === true }))}
                                        className="h-5 w-5 rounded-md border-emerald-200 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                    />
                                    <Label htmlFor="isActive" className="text-sm font-black text-emerald-700 cursor-pointer tracking-tight">
                                        Public
                                    </Label>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                                <Label className="text-[11px] uppercase tracking-widest font-black text-zinc-400 mb-3 block ml-1">Customer Rating</Label>
                                <div className="flex items-center justify-between gap-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                                            className={cn(
                                                "flex-1 h-10 rounded-xl flex items-center justify-center transition-all",
                                                formData.rating >= star
                                                    ? "bg-amber-50 text-amber-500 shadow-sm border border-amber-100"
                                                    : "bg-white text-zinc-300 border border-zinc-100"
                                            )}
                                        >
                                            <Star className={cn("h-5 w-5", formData.rating >= star && "fill-amber-500")} />
                                        </button>
                                    ))}
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
                            {isSubmitting ? "Processing..." : editingTestimony ? "Update Feedback" : "Push Live"}
                        </Button>
                    </div>
                </form>
            </FormModal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={confirmDelete}
                title="Delete Testimony"
                description="Are you sure you want to delete this testimonial? It will be removed from your website immediately."
                variant="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
