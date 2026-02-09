"use client";

import * as React from "react";
import { PageHeader, PageHeaderButton } from "@/components/page-header";
import { DataTable, Column } from "@/components/data-table";
import { ConfirmModal, FormModal } from "@/components/modal";
import { useToast } from "@/components/toast";
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ktblog/ui/components";
import {
    Plus,
    Edit,
    Trash2,
    Tag,
    Merge,
    FileText,
    Loader2,
    AlertCircle,
} from "lucide-react";
import {
    useBlogTags,
    useCreateTag,
    useUpdateTag,
    useDeleteTag,
    type BlogTag,
} from "@/hooks/use-blog";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

// Local interface extending BlogTag with optional postCount for display
interface DisplayTag extends BlogTag {
    postCount: number;
}

// Calculate tag sizes for cloud visualization
function getTagSize(postCount: number, maxCount: number): string {
    const ratio = postCount / maxCount;
    if (ratio >= 0.8) return "text-2xl font-bold";
    if (ratio >= 0.6) return "text-xl font-semibold";
    if (ratio >= 0.4) return "text-lg font-medium";
    if (ratio >= 0.2) return "text-base font-medium";
    return "text-sm font-normal";
}

const tagColors = [
    "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    "text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    "text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20",
    "text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20",
];

export default function TagsPage() {
    const { success, error: toastError } = useToast();

    // Data fetching
    const { data: tagsData, isLoading: isLoadingTags, error: tagsError } = useBlogTags();
    const createTagMutation = useCreateTag();
    const updateTagMutation = useUpdateTag();
    const deleteTagMutation = useDeleteTag();

    // Map API tags to display tags with default postCount
    const tags: DisplayTag[] = React.useMemo(
        () =>
            (tagsData?.tags ?? []).map((t) => ({
                ...t,
                postCount: (t as unknown as { postCount?: number }).postCount ?? 0,
            })),
        [tagsData]
    );

    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingTag, setEditingTag] = React.useState<DisplayTag | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<DisplayTag | null>(null);
    const [isMergeOpen, setIsMergeOpen] = React.useState(false);
    const [mergeSource, setMergeSource] = React.useState("");
    const [mergeTarget, setMergeTarget] = React.useState("");

    // Form state
    const [formName, setFormName] = React.useState("");
    const [formSlug, setFormSlug] = React.useState("");

    const maxPostCount = Math.max(...tags.map((t) => t.postCount), 1);

    const openCreateForm = () => {
        setEditingTag(null);
        setFormName("");
        setFormSlug("");
        setIsFormOpen(true);
    };

    const openEditForm = (tag: DisplayTag) => {
        setEditingTag(tag);
        setFormName(tag.name);
        setFormSlug(tag.slug);
        setIsFormOpen(true);
    };

    const handleNameChange = (value: string) => {
        setFormName(value);
        if (!editingTag) {
            setFormSlug(generateSlug(value));
        }
    };

    const handleSave = () => {
        if (!formName.trim()) return;

        if (editingTag) {
            updateTagMutation.mutate(
                { id: editingTag.id, data: { name: formName, slug: formSlug } },
                {
                    onSuccess: () => {
                        success("Tag updated", `"${formName}" has been updated.`);
                        setIsFormOpen(false);
                    },
                    onError: () => {
                        toastError("Error", "Failed to update tag.");
                    },
                }
            );
        } else {
            createTagMutation.mutate(
                { name: formName, slug: formSlug || generateSlug(formName) },
                {
                    onSuccess: () => {
                        success("Tag created", `"${formName}" has been created.`);
                        setIsFormOpen(false);
                    },
                    onError: () => {
                        toastError("Error", "Failed to create tag.");
                    },
                }
            );
        }
    };

    const handleDelete = (tag: DisplayTag) => {
        setDeleteTarget(tag);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        deleteTagMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
                success("Tag deleted", `"${deleteTarget.name}" has been deleted.`);
                setIsDeleteOpen(false);
                setDeleteTarget(null);
            },
            onError: () => {
                toastError("Error", "Failed to delete tag.");
            },
        });
    };

    const handleMerge = () => {
        if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;

        const sourceTag = tags.find((t) => t.id === mergeSource);
        const targetTag = tags.find((t) => t.id === mergeTarget);
        if (!sourceTag || !targetTag) return;

        // TODO: Wire to backend merge endpoint when available
        // For now, just delete the source tag
        deleteTagMutation.mutate(mergeSource, {
            onSuccess: () => {
                success(
                    "Tags merged",
                    `"${sourceTag.name}" has been merged into "${targetTag.name}".`
                );
                setIsMergeOpen(false);
                setMergeSource("");
                setMergeTarget("");
            },
            onError: () => {
                toastError("Error", "Failed to merge tags.");
            },
        });
    };

    const columns: Column<DisplayTag>[] = [
        {
            key: "name",
            header: "Tag Name",
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-medium text-zinc-900 dark:text-white">
                        {item.name}
                    </span>
                </div>
            ),
        },
        {
            key: "slug",
            header: "Slug",
            sortable: true,
            render: (item) => (
                <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">
                    {item.slug}
                </span>
            ),
        },
        {
            key: "postCount",
            header: "Posts",
            sortable: true,
            render: (item) => (
                <span className="inline-flex items-center gap-1 text-sm text-zinc-600 dark:text-zinc-400">
                    <FileText className="h-3.5 w-3.5" />
                    {item.postCount}
                </span>
            ),
        },
    ];

    // Loading state
    if (isLoadingTags) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Tags"
                    description="Manage tags for your blog posts"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Tags" },
                    ]}
                />
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                </div>
            </div>
        );
    }

    // Error state
    if (tagsError) {
        return (
            <div className="min-h-screen">
                <PageHeader
                    title="Tags"
                    description="Manage tags for your blog posts"
                    breadcrumbs={[
                        { label: "Dashboard", href: "/" },
                        { label: "Tags" },
                    ]}
                />
                <div className="flex flex-col items-center justify-center py-24 text-red-500">
                    <AlertCircle className="h-10 w-10 mb-4" />
                    <p className="text-lg font-medium">Failed to load tags</p>
                    <p className="text-sm text-zinc-500 mt-1">
                        {tagsError.message || "An unexpected error occurred."}
                    </p>
                </div>
            </div>
        );
    }

    const isSaving = createTagMutation.isPending || updateTagMutation.isPending;

    return (
        <div className="min-h-screen">
            <PageHeader
                title="Tags"
                description="Manage tags for your blog posts"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "Tags" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsMergeOpen(true)}
                        >
                            <Merge className="h-4 w-4 mr-2" />
                            Merge Tags
                        </Button>
                        <PageHeaderButton
                            icon={<Plus className="h-4 w-4" />}
                            onClick={openCreateForm}
                        >
                            New Tag
                        </PageHeaderButton>
                    </div>
                }
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Tag Cloud */}
                <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-6">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                        Tag Cloud
                    </h3>
                    <div className="flex flex-wrap gap-3 items-center justify-center py-4">
                        {tags
                            .sort((a, b) => b.postCount - a.postCount)
                            .map((tag, index) => (
                                <button
                                    key={tag.id}
                                    onClick={() => openEditForm(tag)}
                                    className={`px-3 py-1.5 rounded-lg transition-colors ${getTagSize(tag.postCount, maxPostCount)} ${tagColors[index % tagColors.length]}`}
                                    title={`${tag.postCount} posts`}
                                >
                                    #{tag.name}
                                </button>
                            ))}
                    </div>
                </div>

                {/* Tags Table */}
                <DataTable
                    columns={columns}
                    data={tags}
                    keyField="id"
                    searchable
                    searchPlaceholder="Search tags..."
                    emptyMessage="No tags found"
                    emptyDescription="Create your first tag to start organizing posts."
                    onEdit={openEditForm}
                    onDelete={handleDelete}
                />
            </div>

            {/* Create/Edit Form Modal */}
            <FormModal
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                title={editingTag ? "Edit Tag" : "Create Tag"}
                description={
                    editingTag
                        ? "Update the tag details"
                        : "Add a new tag for your blog posts"
                }
                size="md"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tagName">Tag Name</Label>
                        <Input
                            id="tagName"
                            value={formName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Tag name"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tagSlug">Slug</Label>
                        <Input
                            id="tagSlug"
                            value={formSlug}
                            onChange={(e) => setFormSlug(e.target.value)}
                            placeholder="tag-slug"
                            className="font-mono"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!formName.trim() || isSaving}>
                            {isSaving
                                ? "Saving..."
                                : editingTag
                                    ? "Save Changes"
                                    : "Create Tag"}
                        </Button>
                    </div>
                </div>
            </FormModal>

            {/* Merge Tags Modal */}
            <FormModal
                open={isMergeOpen}
                onOpenChange={setIsMergeOpen}
                title="Merge Tags"
                description="Merge duplicate tags. The source tag will be deleted and its posts will be assigned to the target tag."
                size="md"
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Source Tag (will be removed)</Label>
                        <Select value={mergeSource} onValueChange={setMergeSource}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select source tag" />
                            </SelectTrigger>
                            <SelectContent>
                                {tags
                                    .filter((t) => t.id !== mergeTarget)
                                    .map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id}>
                                            {tag.name} ({tag.postCount} posts)
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Target Tag (will be kept)</Label>
                        <Select value={mergeTarget} onValueChange={setMergeTarget}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select target tag" />
                            </SelectTrigger>
                            <SelectContent>
                                {tags
                                    .filter((t) => t.id !== mergeSource)
                                    .map((tag) => (
                                        <SelectItem key={tag.id} value={tag.id}>
                                            {tag.name} ({tag.postCount} posts)
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                        <Button variant="outline" onClick={() => setIsMergeOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleMerge}
                            disabled={!mergeSource || !mergeTarget || mergeSource === mergeTarget || deleteTagMutation.isPending}
                        >
                            {deleteTagMutation.isPending ? "Merging..." : "Merge Tags"}
                        </Button>
                    </div>
                </div>
            </FormModal>

            <ConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Tag"
                description={`Are you sure you want to delete "${deleteTarget?.name}"? This tag will be removed from all posts.`}
                onConfirm={confirmDelete}
                isLoading={deleteTagMutation.isPending}
                variant="danger"
            />
        </div>
    );
}
