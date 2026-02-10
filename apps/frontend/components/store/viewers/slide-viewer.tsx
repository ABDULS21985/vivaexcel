"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Grid3X3,
  StickyNote,
  ZoomIn,
  ZoomOut,
  ShoppingCart,
  Lock,
  X,
} from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useAutoCycle } from "@/hooks/use-auto-cycle";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useSwipeAction } from "@/hooks/use-swipe-action";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

export interface SlideData {
  id: string;
  url: string;
  thumbnailUrl?: string;
  label?: string;
  notes?: string;
  width?: number;
  height?: number;
}

interface SlideViewerProps {
  product: DigitalProduct;
  slides: SlideData[];
  aspectRatio?: number;
  onPurchaseClick?: () => void;
  className?: string;
}

// =============================================================================
// SlideViewer Component
// =============================================================================

export function SlideViewer({
  product,
  slides,
  aspectRatio = 16 / 9,
  onPurchaseClick,
  className,
}: SlideViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [zoom, setZoom] = useState<"fit" | "actual">("fit");
  const [uniqueViewed, setUniqueViewed] = useState(new Set<number>());
  const [showPurchaseCta, setShowPurchaseCta] = useState(false);
  const [ctaDismissed, setCtaDismissed] = useState(false);

  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef);

  const {
    current: currentSlide,
    isPlaying,
    goTo,
    next,
    prev,
    toggle: toggleAutoPlay,
    progress,
  } = useAutoCycle({
    total: slides.length,
    interval: 3000,
    autoStart: false,
  });

  // Thumbnail carousel
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: "trimSnaps",
    dragFree: true,
    align: "center",
  });

  // Track unique slides viewed
  useEffect(() => {
    setUniqueViewed((prev) => new Set(prev).add(currentSlide));
  }, [currentSlide]);

  // Show purchase CTA after 5 unique slides
  useEffect(() => {
    if (uniqueViewed.size >= 5 && !ctaDismissed && onPurchaseClick) {
      setShowPurchaseCta(true);
    }
  }, [uniqueViewed.size, ctaDismissed, onPurchaseClick]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (thumbApi) {
      thumbApi.scrollTo(currentSlide);
    }
  }, [currentSlide, thumbApi]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          next();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "Escape":
          if (showGrid) setShowGrid(false);
          break;
        case "g":
        case "G":
          setShowGrid((v) => !v);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [next, prev, toggleFullscreen, showGrid]);

  // Mobile swipe
  const { bindEvents: swipeEvents } = useSwipeAction({
    onSwipeLeft: next,
    onSwipeRight: prev,
    threshold: 50,
  });

  const currentSlideData = slides[currentSlide];
  const hasNotes = slides.some((s) => s.notes);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col bg-neutral-900 rounded-xl overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className,
      )}
    >
      {/* Main slide area */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-4 lg:p-8">
        {/* Notes sidebar (desktop only) */}
        <AnimatePresence>
          {showNotes && isDesktop && hasNotes && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.3 }}
              className="absolute right-0 top-0 bottom-0 bg-neutral-800 border-l border-neutral-700 overflow-y-auto z-10"
            >
              <div className="p-4">
                <h3 className="text-sm font-semibold text-neutral-300 mb-2">
                  Speaker Notes
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap">
                  {currentSlideData?.notes || "No notes for this slide."}
                </p>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Grid view */}
        <AnimatePresence>
          {showGrid && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/95 z-20 overflow-y-auto p-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-6xl mx-auto">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => {
                      goTo(idx);
                      setShowGrid(false);
                    }}
                    className={cn(
                      "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                      idx === currentSlide
                        ? "border-blue-500 ring-2 ring-blue-500/30"
                        : "border-neutral-700 hover:border-neutral-500",
                    )}
                  >
                    <Image
                      src={slide.thumbnailUrl || slide.url}
                      alt={slide.label || `Slide ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowGrid(false)}
                className="fixed top-4 right-4 text-white bg-neutral-800 rounded-full p-2 hover:bg-neutral-700 z-30"
                aria-label="Close grid view"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Slide image */}
        <div
          className={cn(
            "relative w-full",
            zoom === "fit" ? "max-w-4xl" : "max-w-none",
          )}
          style={{
            aspectRatio: `${aspectRatio}`,
          }}
          {...(isMobile ? swipeEvents : {})}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={reducedMotion ? {} : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reducedMotion ? {} : { opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full h-full"
            >
              {currentSlideData && (
                <Image
                  src={currentSlideData.url}
                  alt={currentSlideData.label || `Slide ${currentSlide + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority={currentSlide === 0}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Watermark overlay */}
          <div
            className="absolute inset-0 pointer-events-none select-none z-10"
            aria-hidden="true"
            style={{
              background:
                "repeating-linear-gradient(-45deg, transparent, transparent 80px, rgba(128,128,128,0.03) 80px, rgba(128,128,128,0.03) 81px)",
            }}
          />

          {/* Navigation arrows */}
          {!isMobile && slides.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Purchase CTA overlay */}
        <AnimatePresence>
          {showPurchaseCta && !ctaDismissed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
                <Lock className="h-10 w-10 text-neutral-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                  Like what you see?
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                  Get full access to all {slides.length} slides with purchase.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setCtaDismissed(true)}
                    className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                  >
                    Continue Preview
                  </button>
                  <button
                    onClick={onPurchaseClick}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-t border-neutral-700">
        <div className="flex items-center gap-2">
          {/* Auto-play */}
          <button
            onClick={toggleAutoPlay}
            className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-700"
            aria-label={isPlaying ? "Pause auto-play" : "Start auto-play"}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          {/* Progress bar */}
          {isPlaying && (
            <div className="w-16 h-1 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-none"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}

          {/* Slide counter */}
          <span className="text-xs text-neutral-400 tabular-nums ml-1">
            {currentSlide + 1} / {slides.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Grid toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={cn(
              "p-1.5 rounded-md transition-colors",
              showGrid
                ? "text-blue-400 bg-blue-500/10"
                : "text-neutral-400 hover:text-white hover:bg-neutral-700",
            )}
            aria-label="Toggle grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </button>

          {/* Speaker notes toggle (desktop only) */}
          {hasNotes && isDesktop && (
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                showNotes
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-700",
              )}
              aria-label="Toggle speaker notes"
            >
              <StickyNote className="h-4 w-4" />
            </button>
          )}

          {/* Zoom */}
          <button
            onClick={() => setZoom(zoom === "fit" ? "actual" : "fit")}
            className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-700"
            aria-label={zoom === "fit" ? "Actual size" : "Fit to width"}
          >
            {zoom === "fit" ? <ZoomIn className="h-4 w-4" /> : <ZoomOut className="h-4 w-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-neutral-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-neutral-700"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Thumbnail strip */}
      {!showGrid && slides.length > 1 && (
        <div className="bg-neutral-800/80 border-t border-neutral-700 px-2 py-2">
          <div className="overflow-hidden" ref={thumbRef}>
            <div className="flex gap-1.5">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => goTo(idx)}
                  className={cn(
                    "relative flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                    "w-16 h-9 lg:w-20 lg:h-[45px]",
                    idx === currentSlide
                      ? "border-blue-500 ring-1 ring-blue-500/30"
                      : "border-transparent hover:border-neutral-500 opacity-60 hover:opacity-100",
                  )}
                >
                  <Image
                    src={slide.thumbnailUrl || slide.url}
                    alt={`Slide ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile dot indicators */}
      {isMobile && slides.length > 1 && slides.length <= 20 && (
        <div className="flex justify-center gap-1 pb-2 bg-neutral-800">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                idx === currentSlide
                  ? "bg-blue-500 w-3"
                  : "bg-neutral-600 hover:bg-neutral-500",
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SlideViewer;
