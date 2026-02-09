"use client";

import { useState, useCallback, useEffect, useRef, type KeyboardEvent } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ExternalLink,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Volume2,
  VolumeX,
  Monitor,
  Tablet,
  Smartphone,
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

  if (product.featuredImage) {
    items.push({
      id: "featured",
      type: "image",
      url: product.featuredImage,
    });
  }

  if (product.galleryImages?.length) {
    product.galleryImages.forEach((url, idx) => {
      items.push({
        id: `gallery-${idx}`,
        type: "image",
        url,
      });
    });
  }

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

function getPreviewLabel(type: GalleryItem["type"]) {
  switch (type) {
    case "video":
      return "Video";
    case "pdf":
      return "PDF";
    case "demo":
      return "Demo";
    default:
      return "Image";
  }
}

// =============================================================================
// Image Zoom Component
// =============================================================================

function ZoomableImage({
  src,
  alt,
  priority,
  onOpenLightbox,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  onOpenLightbox: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    },
    [],
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden cursor-zoom-in group"
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={handleMouseMove}
      onClick={onOpenLightbox}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-200 ease-out"
        style={{
          transform: isZoomed ? "scale(2)" : "scale(1)",
          transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
        }}
        sizes="(max-width: 768px) 100vw, 60vw"
        priority={priority}
      />
      {/* Zoom hint */}
      <div className="absolute bottom-4 end-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
          <ZoomIn className="h-3.5 w-3.5 text-white" />
          <span className="text-xs text-white font-medium">
            Hover to zoom
          </span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Video Player Component
// =============================================================================

function VideoPlayer({ url, thumbnail }: { url: string; thumbnail?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!videoRef.current) return;
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    },
    [isPlaying],
  );

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!videoRef.current) return;
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    },
    [isMuted],
  );

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const pct =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
  }, []);

  const handleFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  }, []);

  return (
    <div
      className="relative w-full h-full bg-neutral-900 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(!isPlaying)}
    >
      <video
        ref={videoRef}
        src={url}
        poster={thumbnail}
        muted={isMuted}
        loop
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
      />

      {/* Play overlay (when paused) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
          >
            <Play className="h-8 w-8 text-white ms-1" />
          </motion.div>
        </div>
      )}

      {/* Custom controls */}
      <AnimatePresence>
        {(showControls || !isPlaying) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
          >
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/20 rounded-full mb-3 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 text-white" />
                ) : (
                  <Play className="h-4 w-4 text-white ms-0.5" />
                )}
              </button>
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-white" />
                ) : (
                  <Volume2 className="h-4 w-4 text-white" />
                )}
              </button>
              <div className="flex-1" />
              <button
                onClick={handleFullscreen}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Maximize2 className="h-4 w-4 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// Live Demo Component
// =============================================================================

