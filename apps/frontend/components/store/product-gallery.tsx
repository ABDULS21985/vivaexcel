"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  ExternalLink,
  FileText,
  X,
  ZoomIn,
} from "lucide-react";
import type {
  DigitalProduct,
  DigitalProductPreview,
  DigitalProductPreviewType,
} from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface ProductGalleryProps {
  product: DigitalProduct;
}

interface GalleryItem {
  id: string;
  type: "image" | "video" | "pdf" | "demo";
  url: string;
  thumbnailUrl?: string;
}

// =============================================================================
// Helpers
// =============================================================================

function buildGalleryItems(product: DigitalProduct): GalleryItem[] {
  const items: GalleryItem[] = [];

  // Featured image first
  if (product.featuredImage) {
    items.push({
      id: "featured",
      type: "image",
      url: product.featuredImage,
    });
  }

  // Gallery images
  if (product.galleryImages?.length) {
    product.galleryImages.forEach((url, idx) => {
      items.push({
        id: `gallery-${idx}`,
        type: "image",
        url,
      });
    });
  }

  // Product previews
  if (product.previews?.length) {
    const sorted = [...product.previews].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    );
    sorted.forEach((preview) => {
      const typeMap: Record<string, GalleryItem["type"]> = {
        image: "image",
        pdf_preview: "pdf",
        video: "video",
        live_demo_url: "demo",
      };
      items.push({
        id: preview.id,
        type: typeMap[preview.type] || "image",
        url: preview.url,
        thumbnailUrl: preview.thumbnailUrl,
      });
    });
  }

  // Fallback if no images at all
  if (items.length === 0) {
    items.push({
      id: "placeholder",
      type: "image",
      url: "",
    });
  }

  return items;
}

function getPreviewIcon(type: GalleryItem["type"]) {
  switch (type) {
    case "video":
      return <Play className="h-4 w-4" />;
    case "pdf":
      return <FileText className="h-4 w-4" />;
    case "demo":
      return <ExternalLink className="h-4 w-4" />;
    default:
      return null;
  }
}

// =============================================================================
// Component
// =============================================================================

export function ProductGallery({ product }: ProductGalleryProps) {
  const galleryItems = buildGalleryItems(product);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Main carousel
  const [mainRef, mainApi] = useEmblaCarousel({
    loop: galleryItems.length > 1,
    align: "center",
  });

  // Thumbnail carousel
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  // Sync main carousel with selectedIndex
  const onMainSelect = useCallback(() => {
    if (!mainApi) return;
    const idx = mainApi.selectedScrollSnap();
    setSelectedIndex(idx);
    if (thumbApi) {
      thumbApi.scrollTo(idx);
    }
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    mainApi.on("select", onMainSelect);
    return () => {
      mainApi.off("select", onMainSelect);
    };
  }, [mainApi, onMainSelect]);

  const scrollPrev = useCallback(() => {
    if (mainApi) mainApi.scrollPrev();
  }, [mainApi]);

  const scrollNext = useCallback(() => {
    if (mainApi) mainApi.scrollNext();
  }, [mainApi]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (mainApi) mainApi.scrollTo(index);
      setSelectedIndex(index);
    },
    [mainApi],
  );

  const handleItemClick = (item: GalleryItem) => {
    if (item.type === "demo") {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else if (item.type === "image") {
      setLightboxOpen(true);
    }
  };

  const currentItem = galleryItems[selectedIndex];

  return (
    <div className="w-full">
      {/* Main Image Display */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 relative aspect-[4/3] cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {item.type === "image" && item.url ? (
                  <Image
                    src={item.url}
                    alt={`${product.title} - Image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority={idx === 0}
                  />
                ) : item.type === "video" ? (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-900">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-8 w-8 text-white ml-1" />
                    </div>
                  </div>
                ) : item.type === "pdf" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-neutral-800 dark:to-neutral-700">
                    <FileText className="h-16 w-16 text-red-500 mb-3" />
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      PDF Preview
                    </span>
                  </div>
                ) : item.type === "demo" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-neutral-800 dark:to-neutral-700">
                    <ExternalLink className="h-16 w-16 text-[#1E4DB7] mb-3" />
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                      Live Demo
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                    <span className="text-neutral-300 dark:text-neutral-600 text-7xl font-bold">
                      {product.title.charAt(0)}
                    </span>
                  </div>
                )}

                {/* Zoom hint overlay */}
                {item.type === "image" && item.url && (
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {galleryItems.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-neutral-900 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-neutral-900 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
          </>
        )}

        {/* Slide Counter */}
        {galleryItems.length > 1 && (
          <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">
              {selectedIndex + 1} / {galleryItems.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryItems.length > 1 && (
        <div className="overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2">
            {galleryItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onThumbClick(idx)}
                className={`flex-[0_0_auto] relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedIndex === idx
                    ? "border-[#1E4DB7] ring-2 ring-[#1E4DB7]/20 shadow-md"
                    : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                {item.type === "image" && item.url ? (
                  <Image
                    src={item.thumbnailUrl || item.url}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    {getPreviewIcon(item.type) || (
                      <span className="text-neutral-400 text-lg font-bold">
                        {product.title.charAt(0)}
                      </span>
                    )}
                  </div>
                )}

                {/* Type overlay for non-image items */}
                {item.type !== "image" && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="text-white">
                      {getPreviewIcon(item.type)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && currentItem?.type === "image" && currentItem.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentItem.url}
                alt={product.title}
                width={1200}
                height={900}
                className="object-contain w-full h-full max-h-[85vh] rounded-xl"
              />

              {/* Close Button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Lightbox Navigation */}
              {galleryItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollPrev();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      scrollNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductGallery;
