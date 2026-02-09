"use client";

import * as React from "react";
import type { Editor } from "@tiptap/react";
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Code,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Heading6,
    List,
    ListOrdered,
    ListChecks,
    Quote,
    Minus,
    Link,
    Unlink,
    Image,
    Table,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Highlighter,
    Undo,
    Redo,
    ChevronDown,
    Code2,
    Youtube,
    TableProperties,
    Rows3,
    Columns3,
    Trash2,
} from "lucide-react";
import {
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@ktblog/ui/components";

// ---- Toolbar Button ----

interface ToolbarButtonProps {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
}

function ToolbarButton({
    onClick,
    isActive = false,
    disabled = false,
    title,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "inline-flex items-center justify-center rounded-md p-1.5 text-sm transition-colors",
                "hover:bg-zinc-100 dark:hover:bg-zinc-700",
                "disabled:pointer-events-none disabled:opacity-40",
                isActive
                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-white"
                    : "text-zinc-600 dark:text-zinc-400"
            )}
        >
            {children}
        </button>
    );
}

// ---- Toolbar Divider ----

function ToolbarDivider() {
    return (
        <div className="mx-1 h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
    );
}

// ---- Link Dialog ----

interface LinkDialogProps {
    editor: Editor;
    onClose: () => void;
}

function LinkDialog({ editor, onClose }: LinkDialogProps) {
    const [url, setUrl] = React.useState(
        editor.getAttributes("link").href || ""
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url.trim() })
                .run();
        }
        onClose();
    };

    return (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                    autoFocus
                />
                <button
                    type="submit"
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                >
                    Apply
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

// ---- Image Dialog ----

interface ImageDialogProps {
    editor: Editor;
    onClose: () => void;
}

function ImageDialog({ editor, onClose }: ImageDialogProps) {
    const [url, setUrl] = React.useState("");
    const [alt, setAlt] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            editor
                .chain()
                .focus()
                .setImage({ src: url.trim(), alt: alt.trim() || undefined })
                .run();
        }
        onClose();
    };

    return (
        <div className="absolute top-full left-0 z-50 mt-1 w-80 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Image URL (https://...)"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                    autoFocus
                />
                <input
                    type="text"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                    placeholder="Alt text (optional)"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                />
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                    >
                        Insert Image
                    </button>
                </div>
            </form>
        </div>
    );
}

// ---- YouTube Dialog ----

interface YouTubeDialogProps {
    editor: Editor;
    onClose: () => void;
}

function YouTubeDialog({ editor, onClose }: YouTubeDialogProps) {
    const [url, setUrl] = React.useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            editor.commands.setYoutubeVideo({ src: url.trim() });
        }
        onClose();
    };

    return (
        <div className="absolute top-full right-0 z-50 mt-1 w-80 rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="YouTube URL"
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                    autoFocus
                />
                <button
                    type="submit"
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
                >
                    Embed
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
}

// ---- Main Toolbar ----

interface EditorToolbarProps {
    editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
    const [showLinkDialog, setShowLinkDialog] = React.useState(false);
    const [showImageDialog, setShowImageDialog] = React.useState(false);
    const [showYouTubeDialog, setShowYouTubeDialog] = React.useState(false);

    if (!editor) return null;

    const activeHeadingLabel = (() => {
        if (editor.isActive("heading", { level: 2 })) return "H2";
        if (editor.isActive("heading", { level: 3 })) return "H3";
        if (editor.isActive("heading", { level: 4 })) return "H4";
        if (editor.isActive("heading", { level: 5 })) return "H5";
        if (editor.isActive("heading", { level: 6 })) return "H6";
        return "Paragraph";
    })();

    const activeAlignIcon = (() => {
        if (editor.isActive({ textAlign: "center" })) return AlignCenter;
        if (editor.isActive({ textAlign: "right" })) return AlignRight;
        if (editor.isActive({ textAlign: "justify" })) return AlignJustify;
        return AlignLeft;
    })();

