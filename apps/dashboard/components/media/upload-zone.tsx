"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Upload, X, File, Image, FileText, Video, AlertCircle } from "lucide-react";
import { cn, Button } from "@digibit/ui/components";

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: "pending" | "uploading" | "complete" | "error";
  error?: string;
}

export interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  maxSize?: number; // in bytes
  maxFiles?: number;
  className?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.startsWith("video/")) return Video;
  if (type === "application/pdf") return FileText;
  return File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function UploadZone({
  onUpload,
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 10,
  className,
}: UploadZoneProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const simulateUpload = useCallback(
    (files: UploadFile[]) => {
      files.forEach((uploadFile) => {
        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((f) => {
              if (f.id !== uploadFile.id) return f;
              if (f.progress >= 100) {
                clearInterval(interval);
                return { ...f, status: "complete" as const, progress: 100 };
              }
              return {
                ...f,
                status: "uploading" as const,
                progress: Math.min(f.progress + Math.random() * 20, 100),
              };
            })
          );
        }, 200);

        // Complete after ~2 seconds
        setTimeout(() => {
          clearInterval(interval);
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "complete" as const, progress: 100 }
                : f
            )
          );
        }, 2000);
      });

      // Notify parent after all uploads complete
      setTimeout(() => {
        onUpload(files.map((f) => f.file));
        setUploadingFiles([]);
      }, 2500);
    },
    [onUpload]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setError(null);

      if (rejectedFiles.length > 0) {
        const firstError = rejectedFiles[0].errors[0];
        if (firstError.code === "file-too-large") {
          setError(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
        } else if (firstError.code === "too-many-files") {
          setError(`Too many files. Maximum is ${maxFiles} files at once`);
        } else {
          setError(firstError.message);
        }
        return;
      }

      const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substring(2, 9),
        progress: 0,
        status: "pending" as const,
      }));

      setUploadingFiles(newFiles);
      simulateUpload(newFiles);
    },
    [maxSize, maxFiles, simulateUpload]
  );

  const removeFile = (id: string) => {
    setUploadingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
      "application/pdf": [".pdf"],
      "video/*": [".mp4", ".webm", ".mov"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize,
    maxFiles,
    noClick: uploadingFiles.length > 0,
    noKeyboard: uploadingFiles.length > 0,
  });

  const isUploading = uploadingFiles.some((f) => f.status === "uploading" || f.status === "pending");

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          isDragActive
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : "border-zinc-300 dark:border-zinc-600 hover:border-primary dark:hover:border-primary",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-zinc-400 dark:text-zinc-500 mb-4" />
        <p className="text-lg font-medium text-zinc-900 dark:text-white">
          {isDragActive ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          or click to browse
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
          Supports images, videos, PDFs, and documents up to {formatFileSize(maxSize)}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
          >
            <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      )}

      {/* Upload progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-zinc-900 dark:text-white">
              Uploading {uploadingFiles.length} file{uploadingFiles.length > 1 ? "s" : ""}
            </h4>
            {!isUploading && (
              <Button variant="ghost" size="sm" onClick={() => setUploadingFiles([])}>
                Clear all
              </Button>
            )}
          </div>

          {uploadingFiles.map((uploadFile) => {
            const FileIcon = getFileIcon(uploadFile.file.type);
            return (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
              >
                <div className="h-10 w-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <FileIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                    {uploadFile.file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-300",
                          uploadFile.status === "error"
                            ? "bg-red-500"
                            : uploadFile.status === "complete"
                            ? "bg-emerald-500"
                            : "bg-primary"
                        )}
                        style={{ width: `${uploadFile.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 w-10 text-right">
                      {uploadFile.status === "complete"
                        ? "Done"
                        : uploadFile.status === "error"
                        ? "Error"
                        : `${Math.round(uploadFile.progress)}%`}
                    </span>
                  </div>
                </div>
                {uploadFile.status !== "uploading" && (
                  <button
                    onClick={() => removeFile(uploadFile.id)}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                  >
                    <X className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UploadZone;
