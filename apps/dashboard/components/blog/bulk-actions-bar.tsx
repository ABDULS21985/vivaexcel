"use client";

import * as React from "react";
import { Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ktblog/ui/components";
import {
    X,
    Trash2,
    Eye,
    EyeOff,
    FileText,
    FolderOpen,
    Tag,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { ConfirmModal } from "@/components/modal";

export type BulkAction =
    | "publish"
    | "unpublish"
    | "draft"
    | "archive"
    | "delete"
    | "change-category"
    | "add-tags";

interface BulkActionsBarProps {
    selectedCount: number;
    onAction: (action: BulkAction, payload?: string) => Promise<void>;
    onClearSelection: () => void;
    isLoading: boolean;
    categories?: string[];
    tags?: string[];
}

export function BulkActionsBar({
    selectedCount,
    onAction,
    onClearSelection,
    isLoading,
    categories = ["Technology", "Finance", "Security", "Business", "Artificial Intelligence"],
    tags = ["featured", "trending", "tutorial", "guide", "news", "opinion"],
}: BulkActionsBarProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [showCategorySelect, setShowCategorySelect] = React.useState(false);
    const [showTagSelect, setShowTagSelect] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState("");
    const [selectedTag, setSelectedTag] = React.useState("");

    if (selectedCount === 0) return null;

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        await onAction("delete");
        setShowDeleteConfirm(false);
    };

    const handleCategoryApply = async () => {
        if (selectedCategory) {
            await onAction("change-category", selectedCategory);
            setShowCategorySelect(false);
            setSelectedCategory("");
        }
    };

    const handleTagApply = async () => {
        if (selectedTag) {
            await onAction("add-tags", selectedTag);
            setShowTagSelect(false);
            setSelectedTag("");
        }
    };

    return (
        <>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl shadow-2xl px-5 py-3 border border-zinc-700 dark:border-zinc-300">
                    {/* Selection count */}
                    <div className="flex items-center gap-2 pr-3 border-r border-zinc-700 dark:border-zinc-300">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium whitespace-nowrap">
                            {selectedCount} post{selectedCount !== 1 ? "s" : ""} selected
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAction("publish")}
                            disabled={isLoading}
                            className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                        >
                            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                            Publish
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAction("unpublish")}
                            disabled={isLoading}
                            className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                        >
                            <EyeOff className="h-3.5 w-3.5 mr-1" />
                            Unpublish
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onAction("draft")}
                            disabled={isLoading}
                            className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                        >
                            <FileText className="h-3.5 w-3.5 mr-1" />
                            Draft
                        </Button>

                        {/* Category picker */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowCategorySelect(!showCategorySelect);
                                    setShowTagSelect(false);
                                }}
                                disabled={isLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                <FolderOpen className="h-3.5 w-3.5 mr-1" />
                                Category
                            </Button>

                            {showCategorySelect && (
                                <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 w-52 z-10">
                                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Assign category</p>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 mb-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                    >
                                        <option value="">Select...</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-1.5">
                                        <Button size="sm" onClick={handleCategoryApply} disabled={!selectedCategory} className="flex-1 h-7 text-xs">
                                            Apply
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowCategorySelect(false)} className="h-7 text-xs">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tag picker */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setShowTagSelect(!showTagSelect);
                                    setShowCategorySelect(false);
                                }}
                                disabled={isLoading}
                                className="text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 h-8 text-xs"
                            >
                                <Tag className="h-3.5 w-3.5 mr-1" />
                                Tags
                            </Button>

                            {showTagSelect && (
                                <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 w-52 z-10">
                                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">Add tag</p>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1.5 mb-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                                    >
                                        <option value="">Select...</option>
                                        {tags.map((tag) => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-1.5">
                                        <Button size="sm" onClick={handleTagApply} disabled={!selectedTag} className="flex-1 h-7 text-xs">
                                            Apply
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setShowTagSelect(false)} className="h-7 text-xs">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Separator */}
                        <div className="h-5 w-px bg-zinc-700 dark:bg-zinc-300 mx-1" />

                        {/* Delete */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDeleteClick}
                            disabled={isLoading}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/30 dark:text-red-600 dark:hover:text-red-700 dark:hover:bg-red-100 h-8 text-xs"
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                        </Button>
                    </div>

                    {/* Close */}
                    <div className="pl-2 border-l border-zinc-700 dark:border-zinc-300">
                        <button
                            onClick={onClearSelection}
                            className="p-1 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmModal
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title={`Delete ${selectedCount} post${selectedCount !== 1 ? "s" : ""}?`}
                description={`This will permanently delete ${selectedCount} selected post${selectedCount !== 1 ? "s" : ""}. This action cannot be undone.`}
                onConfirm={handleConfirmDelete}
                isLoading={isLoading}
                variant="danger"
                confirmLabel="Delete Posts"
            />
        </>
    );
}

export default BulkActionsBar;
