"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  MessageSquareText,
  Layers,
} from "lucide-react";
import type { SlidePreview } from "@/types/presentation";

// =============================================================================
// Types
// =============================================================================

interface SlideGalleryProps {
  slides: SlidePreview[];
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function SlideGallery({ slides, className = "" }: SlideGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);

  // Sort slides by slide number
  const sortedSlides = [...slides].sort(
    (a, b) => a.slideNumber - b.slideNumber,
  );

  // Main carousel
  const [mainRef, mainApi] = useEmblaCarousel({
    loop: sortedSlides.length > 1,
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

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      } else if (e.key === "Escape" && lightboxOpen) {
        setLightboxOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollPrev, scrollNext, lightboxOpen]);

  if (!sortedSlides.length) {
    return (
      <div
        className={`w-full aspect-[16/9] rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center ${className}`}
      >
        <div className="text-center">
          <Layers className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No slide previews available
          </p>
        </div>
      </div>
    );
  }

  const currentSlide = sortedSlides[selectedIndex];

  return (
    <div className={`w-full ${className}`}>
      {/* Main Slide Display */}
      <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 mb-3">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex">
            {sortedSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className="flex-[0_0_100%] min-w-0 relative aspect-[16/9] cursor-pointer"
                onClick={() => setLightboxOpen(true)}
              >
                {slide.thumbnailUrl ? (
                  <Image
                    src={slide.fullImageUrl || slide.thumbnailUrl}
                    alt={slide.title || `Slide ${slide.slideNumber}`}
                    fill
                    className="object-contain bg-white dark:bg-neutral-900"
                    sizes="(max-width: 768px) 100vw, 60vw"
                    priority={idx === 0}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700">
                    <span className="text-neutral-300 dark:text-neutral-600 text-7xl font-bold">
                      {slide.slideNumber}
                    </span>
                  </div>
                )}

                {/* Zoom hint overlay */}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ZoomIn className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {sortedSlides.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-neutral-900 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-neutral-900 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            </button>
          </>
        )}

        {/* Slide Counter + Speaker Notes Toggle */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
          {/* Speaker Notes Toggle */}
          {currentSlide?.speakerNotes && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSpeakerNotes(!showSpeakerNotes);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm transition-colors ${
                showSpeakerNotes
                  ? "bg-[#1E4DB7] text-white"
                  : "bg-black/50 text-white hover:bg-black/70"
              }`}
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              Notes
            </button>
          )}

          {/* Slide Counter */}
          <div className="px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-full ml-auto">
            <span className="text-white text-xs font-medium">
              Slide {selectedIndex + 1} of {sortedSlides.length}
            </span>
          </div>
        </div>
      </div>

      {/* Speaker Notes Panel */}
      <AnimatePresence>
        {showSpeakerNotes && currentSlide?.speakerNotes && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mb-3"
          >
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquareText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                  Speaker Notes
                </span>
              </div>
              <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                {currentSlide.speakerNotes}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thumbnail Strip */}
      {sortedSlides.length > 1 && (
        <div className="overflow-hidden" ref={thumbRef}>
          <div className="flex gap-2">
            {sortedSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => onThumbClick(idx)}
                className={`flex-[0_0_auto] relative w-20 h-12 md:w-24 md:h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  selectedIndex === idx
                    ? "border-[#1E4DB7] ring-2 ring-[#1E4DB7]/20 shadow-md"
                    : "border-transparent hover:border-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                {slide.thumbnailUrl ? (
                  <Image
                    src={slide.thumbnailUrl}
                    alt={`Slide ${slide.slideNumber}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    <span className="text-neutral-400 text-xs font-bold">
                      {slide.slideNumber}
                    </span>
                  </div>
                )}

                {/* Slide number overlay */}
                <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[8px] text-white font-bold">
                  {slide.slideNumber}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && currentSlide && (
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
              className="relative max-w-6xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {currentSlide.thumbnailUrl && (
                <Image
                  src={currentSlide.fullImageUrl || currentSlide.thumbnailUrl}
                  alt={
                    currentSlide.title ||
                    `Slide ${currentSlide.slideNumber}`
                  }
                  width={1920}
                  height={1080}
                  className="object-contain w-full h-full max-h-[85vh] rounded-xl"
                />
              )}

              {/* Close Button */}
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>

              {/* Lightbox Navigation */}
              {sortedSlides.length > 1 && (
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

              {/* Slide info bar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                <span className="text-white text-sm font-medium">
                  Slide {selectedIndex + 1} of {sortedSlides.length}
                </span>
                {currentSlide.title && (
                  <>
                    <div className="w-px h-4 bg-white/30" />
                    <span className="text-white/80 text-sm">
                      {currentSlide.title}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SlideGallery;
