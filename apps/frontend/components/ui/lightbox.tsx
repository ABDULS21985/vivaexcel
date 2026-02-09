"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface LightboxImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface LightboxContextValue {
  images: LightboxImage[];
  registerImage: (image: LightboxImage) => number;
  unregisterImage: (src: string) => void;
  openLightbox: (index: number) => void;
}

interface LightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// Context for gallery mode
// =============================================================================

const LightboxContext = createContext<LightboxContextValue | undefined>(undefined);

export function useLightboxContext() {
  return useContext(LightboxContext);
}

export function LightboxGalleryProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const imagesRef = useRef<LightboxImage[]>([]);

  const registerImage = useCallback((image: LightboxImage): number => {
    // Prevent duplicates
    const existingIndex = imagesRef.current.findIndex((img) => img.src === image.src);
    if (existingIndex >= 0) {
      return existingIndex;
    }
    imagesRef.current = [...imagesRef.current, image];
    setImages([...imagesRef.current]);
    return imagesRef.current.length - 1;
  }, []);

  const unregisterImage = useCallback((src: string) => {
    imagesRef.current = imagesRef.current.filter((img) => img.src !== src);
    setImages([...imagesRef.current]);
  }, []);

  const openLightbox = useCallback((index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <LightboxContext.Provider
      value={{ images, registerImage, unregisterImage, openLightbox }}
    >
      {children}
      <Lightbox
        images={images}
        initialIndex={activeIndex}
        isOpen={isOpen}
        onClose={closeLightbox}
      />
    </LightboxContext.Provider>
  );
}

// =============================================================================
// Lightbox Component
// =============================================================================

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Sync index when initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
    }
  }, [initialIndex, isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Navigation
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setIsZoomed(false);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setIsZoomed(false);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen || images.length <= 1) return;

    const preloadIndices = [
      (currentIndex + 1) % images.length,
      (currentIndex - 1 + images.length) % images.length,
    ];

    preloadIndices.forEach((idx) => {
      const img = new Image();
      img.src = images[idx].src;
    });
  }, [currentIndex, isOpen, images]);

  // Click outside to close
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];
  const isGallery = images.length > 1;

  return (
    <AnimatePresence>
      {isOpen && currentImage && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.1 }}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </motion.button>

          {/* Image counter */}
          {isGallery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium tabular-nums"
            >
              {currentIndex + 1} / {images.length}
            </motion.div>
          )}

          {/* Previous button */}
          {isGallery && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 md:left-4 z-10 p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </motion.button>
          )}

          {/* Next button */}
          {isGallery && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 md:right-4 z-10 p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </motion.button>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex flex-col items-center max-w-[90vw] max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "relative overflow-hidden rounded-lg transition-transform duration-300",
                isZoomed ? "cursor-zoom-out scale-150" : "cursor-zoom-in"
              )}
              style={{ touchAction: "pinch-zoom" }}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentImage.src}
                alt={currentImage.alt}
                className="max-w-[90vw] max-h-[80vh] object-contain select-none"
                draggable={false}
              />
            </div>

            {/* Caption */}
            {currentImage.alt && currentImage.alt !== "image" && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mt-4 text-center text-white/80 text-sm max-w-lg px-4"
              >
                {currentImage.alt}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// Standalone Lightbox hook (for non-gallery usage)
// =============================================================================

export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<LightboxImage[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  const open = useCallback((imgs: LightboxImage[], index = 0) => {
    setImages(imgs);
    setInitialIndex(index);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, images, initialIndex, open, close };
}
