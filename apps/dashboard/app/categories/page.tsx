"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { ConfirmModal, FormModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Textarea,
    Label,
} from "@ktblog/ui/components";
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    FileText,
    Folder,
    Loader2,
    AlertCircle,
} from "lucide-react";
import {
    useBlogCategories,
    useCreateCategory,
    useUpdateCategory,
    useDeleteCategory,
    type BlogCategory,
} from "@/hooks/use-blog";

// Local interface extending BlogCategory with display fields
interface DisplayCategory extends BlogCategory {
    postCount: number;
    order: number;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function CategoriesPage() {
    const { success, error: toastError } = useToast();

    // Data fetching
    const { data: categoriesData, isLoading: isLoadingCategories, error: categoriesError } = useBlogCategories();
    const createCategoryMutation = useCreateCategory();
    const updateCategoryMutation = useUpdateCategory();
    const deleteCategoryMutation = useDeleteCategory();

    // Map API categories to display categories with defaults for missing fields
    const apiCategories: DisplayCategory[] = React.useMemo(
        () =>
            (categoriesData?.categories ?? []).map((c, index) => ({
                ...c,
                postCount: (c as unknown as { postCount?: number }).postCount ?? 0,
                order: c.sortOrder ?? index,
            })),
        [categoriesData]
    );

    // Local reorder state (drag-and-drop is client-only)
    const [localOrder, setLocalOrder] = React.useState<DisplayCategory[]>([]);
    React.useEffect(() => {
        setLocalOrder(apiCategories);
    }, [apiCategories]);

    const categories = localOrder.length > 0 ? localOrder : apiCategories;

    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<DisplayCategory | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<DisplayCategory | null>(null);
    const [draggedItem, setDraggedItem] = React.useState<string | null>(null);

    // Form state
    const [formName, setFormName] = React.useState("");
    const [formSlug, setFormSlug] = React.useState("");
    const [formDescription, setFormDescription] = React.useState("");

    const openCreateForm = () => {
        setEditingCategory(null);
        setFormName("");
        setFormSlug("");
        setFormDescription("");
        setIsFormOpen(true);
    };

    const openEditForm = (category: DisplayCategory) => {
        setEditingCategory(category);
        setFormName(category.name);
        setFormSlug(category.slug);
        setFormDescription(category.description ?? "");
        setIsFormOpen(true);
    };

    const handleNameChange = (value: string) => {
        setFormName(value);
        if (!editingCategory) {
            setFormSlug(generateSlug(value));
        }
    };

    const handleSave = () => {
        if (!formName.trim()) return;

        if (editingCategory) {
            updateCategoryMutation.mutate(
                {
                    id: editingCategory.id,
                    data: { name: formName, slug: formSlug, description: formDescription },
                },
                {
                    onSuccess: () => {
                        success("Category updated", `"${formName}" has been updated.`);
                        setIsFormOpen(false);
                    },
                    onError: () => {
                        toastError("Error", "Failed to update category.");
                    },
                }
            );
        } else {
            createCategoryMutation.mutate(
                { name: formName, slug: formSlug || generateSlug(formName), description: formDescription },
                {
                    onSuccess: () => {
                        success("Category created", `"${formName}" has been created.`);
                        setIsFormOpen(false);
                    },
                    onError: () => {
                        toastError("Error", "Failed to create category.");
                    },
                }
            );
        }
    };

    const handleDelete = (category: DisplayCategory) => {
        setDeleteTarget(category);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        deleteCategoryMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
                success("Category deleted", `"${deleteTarget.name}" has been deleted.`);
                setIsDeleteOpen(false);
                setDeleteTarget(null);
            },
            onError: () => {
                toastError("Error", "Failed to delete category.");
            },
        });
    };

    // Drag and drop reordering
    const handleDragStart = (id: string) => {
        setDraggedItem(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;

        setLocalOrder((prev) => {
            const items = [...prev];
            const draggedIndex = items.findIndex((c) => c.id === draggedItem);
            const targetIndex = items.findIndex((c) => c.id === targetId);
            const [removed] = items.splice(draggedIndex, 1);
            items.splice(targetIndex, 0, removed);
            return items.map((item, index) => ({ ...item, order: index }));
        });
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    // Loading state
    if (isLoadingCategories) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Categories"
                    description="Organize your blog posts into categories"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Categories" },
                    ]}
                />
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    // Error state
    if (categoriesError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Categories"
                    description="Organize your blog posts into categories"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Categories" },
                    ]}
                />
                <div className="flex flex-col items-center justify-center py-24 text-red-500">
                    <AlertCircle className="h-10 w-10 mb-4" />
                    <p className="text-lg font-medium">Failed to load categories</p>
                    <p className="text-sm text-zinc-500 mt-1">
                        {categoriesError.message || "An unexpected error occurred."}
                    </p>
                </div>
            </div>
        );
    }

    const isSaving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Categories"
                description="Organize your blog posts into categories"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Categories" },
                ]}
                actions={
                    <PageHeaderButton
                        icon={<Plus className="h-4 w-4" />}
                        onClick={openCreateForm}
                    >
                        New Category
                    </PageHeaderButton>
                }
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                {/* Category List */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                        <div className="grid grid-cols-12 gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                            <div className="col-span-1"></div>
                            <div className="col-span-3">Name</div>
                            <div className="col-span-2">Slug</div>
                            <div className="col-span-3">Description</div>
                            <div className="col-span-1 text-center">Posts</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>
                    </div>

                    <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {categories
                            .sort((a, b) => a.order - b.order)
                            .map((category) => (
                                <div
                                    key={category.id}
                                    draggable
                                    onDragStart={() => handleDragStart(category.id)}
                                    onDragOver={(e) => handleDragOver(e, category.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors ${
                                        draggedItem === category.id
                                            ? "opacity-50 bg-zinc-50 dark:bg-zinc-700/30"
                                            : ""
                                    }`}
                                >
                                    <div className="col-span-1">
                                        <GripVertical className="h-4 w-4 text-zinc-400 cursor-grab active:cursor-grabbing" />
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-2">
                                            <Folder className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-zinc-900 dark:text-white text-sm">
                                                {category.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                                            {category.slug}
                                        </span>
                                    </div>
                                    <div className="col-span-3">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1">
                                            {category.description ?? ""}
                                        </p>
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <span className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                                            <FileText className="h-3.5 w-3.5" />
                                            {category.postCount}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => openEditForm(category)}
                                        >
                                            <Edit className="h-4 w-4 text-zinc-500 hover:text-primary" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handleDelete(category)}
                                        >
                                            <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-500" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>

                    {categories.length === 0 && (
                        <div className="text-center py-16">
                            <Folder className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                No categories yet
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                Create your first category to organize blog posts.
                            </p>
                        </div>
                    )}
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                    Drag and drop categories to reorder them.
                </p>
            </div>

            {/* Create/Edit Form Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={editingCategory ? "Edit Category" : "Create Category"}
                description={
                    editingCategory
                        ? "Update the category details"
                        : "Add a new category for your blog posts"
                }
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="catName">Name</Label>
                        <Input
                            id="catName"
                            value={formName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Category name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="catSlug">Slug</Label>
                        <Input
                            id="catSlug"
                            value={formSlug}
                            onChange={(e) => setFormSlug(e.target.value)}
                            placeholder="category-slug"
                            className="font-mono"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="catDesc">Description</Label>
                        <Textarea
                            id="catDesc"
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Brief description of this category"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!formName.trim() || isSaving}>
                            {isSaving
                                ? "Saving..."
                                : editingCategory
                                    ? "Save Changes"
                                    : "Create Category"}
                        </Button>
                    </div>
                </div>
            </FormModal>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Category"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? Posts in this category will not be deleted.`}
                onConfirm={confirmDelete}
                isLoading={deleteCategoryMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
