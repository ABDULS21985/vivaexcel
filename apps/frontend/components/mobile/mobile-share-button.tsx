"use client";

// =============================================================================
// Mobile Share Button
// =============================================================================
// A circular share button for mobile product detail pages. Uses the native
// Web Share API when available, falling back to a small popover with copy-link
// and social sharing icons. Includes a brief inline toast for copy confirmation.

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Link2,
  Check,
  X,
} from "lucide-react";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

export interface MobileShareButtonProps {
  /** The title to share (used by Web Share API / social meta) */
  title: string;
  /** A short description text for the share content */
  text: string;
  /** The URL to share */
  url: string;
  /** Additional CSS classes for the button wrapper */
  className?: string;
}

// =============================================================================
// Constants
// =============================================================================

/** Duration (ms) to show the "Copied!" confirmation */
const COPY_TOAST_DURATION = 2000;

/** Popover entrance/exit animation */
const POPOVER_VARIANTS = {
  hidden: { opacity: 0, scale: 0.9, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 8 },
};

const POPOVER_TRANSITION = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

// =============================================================================
// Social share URL builders
// =============================================================================

function getTwitterShareUrl(url: string, text: string): string {
  const params = new URLSearchParams({ url, text });
  return `https://x.com/intent/tweet?${params.toString()}`;
}

function getFacebookShareUrl(url: string): string {
  const params = new URLSearchParams({ u: url });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}

function getLinkedInShareUrl(url: string, title: string): string {
  const params = new URLSearchParams({ url, title });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

function getWhatsAppShareUrl(url: string, text: string): string {
  const message = `${text} ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// =============================================================================
// Social icon components (inline SVGs to avoid extra dependencies)
// =============================================================================

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 1.09.044 1.613.115v3.146c-.427-.044-.927-.065-1.523-.065-2.163 0-3.001.82-3.001 2.96v1.402h4.314l-.74 3.667h-3.574v7.98z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// =============================================================================
// Component
// =============================================================================

export function MobileShareButton({
  title,
  text,
  url,
  className,
}: MobileShareButtonProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [copied, setCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Close popover on outside click
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!showPopover) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPopover]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleShare = useCallback(async () => {
    // Use native Web Share API if available
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        // User cancelled or share failed silently
        if (err instanceof Error && err.name !== "AbortError") {
          // Fall back to popover on unexpected errors
          setShowPopover(true);
        }
      }
      return;
    }

    // Fallback: toggle the custom popover
    setShowPopover((prev) => !prev);
  }, [title, text, url]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, COPY_TOAST_DURATION);
    } catch {
      // Clipboard API not available — attempt legacy fallback
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        copyTimerRef.current = setTimeout(() => {
          setCopied(false);
        }, COPY_TOAST_DURATION);
      } catch {
        // Could not copy
      }
      document.body.removeChild(textarea);
    }
  }, [url]);

  const handleSocialClick = useCallback(
    (socialUrl: string) => {
      window.open(socialUrl, "_blank", "noopener,noreferrer,width=600,height=500");
      setShowPopover(false);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // Social share items
  // ---------------------------------------------------------------------------

  const socialItems = [
    {
      label: "Twitter",
      icon: TwitterIcon,
      url: getTwitterShareUrl(url, text),
      hoverColor: "hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black",
    },
    {
      label: "Facebook",
      icon: FacebookIcon,
      url: getFacebookShareUrl(url),
      hoverColor: "hover:bg-[#1877F2] hover:text-white",
    },
    {
      label: "LinkedIn",
      icon: LinkedInIcon,
      url: getLinkedInShareUrl(url, title),
      hoverColor: "hover:bg-[#0A66C2] hover:text-white",
    },
    {
      label: "WhatsApp",
      icon: WhatsAppIcon,
      url: getWhatsAppShareUrl(url, text),
      hoverColor: "hover:bg-[#25D366] hover:text-white",
    },
  ];

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className={cn("relative inline-flex", className)}>
      {/* Main share button */}
      <motion.button
        ref={buttonRef}
        onClick={handleShare}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "flex items-center justify-center",
          "w-10 h-10 rounded-full",
          "bg-gray-100 dark:bg-gray-800",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "text-neutral-600 dark:text-neutral-400",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4DB7]",
        )}
        aria-label="Share this product"
        aria-haspopup="true"
        aria-expanded={showPopover}
      >
        <Share2 className="h-4 w-4" />
      </motion.button>

      {/* Fallback popover (when Web Share API is unavailable) */}
      <AnimatePresence>
        {showPopover && (
          <motion.div
            ref={popoverRef}
            variants={POPOVER_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={POPOVER_TRANSITION}
            className={cn(
              "absolute bottom-full right-0 mb-2",
              "w-56 p-3",
              "bg-white dark:bg-gray-900",
              "border border-neutral-200 dark:border-neutral-700",
              "rounded-xl shadow-xl",
              "z-50",
            )}
            role="dialog"
            aria-label="Share options"
          >
            {/* Close button */}
            <button
              onClick={() => setShowPopover(false)}
              className="absolute top-2 right-2 p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              aria-label="Close share options"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 rounded-lg",
                "text-sm font-medium transition-colors duration-150",
                copied
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800",
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <span>Link copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-4 w-4 flex-shrink-0" />
                  <span>Copy link</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="my-2 h-px bg-neutral-100 dark:bg-neutral-800" />

            {/* Social icons row */}
            <div className="flex items-center justify-center gap-2">
              {socialItems.map((item) => {
                const SocialIcon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleSocialClick(item.url)}
                    className={cn(
                      "flex items-center justify-center",
                      "w-9 h-9 rounded-lg",
                      "bg-neutral-100 dark:bg-neutral-800",
                      "text-neutral-600 dark:text-neutral-400",
                      "transition-all duration-150",
                      item.hoverColor,
                    )}
                    aria-label={`Share on ${item.label}`}
                    title={`Share on ${item.label}`}
                  >
                    <SocialIcon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileShareButton;
