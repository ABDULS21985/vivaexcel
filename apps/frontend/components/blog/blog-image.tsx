"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { cn } from "@ktblog/ui/lib/utils";
import { useLightboxContext, type LightboxImage } from "@/components/ui/lightbox";

// =============================================================================
// Types
// =============================================================================

interface BlogImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  caption?: string;
}

// =============================================================================
// BlogImage - Click-to-zoom wrapper for blog content images
// =============================================================================

export function BlogImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  caption,
}: BlogImageProps) {
  const lightbox = useLightboxContext();
  const indexRef = useRef<number>(-1);
  const registeredRef = useRef(false);

  // Register with gallery context
  useEffect(() => {
    if (lightbox && !registeredRef.current) {
      const image: LightboxImage = { src, alt, width, height };
      indexRef.current = lightbox.registerImage(image);
      registeredRef.current = true;
    }

    return () => {
      if (lightbox && registeredRef.current) {
        lightbox.unregisterImage(src);
        registeredRef.current = false;
      }
    };
  }, [lightbox, src, alt, width, height]);

  const handleClick = useCallback(() => {
    if (lightbox) {
      // Find the current index (it may shift as images register/unregister)
      const currentIdx = lightbox.images.findIndex((img) => img.src === src);
      lightbox.openLightbox(currentIdx >= 0 ? currentIdx : 0);
    }
  }, [lightbox, src]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <figure className={cn("my-8 group", className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="relative cursor-zoom-in rounded-2xl overflow-hidden shadow-lg border border-neutral-100 dark:border-neutral-800 transition-all duration-300 group-hover:shadow-xl"
        aria-label={`View full-size image: ${alt}`}
      >
        {/* Image */}
        <Image
          src={src}
          alt={alt}
          width={width || 800}
          height={height || 450}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 800px"
        />

        {/* Zoom overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="p-3 rounded-full bg-white/90 dark:bg-neutral-900/90 shadow-lg backdrop-blur-sm">
              <ZoomIn className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      {(caption || alt) && caption !== undefined && (
        <figcaption className="mt-3 text-center text-sm text-neutral-500 dark:text-neutral-400 italic">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}