    const ActiveAlignIconComponent = activeAlignIcon;

    return (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900 rounded-t-lg">
            {/* Undo / Redo */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Ctrl+Z)"
            >
                <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Ctrl+Shift+Z)"
            >
                <Redo className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Headings Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                            "hover:bg-zinc-100 dark:hover:bg-zinc-700",
                            "text-zinc-600 dark:text-zinc-400",
                            activeHeadingLabel !== "Paragraph" &&
                                "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-white"
                        )}
                        title="Block type"
                    >
                        {activeHeadingLabel}
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                    <DropdownMenuItem
                        onClick={() =>
                            editor.chain().focus().setParagraph().run()
                        }
                        className={cn(
                            "cursor-pointer",
                            !editor.isActive("heading") && "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                        className={cn(
                            "cursor-pointer text-lg font-bold",
                            editor.isActive("heading", { level: 2 }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                        className={cn(
                            "cursor-pointer text-base font-bold",
                            editor.isActive("heading", { level: 3 }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        Heading 3
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 4 })
                                .run()
                        }
                        className={cn(
                            "cursor-pointer text-sm font-bold",
                            editor.isActive("heading", { level: 4 }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        Heading 4
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 5 })
                                .run()
                        }
                        className={cn(
                            "cursor-pointer text-sm font-semibold",
                            editor.isActive("heading", { level: 5 }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        Heading 5
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 6 })
                                .run()
                        }
                        className={cn(
                            "cursor-pointer text-xs font-semibold",
                            editor.isActive("heading", { level: 6 }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        Heading 6
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ToolbarDivider />

            {/* Text Formatting */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Bold (Ctrl+B)"
            >
                <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italic (Ctrl+I)"
            >
                <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Underline (Ctrl+U)"
            >
                <Underline className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive("strike")}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCode().run()}
                isActive={editor.isActive("code")}
                title="Inline Code"
            >
                <Code className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleHighlight().run()
                }
                isActive={editor.isActive("highlight")}
                title="Highlight"
            >
                <Highlighter className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Text Alignment Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
                            "hover:bg-zinc-100 dark:hover:bg-zinc-700",
                            "text-zinc-600 dark:text-zinc-400"
                        )}
                        title="Text alignment"
                    >
                        <ActiveAlignIconComponent className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[140px]">
                    <DropdownMenuItem
                        onClick={() =>
                            editor.chain().focus().setTextAlign("left").run()
                        }
                        className={cn(
                            "cursor-pointer",
                            editor.isActive({ textAlign: "left" }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        <AlignLeft className="mr-2 h-4 w-4" />
                        Left
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor.chain().focus().setTextAlign("center").run()
                        }
                        className={cn(
                            "cursor-pointer",
                            editor.isActive({ textAlign: "center" }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        <AlignCenter className="mr-2 h-4 w-4" />
                        Center
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor.chain().focus().setTextAlign("right").run()
                        }
                        className={cn(
                            "cursor-pointer",
                            editor.isActive({ textAlign: "right" }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        <AlignRight className="mr-2 h-4 w-4" />
                        Right
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .setTextAlign("justify")
                                .run()
                        }
                        className={cn(
                            "cursor-pointer",
                            editor.isActive({ textAlign: "justify" }) &&
                                "bg-zinc-100 dark:bg-zinc-700"
                        )}
                    >
                        <AlignJustify className="mr-2 h-4 w-4" />
                        Justify
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <ToolbarDivider />

            {/* Lists & Block */}
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
                isActive={editor.isActive("orderedList")}
                title="Ordered List"
            >
                <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleTaskList().run()
                }
                isActive={editor.isActive("taskList")}
                title="Task List"
            >
                <ListChecks className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleBlockquote().run()
                }
                isActive={editor.isActive("blockquote")}
                title="Blockquote"
            >
                <Quote className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleCodeBlock().run()
                }
                isActive={editor.isActive("codeBlock")}
                title="Code Block"
            >
                <Code2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().setHorizontalRule().run()
                }
                title="Horizontal Divider"
            >
                <Minus className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarDivider />

            {/* Link */}
            <div className="relative">
                <ToolbarButton
                    onClick={() => {
                        if (editor.isActive("link")) {
                            editor.chain().focus().unsetLink().run();
                        } else {
                            setShowLinkDialog(!showLinkDialog);
                            setShowImageDialog(false);
                            setShowYouTubeDialog(false);
                        }
                    }}
                    isActive={editor.isActive("link")}
                    title={editor.isActive("link") ? "Remove link" : "Insert link"}
                >
                    {editor.isActive("link") ? (
                        <Unlink className="h-4 w-4" />
                    ) : (
                        <Link className="h-4 w-4" />
                    )}
                </ToolbarButton>
                {showLinkDialog && (
                    <LinkDialog
                        editor={editor}
                        onClose={() => setShowLinkDialog(false)}
                    />
                )}
            </div>

            {/* Image */}
            <div className="relative">
                <ToolbarButton
                    onClick={() => {
                        setShowImageDialog(!showImageDialog);
                        setShowLinkDialog(false);
                        setShowYouTubeDialog(false);
                    }}
                    title="Insert image"
                >
                    <Image className="h-4 w-4" />
                </ToolbarButton>
                {showImageDialog && (
                    <ImageDialog
                        editor={editor}
                        onClose={() => setShowImageDialog(false)}
                    />
                )}
            </div>

            {/* YouTube */}
            <div className="relative">
                <ToolbarButton
                    onClick={() => {
                        setShowYouTubeDialog(!showYouTubeDialog);
                        setShowLinkDialog(false);
                        setShowImageDialog(false);
                    }}
                    title="Embed YouTube video"
                >
                    <Youtube className="h-4 w-4" />
                </ToolbarButton>
                {showYouTubeDialog && (
                    <YouTubeDialog
                        editor={editor}
                        onClose={() => setShowYouTubeDialog(false)}
                    />
                )}
            </div>

            <ToolbarDivider />

            {/* Table */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "inline-flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm transition-colors",
                            "hover:bg-zinc-100 dark:hover:bg-zinc-700",
                            editor.isActive("table")
                                ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-white"
                                : "text-zinc-600 dark:text-zinc-400"
                        )}
                        title="Table"
                    >
                        <Table className="h-4 w-4" />
                        <ChevronDown className="h-3 w-3" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[180px]">
                    {!editor.isActive("table") ? (
                        <DropdownMenuItem
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .insertTable({
                                        rows: 3,
                                        cols: 3,
                                        withHeaderRow: true,
                                    })
                                    .run()
                            }
                            className="cursor-pointer"
                        >
                            <TableProperties className="mr-2 h-4 w-4" />
                            Insert Table (3x3)
                        </DropdownMenuItem>
                    ) : (
                        <>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addRowAfter()
                                        .run()
                                }
                                className="cursor-pointer"
                            >
                                <Rows3 className="mr-2 h-4 w-4" />
                                Add Row After
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addRowBefore()
                                        .run()
                                }
                                className="cursor-pointer"
                            >
                                <Rows3 className="mr-2 h-4 w-4" />
                                Add Row Before
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnAfter()
                                        .run()
                                }
                                className="cursor-pointer"
                            >
                                <Columns3 className="mr-2 h-4 w-4" />
                                Add Column After
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnBefore()
                                        .run()
                                }
                                className="cursor-pointer"
                            >
                                <Columns3 className="mr-2 h-4 w-4" />
                                Add Column Before
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .deleteRow()
                                        .run()
                                }
                                className="cursor-pointer text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Row
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .deleteColumn()
                                        .run()
                                }
                                className="cursor-pointer text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Column
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() =>
                                    editor
                                        .chain()
                                        .focus()
                                        .deleteTable()
                                        .run()
                                }
                                className="cursor-pointer text-red-600"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Table
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
