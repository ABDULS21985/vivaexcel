"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import UnderlineExtension from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { Table as TableExtension } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Youtube from "@tiptap/extension-youtube";
import { common, createLowlight } from "lowlight";
import { cn } from "@ktblog/ui/components";
import { FileText, Clock, Code, Eye } from "lucide-react";
import { EditorToolbar } from "./editor-toolbar";

const lowlight = createLowlight(common);

// ---- Helpers ----

function countWordsFromHtml(html: string): number {
    if (!html || html === "<p></p>") return 0;
    // Strip HTML tags to get plain text
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (!text) return 0;
    return text.split(/\s+/).length;
}

function countCharsFromHtml(html: string): number {
    if (!html || html === "<p></p>") return 0;
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length;
}

function estimateReadingTime(wordCount: number): string {
    const minutes = Math.ceil(wordCount / 250);
    if (minutes < 1) return "Less than 1 min read";
    if (minutes === 1) return "1 min read";
    return `${minutes} min read`;
}

// ---- Component Props ----

interface RichTextEditorProps {
    initialContent?: string;
    onChange?: (html: string) => void;
    placeholder?: string;
    className?: string;
}

// ---- Component ----

export function RichTextEditor({
    initialContent = "",
    onChange,
    placeholder = "Start writing your post...",
    className,
}: RichTextEditorProps) {
    const [isSourceView, setIsSourceView] = React.useState(false);
    const [sourceHtml, setSourceHtml] = React.useState("");

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use CodeBlockLowlight instead
                heading: {
                    levels: [2, 3, 4, 5, 6],
                },
            }),
            UnderlineExtension,
            Placeholder.configure({
                placeholder,
                emptyEditorClass:
                    "before:content-[attr(data-placeholder)] before:text-zinc-400 dark:before:text-zinc-500 before:float-left before:h-0 before:pointer-events-none",
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer",
                },
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: "rounded-lg max-w-full h-auto mx-auto my-4",
                },
            }),
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: "rounded-lg bg-zinc-900 text-zinc-100 p-4 text-sm font-mono overflow-x-auto my-4",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            TextStyle,
            Color,
            Highlight.configure({
                HTMLAttributes: {
                    class: "bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5",
                },
            }),
            TableExtension.configure({
                resizable: true,
                HTMLAttributes: {
                    class: "border-collapse table-auto w-full my-4",
                },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: "border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-left",
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: "border border-zinc-300 dark:border-zinc-600 px-3 py-2 text-left font-bold bg-zinc-100 dark:bg-zinc-800",
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: "not-prose pl-0 list-none",
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: "flex items-start gap-2 my-1",
                },
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: "rounded-lg overflow-hidden my-4 mx-auto",
                },
                width: 640,
                height: 360,
            }),
        ],
        content: initialContent,
        editorProps: {
            attributes: {
                class: "tiptap-editor-content prose prose-zinc dark:prose-invert max-w-none min-h-[400px] px-6 py-4 outline-none focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
        // Prevent SSR issues
        immediatelyRender: false,
    });

    // Sync source view HTML when switching to source
    const handleToggleSource = React.useCallback(() => {
        if (!editor) return;
        if (!isSourceView) {
            // Switching TO source view: grab current HTML
            setSourceHtml(editor.getHTML());
        } else {
            // Switching BACK to editor: apply source HTML
            editor.commands.setContent(sourceHtml);
            onChange?.(sourceHtml);
        }
        setIsSourceView((prev) => !prev);
    }, [editor, isSourceView, sourceHtml, onChange]);

    const handleSourceChange = React.useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setSourceHtml(e.target.value);
        },
        []
    );

    // Calculate stats
    const html = editor?.getHTML() || "";
    const wordCount = countWordsFromHtml(isSourceView ? sourceHtml : html);
    const charCount = countCharsFromHtml(isSourceView ? sourceHtml : html);
    const readingTime = estimateReadingTime(wordCount);

    return (
        <div
            className={cn(
                "overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800",
                "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary",
                className
            )}
        >
            {/* Toolbar */}
            {!isSourceView && <EditorToolbar editor={editor} />}

            {/* Source / Visual Toggle bar */}
            {isSourceView && (
                <div className="flex items-center border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900 rounded-t-lg">
                    <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        HTML Source View
                    </span>
                </div>
            )}

            {/* Editor / Source View */}
            {isSourceView ? (
                <textarea
                    value={sourceHtml}
                    onChange={handleSourceChange}
                    className="w-full min-h-[400px] bg-zinc-950 text-emerald-400 font-mono text-sm p-4 outline-none resize-y border-none"
                    spellCheck={false}
                />
            ) : (
                <EditorContent editor={editor} />
            )}

            {/* Footer: Stats + Source Toggle */}
            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900 rounded-b-lg">
                <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        {wordCount.toLocaleString()} words
                    </span>
                    <span>{charCount.toLocaleString()} characters</span>
                    <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {readingTime}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleToggleSource}
                    className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                        "hover:bg-zinc-200 dark:hover:bg-zinc-700",
                        isSourceView
                            ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-600 dark:text-white"
                            : "text-zinc-500 dark:text-zinc-400"
                    )}
                    title={isSourceView ? "Switch to visual editor" : "View HTML source"}
                >
                    {isSourceView ? (
                        <>
                            <Eye className="h-3.5 w-3.5" />
                            Visual
                        </>
                    ) : (
                        <>
                            <Code className="h-3.5 w-3.5" />
                            Source
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
