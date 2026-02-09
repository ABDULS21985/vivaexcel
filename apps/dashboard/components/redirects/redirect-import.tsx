"use client";

import * as React from "react";
import { Button, cn } from "@ktblog/ui/components";
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2 } from "lucide-react";

export interface ImportedRedirect {
    source: string;
    destination: string;
    type: "301" | "302";
    isValid: boolean;
    error?: string;
}

interface RedirectImportProps {
    onImport: (redirects: ImportedRedirect[]) => Promise<void>;
    existingSources: string[];
    isLoading?: boolean;
}

function parseCSV(text: string, existingSources: string[]): ImportedRedirect[] {
    const lines = text.trim().split("\n");
    const results: ImportedRedirect[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip header row
        if (i === 0 && (line.toLowerCase().includes("source") || line.toLowerCase().includes("destination"))) {
            continue;
        }

        const parts = line.split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const [source, destination, type] = parts;

        let isValid = true;
        let error: string | undefined;

        if (!source || !destination) {
            isValid = false;
            error = "Source and destination are required";
        } else if (!source.startsWith("/")) {
            isValid = false;
            error = "Source must start with /";
        } else if (
            !destination.startsWith("/") &&
            !destination.startsWith("http://") &&
            !destination.startsWith("https://")
        ) {
            isValid = false;
            error = "Invalid destination URL";
        } else if (existingSources.includes(source)) {
            isValid = false;
            error = "Source URL already exists";
        } else if (source === destination) {
            isValid = false;
            error = "Source and destination are the same";
        }

        const redirectType = type === "302" ? "302" : "301";

        results.push({
            source: source || "",
            destination: destination || "",
            type: redirectType,
            isValid,
            error,
        });
    }

    return results;
}

export function RedirectImport({
    onImport,
    existingSources,
    isLoading = false,
}: RedirectImportProps) {
    const [isDragging, setIsDragging] = React.useState(false);
    const [parsed, setParsed] = React.useState<ImportedRedirect[] | null>(null);
    const [fileName, setFileName] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.name.endsWith(".csv") && !file.name.endsWith(".txt")) {
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                const results = parseCSV(text, existingSources);
                setParsed(results);
            }
        };
        reader.readAsText(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    const handleImport = async () => {
        if (!parsed) return;
        const validRedirects = parsed.filter((r) => r.isValid);
        if (validRedirects.length > 0) {
            await onImport(validRedirects);
            setParsed(null);
            setFileName(null);
        }
    };

    const clearImport = () => {
        setParsed(null);
        setFileName(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validCount = parsed?.filter((r) => r.isValid).length || 0;
    const errorCount = parsed?.filter((r) => !r.isValid).length || 0;

    return (
        <div className="space-y-4">
            {!parsed ? (
                <>
                    {/* Drop zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-zinc-300 dark:border-zinc-600 hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        )}
                    >
                        <Upload className="h-8 w-8 text-zinc-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Drop your CSV file here or click to browse
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Format: source,destination,type (301/302)
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.txt"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Example format */}
                    <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700">
                        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">CSV Format Example:</p>
                        <pre className="text-xs font-mono text-zinc-700 dark:text-zinc-300 overflow-x-auto">
{`source,destination,type
/old-post,/new-post,301
/temp-page,/landing,302
/blog/2023/article,/blog/article,301`}
                        </pre>
                    </div>
                </>
            ) : (
                <>
                    {/* Preview */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-zinc-500" />
                            <div>
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{fileName}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {parsed.length} redirect{parsed.length !== 1 ? "s" : ""} found
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearImport}
                            className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <X className="h-4 w-4 text-zinc-500" />
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="flex items-center gap-4 text-sm">
                        {validCount > 0 && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle className="h-4 w-4" />
                                <span>{validCount} valid</span>
                            </div>
                        )}
                        {errorCount > 0 && (
                            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                                <AlertCircle className="h-4 w-4" />
                                <span>{errorCount} error{errorCount !== 1 ? "s" : ""}</span>
                            </div>
                        )}
                    </div>

                    {/* Table preview */}
                    <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-700/50 sticky top-0">
                                <tr>
                                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Source</th>
                                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Destination</th>
                                    <th className="text-left px-3 py-2 font-medium text-zinc-500 dark:text-zinc-400">Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                {parsed.map((r, i) => (
                                    <tr
                                        key={i}
                                        className={cn(
                                            !r.isValid && "bg-red-50 dark:bg-red-900/10"
                                        )}
                                    >
                                        <td className="px-3 py-2">
                                            {r.isValid ? (
                                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                                    <span className="text-red-600 dark:text-red-400 truncate">{r.error}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 font-mono text-zinc-700 dark:text-zinc-300">{r.source}</td>
                                        <td className="px-3 py-2 font-mono text-zinc-700 dark:text-zinc-300">{r.destination}</td>
                                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{r.type}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={clearImport} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={validCount === 0 || isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Import {validCount} Redirect{validCount !== 1 ? "s" : ""}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}

export default RedirectImport;
