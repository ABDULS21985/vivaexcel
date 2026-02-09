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
} from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    postCount: number;
    order: number;
}

const initialCategories: Category[] = [
    { id: "1", name: "Technology", slug: "technology", description: "Posts about software, hardware, and emerging tech trends.", postCount: 24, order: 0 },
    { id: "2", name: "Finance", slug: "finance", description: "Financial insights, market analysis, and investment strategies.", postCount: 18, order: 1 },
    { id: "3", name: "Security", slug: "security", description: "Cybersecurity best practices and threat analysis.", postCount: 12, order: 2 },
    { id: "4", name: "Business", slug: "business", description: "Business strategy, leadership, and entrepreneurship.", postCount: 15, order: 3 },
    { id: "5", name: "Tutorials", slug: "tutorials", description: "Step-by-step guides and how-to articles.", postCount: 31, order: 4 },
    { id: "6", name: "Case Studies", slug: "case-studies", description: "Real-world project breakdowns and success stories.", postCount: 8, order: 5 },
    { id: "7", name: "News", slug: "news", description: "Industry news and updates.", postCount: 42, order: 6 },
];

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export default function CategoriesPage() {
    const { success, error } = useToast();
    const [categories, setCategories] = React.useState<Category[]>(initialCategories);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
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

    const openEditForm = (category: Category) => {
        setEditingCategory(category);
        setFormName(category.name);
        setFormSlug(category.slug);
        setFormDescription(category.description);
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
            setCategories((prev) =>
                prev.map((c) =>
                    c.id === editingCategory.id
                        ? { ...c, name: formName, slug: formSlug, description: formDescription }
                        : c
                )
            );
            success("Category updated", `"${formName}" has been updated.`);
        } else {
            const newCategory: Category = {
                id: String(Date.now()),
                name: formName,
                slug: formSlug || generateSlug(formName),
                description: formDescription,
                postCount: 0,
                order: categories.length,
            };
            setCategories((prev) => [...prev, newCategory]);
            success("Category created", `"${formName}" has been created.`);
        }
        setIsFormOpen(false);
    };

    const handleDelete = (category: Category) => {
        setDeleteTarget(category);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
            success("Category deleted", `"${deleteTarget.name}" has been deleted.`);
            setIsDeleteOpen(false);
            setDeleteTarget(null);
        } catch {
            error("Error", "Failed to delete category.");
        } finally {
            setIsLoading(false);
        }
    };

    // Drag and drop reordering
    const handleDragStart = (id: string) => {
        setDraggedItem(id);
    };

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault();
        if (!draggedItem || draggedItem === targetId) return;

        setCategories((prev) => {
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
                                            {category.description}
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
                        <Button onClick={handleSave} disabled={!formName.trim()}>
                            {editingCategory ? "Save Changes" : "Create Category"}
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
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
