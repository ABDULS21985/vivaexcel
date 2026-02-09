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
} from "lucide-react";

interface BlogTag {
    id: string;
    name: string;
    slug: string;
    postCount: number;
}

const initialTags: BlogTag[] = [
    { id: "1", name: "React", slug: "react", postCount: 18 },
    { id: "2", name: "TypeScript", slug: "typescript", postCount: 15 },
    { id: "3", name: "Next.js", slug: "nextjs", postCount: 12 },
    { id: "4", name: "JavaScript", slug: "javascript", postCount: 24 },
    { id: "5", name: "CSS", slug: "css", postCount: 9 },
    { id: "6", name: "Node.js", slug: "nodejs", postCount: 11 },
    { id: "7", name: "Python", slug: "python", postCount: 7 },
    { id: "8", name: "Docker", slug: "docker", postCount: 5 },
    { id: "9", name: "AWS", slug: "aws", postCount: 6 },
    { id: "10", name: "GraphQL", slug: "graphql", postCount: 4 },
    { id: "11", name: "REST API", slug: "rest-api", postCount: 8 },
    { id: "12", name: "Testing", slug: "testing", postCount: 10 },
    { id: "13", name: "DevOps", slug: "devops", postCount: 3 },
    { id: "14", name: "Security", slug: "security", postCount: 6 },
    { id: "15", name: "Performance", slug: "performance", postCount: 5 },
    { id: "16", name: "Tailwind CSS", slug: "tailwind-css", postCount: 8 },
    { id: "17", name: "Database", slug: "database", postCount: 4 },
    { id: "18", name: "AI", slug: "ai", postCount: 7 },
];

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
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
    const { success, error } = useToast();
    const [tags, setTags] = React.useState<BlogTag[]>(initialTags);
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingTag, setEditingTag] = React.useState<BlogTag | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
    const [deleteTarget, setDeleteTarget] = React.useState<BlogTag | null>(null);
    const [isMergeOpen, setIsMergeOpen] = React.useState(false);
    const [mergeSource, setMergeSource] = React.useState("");
    const [mergeTarget, setMergeTarget] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);

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

    const openEditForm = (tag: BlogTag) => {
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
            setTags((prev) =>
                prev.map((t) =>
                    t.id === editingTag.id
                        ? { ...t, name: formName, slug: formSlug }
                        : t
                )
            );
            success("Tag updated", `"${formName}" has been updated.`);
        } else {
            const newTag: BlogTag = {
                id: String(Date.now()),
                name: formName,
                slug: formSlug || generateSlug(formName),
                postCount: 0,
            };
            setTags((prev) => [...prev, newTag]);
            success("Tag created", `"${formName}" has been created.`);
        }
        setIsFormOpen(false);
    };

    const handleDelete = (tag: BlogTag) => {
        setDeleteTarget(tag);
        setIsDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
            setTags((prev) => prev.filter((t) => t.id !== deleteTarget.id));
            success("Tag deleted", `"${deleteTarget.name}" has been deleted.`);
            setIsDeleteOpen(false);
            setDeleteTarget(null);
        } catch {
            error("Error", "Failed to delete tag.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleMerge = () => {
        if (!mergeSource || !mergeTarget || mergeSource === mergeTarget) return;

        const sourceTag = tags.find((t) => t.id === mergeSource);
        const targetTag = tags.find((t) => t.id === mergeTarget);
        if (!sourceTag || !targetTag) return;

        setTags((prev) =>
            prev
                .map((t) =>
                    t.id === mergeTarget
                        ? { ...t, postCount: t.postCount + sourceTag.postCount }
                        : t
                )
                .filter((t) => t.id !== mergeSource)
        );

        success(
            "Tags merged",
            `"${sourceTag.name}" has been merged into "${targetTag.name}".`
        );
        setIsMergeOpen(false);
        setMergeSource("");
        setMergeTarget("");
    };

    const columns: Column<BlogTag>[] = [
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
                        <Button onClick={handleSave} disabled={!formName.trim()}>
                            {editingTag ? "Save Changes" : "Create Tag"}
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
                            disabled={!mergeSource || !mergeTarget || mergeSource === mergeTarget}
                        >
                            Merge Tags
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
                isLoading={isLoading}
                variant="danger"
            />
        </div>
    );
}
