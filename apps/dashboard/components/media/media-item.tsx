"use client";

import * as React from "react";
import Image from "next/image";
import {
  File,
  Image as ImageIcon,
  FileText,
  Video,
  MoreVertical,
  Download,
  Trash2,
  Link2,
  Edit,
  Eye,
  Check,
} from "lucide-react";
import {
  cn,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@digibit/ui/components";

export interface MediaFile {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "other";
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  dimensions?: { width: number; height: number };
  alt?: string;
  createdAt: string;
  updatedAt: string;
  folderId?: string;
}

export interface MediaItemProps {
  file: MediaFile;
  isSelected?: boolean;
  selectionMode?: boolean;
  viewMode?: "grid" | "list";
  onSelect?: (file: MediaFile) => void;
  onView?: (file: MediaFile) => void;
  onEdit?: (file: MediaFile) => void;
  onDelete?: (file: MediaFile) => void;
  onCopyUrl?: (file: MediaFile) => void;
  onDownload?: (file: MediaFile) => void;
}

const getFileIcon = (type: string) => {
  switch (type) {
    case "image":
      return ImageIcon;
    case "video":
      return Video;
    case "document":
      return FileText;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function MediaItem({
  file,
  isSelected = false,
  selectionMode = false,
  viewMode = "grid",
  onSelect,
  onView,
  onEdit,
  onDelete,
  onCopyUrl,
  onDownload,
}: MediaItemProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const FileIcon = getFileIcon(file.type);
  const showThumbnail = file.type === "image" && (file.thumbnailUrl || file.url) && !imageError;

  const handleClick = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onSelect?.(file);
    } else {
      onView?.(file);
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(file);
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors",
          isSelected
            ? "bg-primary/10 dark:bg-primary/20"
            : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            "h-5 w-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
            isSelected
              ? "bg-primary border-primary"
              : "border-zinc-300 dark:border-zinc-600 hover:border-primary"
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-white" />}
        </button>

        {/* Thumbnail */}
        <div className="h-12 w-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {showThumbnail ? (
            <Image
              src={file.thumbnailUrl || file.url}
              alt={file.alt || file.name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <FileIcon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
            {file.name}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatFileSize(file.size)} - {formatDate(file.createdAt)}
          </p>
        </div>

        {/* Dimensions (for images) */}
        {file.dimensions && (
          <div className="hidden sm:block text-xs text-zinc-500 dark:text-zinc-400">
            {file.dimensions.width} x {file.dimensions.height}
          </div>
        )}

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView?.(file)}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(file)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopyUrl?.(file)}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload?.(file)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(file)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative rounded-xl overflow-hidden cursor-pointer transition-all",
        isSelected
          ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-zinc-900"
          : "hover:shadow-lg"
      )}
    >
      {/* Thumbnail area */}
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative">
        {showThumbnail ? (
          <Image
            src={file.thumbnailUrl || file.url}
            alt={file.alt || file.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileIcon className="h-12 w-12 text-zinc-400 dark:text-zinc-500" />
          </div>
        )}

        {/* Selection checkbox */}
        <button
          onClick={handleCheckboxClick}
          className={cn(
            "absolute top-2 left-2 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-all z-10",
            isSelected
              ? "bg-primary border-primary opacity-100"
              : "border-white/80 bg-black/20 opacity-0 group-hover:opacity-100"
          )}
        >
          {isSelected && <Check className="h-4 w-4 text-white" />}
        </button>

        {/* Actions menu */}
        <div
          className={cn(
            "absolute top-2 right-2 transition-opacity z-10",
            isHovered || isSelected ? "opacity-100" : "opacity-0"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="h-7 w-7 p-0 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(file)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(file)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopyUrl?.(file)}>
                <Link2 className="h-4 w-4 mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDownload?.(file)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(file)}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Hover overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity",
            isHovered && !selectionMode ? "opacity-100" : "opacity-0"
          )}
        >
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              onView?.(file);
            }}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      {/* File info */}
      <div className="p-3 bg-white dark:bg-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
          {file.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {formatFileSize(file.size)}
          </p>
          {file.dimensions && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {file.dimensions.width}x{file.dimensions.height}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaItem;