function LiveDemoViewer({ url }: { url: string }) {
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const DeviceIcon = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
  };

  return (
    <div className="w-full h-full flex flex-col bg-neutral-100 dark:bg-neutral-800">
      {/* Device selector toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-200/80 dark:bg-neutral-700/80 backdrop-blur-sm border-b border-neutral-300 dark:border-neutral-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-1 bg-neutral-300/60 dark:bg-neutral-600/60 rounded-lg p-0.5">
          {(["desktop", "tablet", "mobile"] as const).map((d) => {
            const Icon = DeviceIcon[d];
            return (
              <button
                key={d}
                onClick={(e) => {
                  e.stopPropagation();
                  setDevice(d);
                }}
                className={`p-1.5 rounded-md transition-all ${
                  device === d
                    ? "bg-white dark:bg-neutral-800 shadow-sm text-[#1E4DB7]"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                }`}
                title={d.charAt(0).toUpperCase() + d.slice(1)}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E4DB7] hover:bg-[#143A8F] text-white text-xs font-medium rounded-lg transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </a>
      </div>

      {/* Iframe container */}
      <div className="flex-1 flex items-start justify-center p-4 overflow-hidden">
        <div
          className="h-full bg-white dark:bg-neutral-900 rounded-lg shadow-2xl overflow-hidden transition-all duration-500 ease-out"
          style={{
            width: deviceWidths[device],
            maxWidth: "100%",
          }}
        >
          <iframe
            src={url}
            title="Live demo preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Presentation Auto-Cycle
// =============================================================================

function usePresentationCycle(
  galleryItems: GalleryItem[],
  selectedIndex: number,
  mainApi: ReturnType<typeof useEmblaCarousel>[1],
  isPresentation: boolean,
) {
  const [isPaused, setIsPaused] = useState(false);
  const [cycleProgress, setCycleProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isPresentation || isPaused || !mainApi) return;

    const imageItems = galleryItems.filter((i) => i.type === "image");
    if (imageItems.length <= 1) return;

    setCycleProgress(0);
    progressRef.current = setInterval(() => {
      setCycleProgress((prev) => Math.min(prev + 100 / 30, 100));
    }, 100);

    intervalRef.current = setInterval(() => {
      mainApi.scrollNext();
      setCycleProgress(0);
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [isPresentation, isPaused, mainApi, galleryItems]);

  return { isPaused, setIsPaused, cycleProgress };
}

// =============================================================================
// Enhanced Lightbox
// =============================================================================

function Lightbox({
  items,
  currentIndex,
  onClose,
  onNavigate,
  productTitle,
}: {
  items: GalleryItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  productTitle: string;
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragStart, setDragStart] = useState<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        onNavigate(
          (currentIndex - 1 + items.length) % items.length,
        );
      if (e.key === "ArrowRight")
        onNavigate((currentIndex + 1) % items.length);
      if (e.key === "+" || e.key === "=")
        setZoomLevel((z) => Math.min(z + 0.5, 4));
      if (e.key === "-")
        setZoomLevel((z) => Math.max(z - 0.5, 1));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, items.length, onClose, onNavigate]);

  // Reset zoom on slide change
  useEffect(() => {
    setZoomLevel(1);
  }, [currentIndex]);

  const currentItem = items[currentIndex];

  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStart === null) return;
    const diff = e.changedTouches[0].clientX - dragStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        onNavigate(
          (currentIndex - 1 + items.length) % items.length,
        );
      } else {
        onNavigate((currentIndex + 1) % items.length);
      }
    }
    setDragStart(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 sm:px-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm font-medium">
            {currentIndex + 1} / {items.length}
          </span>
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => onNavigate(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "w-6 bg-white"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 1))}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4 text-white" />
          </button>
          <span className="text-white/60 text-xs font-mono min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 4))}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4 text-white" />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            title="Close (Esc)"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex items-center justify-center px-4 sm:px-16 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative max-w-5xl w-full flex items-center justify-center"
          >
            {currentItem?.type === "image" && currentItem.url && (
              <div className="overflow-auto max-h-[80vh] rounded-xl">
                <Image
                  src={currentItem.url}
                  alt={`${productTitle} - ${currentIndex + 1}`}
                  width={1400}
                  height={1050}
                  className="object-contain rounded-xl transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "center center",
                  }}
                />
              </div>
            )}
            {currentItem?.type === "video" && (
              <div className="w-full max-h-[80vh] aspect-video rounded-xl overflow-hidden">
                <VideoPlayer
                  url={currentItem.url}
                  thumbnail={currentItem.thumbnailUrl}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <>
            <button
              onClick={() =>
                onNavigate(
                  (currentIndex - 1 + items.length) % items.length,
                )
              }
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={() =>
                onNavigate((currentIndex + 1) % items.length)
              }
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="h-6 w-6 text-white" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ProductGallery({ product }: ProductGalleryProps) {
  const galleryItems = buildGalleryItems(product);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const isPresentation = product.type === "powerpoint";

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

  // Presentation auto-cycle
  const { isPaused, setIsPaused, cycleProgress } = usePresentationCycle(
    galleryItems,
    selectedIndex,
    mainApi,
    isPresentation,
  );

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (!galleryRef.current) return;
      const rect = galleryRef.current.getBoundingClientRect();
      const scrollProgress = -rect.top / (rect.height + window.innerHeight);
      setParallaxOffset(scrollProgress * 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    if (isPresentation) setIsPaused(true);
  }, [mainApi, isPresentation, setIsPaused]);

  const scrollNext = useCallback(() => {
    if (mainApi) mainApi.scrollNext();
    if (isPresentation) setIsPaused(true);
  }, [mainApi, isPresentation, setIsPaused]);

  const onThumbClick = useCallback(
    (index: number) => {
      if (mainApi) mainApi.scrollTo(index);
      setSelectedIndex(index);
      if (isPresentation) setIsPaused(true);
    },
    [mainApi, isPresentation, setIsPaused],
  );

  const handleItemClick = (item: GalleryItem) => {
    if (item.type === "demo") {
      window.open(item.url, "_blank", "noopener,noreferrer");
    } else {
      setLightboxOpen(true);
    }
  };

  const handleLightboxNavigate = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (mainApi) mainApi.scrollTo(index);
    },
    [mainApi],
  );

  const currentItem = galleryItems[selectedIndex];

  return (
    <div className="w-full" ref={galleryRef} role="region" aria-label="Product images">
      {/* Main Image Display */}
      <div
        className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3 shadow-lg group/gallery"
        aria-roledescription="carousel"
        aria-label="Product image gallery"
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollPrev();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollNext();
          }
        }}
        tabIndex={0}
      >
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex">
            {galleryItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex-[0_0_100%] min-w-0 relative aspect-[4/3]"
              >
                {item.type === "image" && item.url ? (
                  <div
                    className="w-full h-full"
                    style={{
                      transform: `translateY(${parallaxOffset}px)`,
                      transition: "transform 0.1s linear",
                    }}
                  >
                    <ZoomableImage
                      src={item.url}
                      alt={`${product.title} - Image ${idx + 1}`}
                      priority={idx === 0}
                      onOpenLightbox={() => setLightboxOpen(true)}
                    />
                  </div>
                ) : item.type === "video" ? (
                  <VideoPlayer url={item.url} thumbnail={item.thumbnailUrl} />
                ) : item.type === "pdf" ? (
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={() => handleItemClick(item)}
                  >
                    <iframe
                      src={`${item.url}#toolbar=0&navpanes=0`}
                      title="PDF Preview"
                      className="w-full h-full border-0"
                    />
                    {/* PDF overlay for click */}
                    <div className="absolute inset-0 bg-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-lg">
                        <FileText className="h-4 w-4 text-white" />
                        <span className="text-xs text-white font-medium">
                          PDF Preview
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.url, "_blank");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-lg text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-white transition-colors"
                      >
                        <Maximize2 className="h-3 w-3" />
                        Full Screen
                      </button>
                    </div>
                  </div>
                ) : item.type === "demo" ? (
                  <LiveDemoViewer url={item.url} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                    <span className="text-neutral-300 dark:text-neutral-600 text-7xl font-bold">
                      {product.title.charAt(0)}
                    </span>
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
              className="absolute start-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-300"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute end-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-0 group-hover/gallery:opacity-100 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-300"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
          </>
        )}

        {/* Slide Counter Badge */}
        {galleryItems.length > 1 && (
          <div className="absolute bottom-3 end-3 z-10 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-medium">
              {selectedIndex + 1} / {galleryItems.length}
            </span>
          </div>
        )}

        {/* Content type badge */}
        {currentItem && currentItem.type !== "image" && (
          <div className="absolute top-3 start-3 z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full">
              {getPreviewIcon(currentItem.type)}
              <span className="text-xs text-white font-medium">
                {getPreviewLabel(currentItem.type)}
              </span>
            </div>
          </div>
        )}

        {/* Presentation auto-cycle controls */}
        {isPresentation && galleryItems.filter((i) => i.type === "image").length > 1 && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white font-medium hover:bg-black/70 transition-colors"
            >
              {isPaused ? (
                <>
                  <Play className="h-3 w-3" /> Auto-play
                </>
              ) : (
                <>
                  <Pause className="h-3 w-3" /> Pause
                </>
              )}
            </button>
          </div>
        )}

        {/* Auto-cycle progress bar */}
        {isPresentation && !isPaused && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-10">
            <div
              className="h-full bg-white/80 transition-all duration-100 ease-linear"
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
        )}

        {/* Mobile dots indicator */}
        {galleryItems.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 md:hidden">
            {galleryItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => onThumbClick(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  selectedIndex === idx
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {galleryItems.length > 1 && (
        <div className="hidden md:block overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2">
            {galleryItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => onThumbClick(idx)}
                aria-label={`View image ${idx + 1} of ${galleryItems.length}`}
                aria-current={selectedIndex === idx ? "true" : undefined}
                className={`flex-[0_0_auto] relative w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                  selectedIndex === idx
                    ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-950 ring-[#1E4DB7] shadow-lg shadow-[#1E4DB7]/20 scale-105"
                    : "opacity-70 hover:opacity-100 hover:scale-[1.02]"
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
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-white">
                      {getPreviewIcon(item.type)}
                    </div>
                  </div>
                )}

                {/* Active indicator gradient border effect */}
                {selectedIndex === idx && (
                  <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
                    background: "linear-gradient(135deg, rgba(30,77,183,0.3) 0%, rgba(99,102,241,0.3) 50%, rgba(139,92,246,0.3) 100%)",
                  }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            items={galleryItems}
            currentIndex={selectedIndex}
            onClose={() => setLightboxOpen(false)}
            onNavigate={handleLightboxNavigate}
            productTitle={product.title}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductGallery;
