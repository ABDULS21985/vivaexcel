"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  List,
  Lock,
  ShoppingCart,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

export interface TOCItem {
  level: number;
  title: string;
  pageNumber?: number;
  children?: TOCItem[];
}

export interface DocumentInfo {
  pageCount: number;
  format?: string;
  fileSize?: string;
}

interface DocumentViewerProps {
  product: DigitalProduct;
  pageImages: string[];
  totalPages: number;
  freePreviewPages?: number;
  tableOfContents?: TOCItem[];
  documentInfo?: DocumentInfo;
  onPurchaseClick?: () => void;
  className?: string;
}

// =============================================================================
// TOC Tree Node
// =============================================================================

function TOCNode({
  item,
  onNavigate,
  activePageNumber,
}: {
  item: TOCItem;
  onNavigate: (page: number) => void;
  activePageNumber: number | null;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.pageNumber !== undefined && item.pageNumber === activePageNumber;

  return (
    <div>
      <button
        onClick={() => {
          if (item.pageNumber !== undefined) {
            onNavigate(item.pageNumber);
          }
          if (hasChildren) {
            setExpanded(!expanded);
          }
        }}
        className={cn(
          "w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded-md transition-colors",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
        )}
        style={{ paddingLeft: `${(item.level - 1) * 16 + 8}px` }}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        )}
        <span className="truncate flex-1">{item.title}</span>
        {item.pageNumber !== undefined && (
          <span className="text-xs text-neutral-400 tabular-nums flex-shrink-0">
            p.{item.pageNumber}
          </span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {item.children!.map((child, idx) => (
            <TOCNode
              key={idx}
              item={child}
              onNavigate={onNavigate}
              activePageNumber={activePageNumber}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DocumentViewer Component
// =============================================================================

export function DocumentViewer({
  product,
  pageImages,
  totalPages,
  freePreviewPages = 5,
  tableOfContents,
  documentInfo,
  onPurchaseClick,
  className,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [showToc, setShowToc] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Zoom controls
  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 25, 200)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 25, 50)), []);

  // Navigate to page
  const navigateToPage = useCallback((pageNum: number) => {
    const idx = pageNum - 1;
    const el = pageRefs.current[idx];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Track active page with IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pageNum = parseInt(
              entry.target.getAttribute("data-page") ?? "1",
              10,
            );
            setActivePage(pageNum);
          }
        }
      },
      {
        root: scrollContainerRef.current,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0,
      },
    );

    pageRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [pageImages.length]);

  // Scroll progress
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setScrollProgress(scrollTop / (scrollHeight - clientHeight || 1));
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "relative flex bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden",
        className,
      )}
      style={{ height: isDesktop ? "80vh" : "70vh" }}
    >
      {/* TOC Sidebar (desktop) */}
      <AnimatePresence>
        {showToc && isDesktop && tableOfContents && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto"
          >
            <div className="p-3">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Table of Contents
              </h3>
              {tableOfContents.map((item, idx) => (
                <TOCNode
                  key={idx}
                  item={item}
                  onNavigate={navigateToPage}
                  activePageNumber={activePage}
                />
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Thumbnail sidebar (desktop) */}
      <AnimatePresence>
        {showThumbnails && isDesktop && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 120, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 bg-neutral-50 dark:bg-neutral-850 border-r border-neutral-200 dark:border-neutral-700 overflow-y-auto"
          >
            <div className="p-2 space-y-2">
              {pageImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateToPage(idx + 1)}
                  className={cn(
                    "relative w-full aspect-[3/4] rounded-md overflow-hidden border-2 transition-all",
                    idx + 1 === activePage
                      ? "border-blue-500 ring-1 ring-blue-500/30"
                      : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600",
                  )}
                >
                  <Image
                    src={img}
                    alt={`Page ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] text-center py-0.5">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            {/* TOC toggle */}
            {tableOfContents && (
              <button
                onClick={() => {
                  setShowToc(!showToc);
                  if (showThumbnails) setShowThumbnails(false);
                }}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  showToc
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                )}
                aria-label="Toggle table of contents"
              >
                <List className="h-4 w-4" />
              </button>
            )}

            {/* Thumbnails toggle */}
            {isDesktop && (
              <button
                onClick={() => {
                  setShowThumbnails(!showThumbnails);
                  if (showToc) setShowToc(false);
                }}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  showThumbnails
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700",
                )}
                aria-label="Toggle page thumbnails"
              >
                <FileText className="h-4 w-4" />
              </button>
            )}

            {/* Page indicator */}
            <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
              Page {activePage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Document info */}
            {documentInfo && !isMobile && (
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {documentInfo.pageCount} pages
                {documentInfo.format && ` · ${documentInfo.format}`}
                {documentInfo.fileSize && ` · ${documentInfo.fileSize}`}
              </span>
            )}

            {/* Zoom controls */}
            <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-2 ml-1">
              <button
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums w-10 text-center">
                {zoom}%
              </span>
              <button
                onClick={zoomIn}
                disabled={zoom >= 200}
                className="p-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white disabled:opacity-30 transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scroll progress bar */}
        <div className="h-0.5 bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
          <div
            className="h-full bg-blue-500 transition-[width] duration-100"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        {/* Pages */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-auto"
        >
          <div className="flex flex-col items-center gap-4 py-6 px-4">
            {pageImages.map((img, idx) => {
              const pageNum = idx + 1;
              const isGated = pageNum > freePreviewPages;

              return (
                <div
                  key={idx}
                  ref={(el) => {
                    pageRefs.current[idx] = el;
                  }}
                  data-page={pageNum}
                  className="relative bg-white dark:bg-neutral-800 shadow-lg rounded-sm"
                  style={{
                    width: `${(zoom / 100) * 100}%`,
                    maxWidth: `${(zoom / 100) * 800}px`,
                  }}
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={img}
                      alt={`Page ${pageNum}`}
                      fill
                      className={cn(
                        "object-contain",
                        isGated && "blur-lg",
                      )}
                      sizes="(max-width: 768px) 100vw, 800px"
                    />

                    {/* Gated overlay */}
                    {isGated && (
                      <div className="absolute inset-0 bg-white/30 dark:bg-neutral-900/30 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <Lock className="h-8 w-8 text-neutral-400 mb-3" />
                        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          Preview ends here
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                          {totalPages - freePreviewPages} more pages available with purchase
                        </p>
                        {onPurchaseClick && (
                          <button
                            onClick={onPurchaseClick}
                            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Purchase to View All
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Page number badge */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-[10px] px-2 py-0.5 rounded-full">
                    {pageNum}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentViewer;
