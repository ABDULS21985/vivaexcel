"use client";

import * as React from "react";
import { Upload, X, File, Loader2, CheckCircle2 } from "lucide-react";
import { Button, cn } from "@digibit/ui/components";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/toast";

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    endpoint?: string;
    className?: string;
    label?: string;
    description?: string;
    accept?: string;
    maxSize?: number; // in bytes
}

export function FileUpload({
    value,
    onChange,
    onRemove,
    endpoint = "/upload",
    className,
    label = "Upload File",
    description,
    accept = "image/*",
    maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadProps) {
    const { success: toastSuccess, error: toastError } = useToast();
    const [isUploading, setIsUploading] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxSize) {
            toastError(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        try {
            const response = await apiClient.upload<{ data: { url: string } }>(endpoint, formData);
            const url = response.data.url;
            onChange(url);
            toastSuccess("File uploaded successfully");
        } catch (error) {
            console.error("Upload failed:", error);
            toastError("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleClear = () => {
        if (onRemove) {
            onRemove();
        } else {
            onChange("");
        }
    };

    return (
        <div className={cn("space-y-4 w-full", className)}>
            <div className="flex flex-col gap-1">
                {label && <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</span>}
                {description && <span className="text-xs text-zinc-500 dark:text-zinc-400">{description}</span>}
            </div>

            <div
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 group flex items-center justify-center min-h-40",
                    value
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-zinc-200 hover:border-[#1e4db7]/30 hover:bg-blue-50/30 bg-zinc-50/50",
                    isUploading && "opacity-60 cursor-not-allowed"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    className="hidden"
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                            <Loader2 className="h-10 w-10 animate-spin text-[#1e4db7]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-2 w-2 bg-[#1e4db7] rounded-full animate-pulse" />
                            </div>
                        </div>
                        <span className="text-sm font-bold text-[#1e4db7] tracking-tight">Uploading Assets...</span>
                    </div>
                ) : value ? (
                    <div className="flex flex-col items-center gap-4 w-full">
                        {accept.includes("image") ? (
                            <div className="relative group/image">
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-2xl transition-transform duration-500 group-hover/image:scale-105">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={value} alt="Uploaded file" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-[#1e4db7]/20 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                                        <CheckCircle2 className="text-white h-10 w-10 drop-shadow-lg" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-zinc-100 rounded-xl shadow-sm">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <File className="h-5 w-5 text-[#1e4db7]" />
                                </div>
                                <span className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">{value.split('/').pop()}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleButtonClick}
                                className="h-9 px-4 rounded-xl font-bold text-xs border-zinc-200 hover:border-[#1e4db7] hover:text-[#1e4db7] transition-all"
                            >
                                Change
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleClear}
                                className="h-9 px-4 rounded-xl font-bold text-xs text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
                            >
                                <X className="h-3.5 w-3.5 mr-1" />
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center gap-4 cursor-pointer w-full py-6 group/upload"
                        onClick={handleButtonClick}
                    >
                        <div className="h-14 w-14 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:border-[#1e4db7]/30 group-hover/upload:shadow-lg transition-all duration-300">
                            <Upload className="h-6 w-6 text-zinc-400 group-hover/upload:text-[#1e4db7] transition-colors" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-black text-zinc-900 tracking-tight">Click to upload media</p>
                            <p className="text-xs text-zinc-400 font-medium">PNG, JPG, GIF up to 10MB</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FileUpload;
