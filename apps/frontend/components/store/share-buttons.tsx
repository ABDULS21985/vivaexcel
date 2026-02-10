"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link2, Twitter, MessageCircle, Mail } from "lucide-react";
import { cn } from "@ktblog/ui/components";

// =============================================================================
// Types
// =============================================================================

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function ShareButtons({ url, title, className }: ShareButtonsProps) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleShareTwitter = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer,width=550,height=420");
  }, [url, title]);

  const handleShareWhatsApp = useCallback(() => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, [url, title]);

  const mailtoHref = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${title}\n\n${url}`)}`;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        aria-label={copied ? t("copied") : t("copyLink")}
        className={cn(
          "inline-flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 transition-all duration-200",
          copied
            ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
            : "hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300",
        )}
      >
        {copied ? (
          <span className="text-[10px] font-bold">{t("copied")}</span>
        ) : (
          <Link2 className="h-4 w-4" />
        )}
      </button>

      {/* Twitter / X */}
      <button
        onClick={handleShareTwitter}
        aria-label={t("shareOnTwitter")}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-all duration-200"
      >
        <Twitter className="h-4 w-4" />
      </button>

      {/* WhatsApp */}
      <button
        onClick={handleShareWhatsApp}
        aria-label={t("shareOnWhatsApp")}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-all duration-200"
      >
        <MessageCircle className="h-4 w-4" />
      </button>

      {/* Email */}
      <a
        href={mailtoHref}
        aria-label={t("shareViaEmail")}
        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 transition-all duration-200"
      >
        <Mail className="h-4 w-4" />
      </a>
    </div>
  );
}

export default ShareButtons;
