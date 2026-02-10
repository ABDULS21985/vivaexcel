"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  LayoutGrid,
  ShoppingBag,
  Sun,
  Moon,
  Monitor,
  Copy,
  Check,
  Code2,
  Eye,
  Palette,
  Settings2,
  Star,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button, Badge, Input } from "@ktblog/ui/components";
import { cn } from "@ktblog/ui/components";
import type { EmbedConfig } from "@/types/developer";

// =============================================================================
// Constants
// =============================================================================

const WIDGET_TYPES = [
  {
    value: "product-card" as const,
    label: "Product Card",
    description: "Single product display with image, title, price, rating, and buy button",
    icon: CreditCard,
  },
  {
    value: "product-grid" as const,
    label: "Product Grid",
    description: "Multiple products in a responsive grid layout",
    icon: LayoutGrid,
  },
  {
    value: "buy-button" as const,
    label: "Buy Button",
    description: "Minimal, embeddable buy button for any page",
    icon: ShoppingBag,
  },
];

const THEME_OPTIONS = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "auto" as const, label: "Auto", icon: Monitor },
];

const FONT_OPTIONS = [
  { value: "system", label: "System Default" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Poppins", label: "Poppins" },
];

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pt", label: "Portuguese" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
];

const GRID_COUNT_OPTIONS = [2, 3, 4, 6, 8];

const CODE_TABS = [
  { value: "html" as const, label: "HTML" },
  { value: "react" as const, label: "React" },
  { value: "vue" as const, label: "Vue" },
  { value: "wordpress" as const, label: "WordPress" },
];

type CodeTab = "html" | "react" | "vue" | "wordpress";

// =============================================================================
// Animation Variants
// =============================================================================

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 25 } },
};

const tabContent = {
  hidden: { opacity: 0, x: 8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } },
};

// =============================================================================
// Code Generation Helpers
// =============================================================================

function generateHtmlCode(config: EmbedConfig): string {
  const attrs = [
    `data-ktblog-widget="${config.widgetType}"`,
    config.productId ? `data-ktblog-product="${config.productId}"` : null,
    `data-ktblog-theme="${config.theme}"`,
    `data-ktblog-accent="${config.accentColor}"`,
    `data-ktblog-radius="${config.borderRadius}"`,
    `data-ktblog-locale="${config.locale}"`,
  ]
    .filter(Boolean)
    .join("\n  ");

  return `<!-- KTBlog Embed Widget -->
<script src="https://cdn.ktblog.com/embed.js" defer></script>
<div
  ${attrs}
></div>`;
}

function generateReactCode(config: EmbedConfig): string {
  const productAttr = config.productId
    ? `\n      data-ktblog-product="${config.productId}"`
    : "";

  return `import { useEffect, useRef } from 'react';

export function KTBlogWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.ktblog.com/embed.js';
    script.defer = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div
      ref={ref}
      data-ktblog-widget="${config.widgetType}"${productAttr}
      data-ktblog-theme="${config.theme}"
      data-ktblog-accent="${config.accentColor}"
      data-ktblog-radius="${config.borderRadius}"
      data-ktblog-locale="${config.locale}"
    />
  );
}`;
}

function generateVueCode(config: EmbedConfig): string {
  const productAttr = config.productId
    ? `\n    data-ktblog-product="${config.productId}"`
    : "";

  return `<template>
  <div
    data-ktblog-widget="${config.widgetType}"${productAttr}
    data-ktblog-theme="${config.theme}"
    data-ktblog-accent="${config.accentColor}"
    data-ktblog-radius="${config.borderRadius}"
    data-ktblog-locale="${config.locale}"
  />
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

let script;

onMounted(() => {
  script = document.createElement('script');
  script.src = 'https://cdn.ktblog.com/embed.js';
  script.defer = true;
  document.body.appendChild(script);
});

onUnmounted(() => {
  if (script) document.body.removeChild(script);
});
</script>`;
}

function generateWordPressCode(config: EmbedConfig): string {
  const productAttr = config.productId
    ? ` product="${config.productId}"`
    : "";

  return `[ktblog_widget type="${config.widgetType}"${productAttr} theme="${config.theme}" accent="${config.accentColor}" radius="${config.borderRadius}" locale="${config.locale}"]`;
}

// =============================================================================
// Sub-Components
// =============================================================================

/** Widget type selector card */
function WidgetTypeCard({
  type,
  selected,
  onSelect,
}: {
  type: (typeof WIDGET_TYPES)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = type.icon;

  return (
    <motion.button
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start gap-3 p-5 rounded-xl border-2 text-left transition-colors w-full",
        selected
          ? "border-[#1E4DB7] bg-blue-50/60 dark:bg-blue-950/20"
          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 bg-white dark:bg-neutral-900",
      )}
    >
      {selected && (
        <motion.div
          layoutId="widget-type-indicator"
          className="absolute top-3 right-3"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <div className="h-3 w-3 rounded-full bg-[#1E4DB7]" />
        </motion.div>
      )}
      <div
        className={cn(
          "flex items-center justify-center h-10 w-10 rounded-lg",
          selected
            ? "bg-[#1E4DB7] text-white"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p
          className={cn(
            "font-semibold text-sm",
            selected
              ? "text-[#1E4DB7] dark:text-blue-400"
              : "text-neutral-900 dark:text-white",
          )}
        >
          {type.label}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
          {type.description}
        </p>
      </div>
    </motion.button>
  );
}

/** Theme selector radio */
function ThemeOption({
  option,
  selected,
  onSelect,
}: {
  option: (typeof THEME_OPTIONS)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium",
        selected
          ? "border-[#1E4DB7] bg-blue-50 dark:bg-blue-950/20 text-[#1E4DB7] dark:text-blue-400"
          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600",
      )}
    >
      <Icon className="h-4 w-4" />
      {option.label}
    </button>
  );
}

/** Copy button with success state */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail in non-secure contexts
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
        copied
          ? "bg-emerald-500/20 text-emerald-400"
          : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300",
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

// =============================================================================
// Preview Components
// =============================================================================

/** Mock product card preview */
function ProductCardPreview({
  accentColor,
  borderRadius,
  theme,
}: {
  accentColor: string;
  borderRadius: number;
  theme: string;
}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const textPrimary = isDark ? "#f5f5f5" : "#171717";
  const textSecondary = isDark ? "#a3a3a3" : "#737373";
  const border = isDark ? "#2e2e2e" : "#e5e5e5";

  return (
    <div
      style={{
        backgroundColor: bg,
        borderRadius: `${borderRadius}px`,
        border: `1px solid ${border}`,
        overflow: "hidden",
        width: "100%",
        maxWidth: 280,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          width: "100%",
          height: 160,
          backgroundColor: isDark ? "#262626" : "#f5f5f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isDark ? "#525252" : "#d4d4d4"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: textPrimary,
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          Excel Dashboard Template
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            marginTop: 6,
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <svg
              key={i}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={i <= 4 ? "#facc15" : "none"}
              stroke="#facc15"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span
            style={{ fontSize: 11, color: textSecondary, marginLeft: 4 }}
          >
            4.8 (124)
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <span
            style={{ fontSize: 18, fontWeight: 700, color: textPrimary }}
          >
            $29.99
          </span>
          <button
            style={{
              backgroundColor: accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: `${Math.min(borderRadius, 12)}px`,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

/** Mock product grid preview */
function ProductGridPreview({
  accentColor,
  borderRadius,
  theme,
}: {
  accentColor: string;
  borderRadius: number;
  theme: string;
}) {
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const textPrimary = isDark ? "#f5f5f5" : "#171717";
  const border = isDark ? "#2e2e2e" : "#e5e5e5";
  const imgBg = isDark ? "#262626" : "#f5f5f5";

  const items = [
    { name: "Dashboard Pro", price: "$29" },
    { name: "Budget Tracker", price: "$19" },
    { name: "Invoice Kit", price: "$24" },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        width: "100%",
        maxWidth: 380,
      }}
    >
      {items.map((item) => (
        <div
          key={item.name}
          style={{
            backgroundColor: bg,
            borderRadius: `${borderRadius}px`,
            border: `1px solid ${border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: 64,
              backgroundColor: imgBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isDark ? "#525252" : "#d4d4d4"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
          <div style={{ padding: "8px 10px 10px" }}>
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: textPrimary,
                margin: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 6,
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: textPrimary,
                }}
              >
                {item.price}
              </span>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: accentColor,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mock buy button preview */
function BuyButtonPreview({
  accentColor,
  borderRadius,
}: {
  accentColor: string;
  borderRadius: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        style={{
          backgroundColor: accentColor,
          color: "#ffffff",
          border: "none",
          borderRadius: `${borderRadius}px`,
          padding: "12px 32px",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 8,
          letterSpacing: "0.01em",
          boxShadow: `0 4px 14px ${accentColor}40`,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        Buy Now - $29.99
      </button>
      <span
        style={{
          fontSize: 11,
          color: "#a3a3a3",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Secure checkout by KTBlog
      </span>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function EmbedsClient() {
  // ---- Configuration State ----
  const [widgetType, setWidgetType] = useState<EmbedConfig["widgetType"]>("product-card");
  const [productId, setProductId] = useState("");
  const [theme, setTheme] = useState<EmbedConfig["theme"]>("light");
  const [accentColor, setAccentColor] = useState("#1E4DB7");
  const [borderRadius, setBorderRadius] = useState(12);
  const [fontFamily, setFontFamily] = useState("system");
  const [locale, setLocale] = useState("en");
  const [gridCount, setGridCount] = useState(4);

  // ---- UI State ----
  const [activeCodeTab, setActiveCodeTab] = useState<CodeTab>("html");

  // ---- Derived Config ----
  const config = useMemo<EmbedConfig>(
    () => ({
      widgetType,
      productId: productId.trim() || undefined,
      theme,
      accentColor,
      borderRadius,
      locale,
    }),
    [widgetType, productId, theme, accentColor, borderRadius, locale],
  );

  // ---- Code Snippets ----
  const codeSnippets = useMemo(
    () => ({
      html: generateHtmlCode(config),
      react: generateReactCode(config),
      vue: generateVueCode(config),
      wordpress: generateWordPressCode(config),
    }),
    [config],
  );

  // ---- Resolved theme for preview (auto = light for preview purposes) ----
  const resolvedTheme = theme === "auto" ? "light" : theme;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            <Link
              href="/developers"
              className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Developer Portal
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-neutral-900 dark:text-white font-medium">
              Embed Widgets
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
                Embed Widgets
              </h1>
              <p className="mt-1.5 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                Generate embeddable widgets for your website. Configure the
                appearance and copy the code snippet.
              </p>
            </div>
            <Badge className="self-start bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-0">
              <Code2 className="h-3.5 w-3.5 mr-1" />
              Configurator
            </Badge>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main Content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ============================================================== */}
          {/* Left Column -- Configurator                                     */}
          {/* ============================================================== */}
          <motion.div
            className="lg:col-span-5 space-y-8"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* ------ Step 1: Widget Type ------ */}
            <motion.section variants={fadeIn}>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#1E4DB7] text-white text-xs font-bold">
                  1
                </span>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                  Widget Type
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {WIDGET_TYPES.map((type) => (
                  <WidgetTypeCard
                    key={type.value}
                    type={type}
                    selected={widgetType === type.value}
                    onSelect={() => setWidgetType(type.value)}
                  />
                ))}
              </div>
            </motion.section>

            {/* ------ Step 2: Product Selection ------ */}
            <motion.section variants={fadeIn}>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#1E4DB7] text-white text-xs font-bold">
                  2
                </span>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                  Product Selection
                </h2>
              </div>
              <div className="space-y-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Product Slug / ID
                  </label>
                  <Input
                    value={productId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setProductId(e.target.value)
                    }
                    placeholder="e.g. excel-dashboard-pro"
                    className="w-full"
                  />
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    Leave empty to use a dynamic product selector on the embed.
                  </p>
                </div>

                {widgetType === "product-grid" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Products per Page
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {GRID_COUNT_OPTIONS.map((count) => (
                        <button
                          key={count}
                          onClick={() => setGridCount(count)}
                          className={cn(
                            "px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all",
                            gridCount === count
                              ? "border-[#1E4DB7] bg-blue-50 dark:bg-blue-950/20 text-[#1E4DB7] dark:text-blue-400"
                              : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600",
                          )}
                        >
                          {count}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.section>

            {/* ------ Step 3: Theme & Styling ------ */}
            <motion.section variants={fadeIn}>
              <div className="flex items-center gap-2 mb-4">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#1E4DB7] text-white text-xs font-bold">
                  3
                </span>
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                  Theme & Styling
                </h2>
              </div>
              <div className="space-y-5 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
                {/* Theme */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Theme
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THEME_OPTIONS.map((option) => (
                      <ThemeOption
                        key={option.value}
                        option={option}
                        selected={theme === option.value}
                        onSelect={() => setTheme(option.value)}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="h-10 w-10 rounded-lg border border-neutral-200 dark:border-neutral-700 cursor-pointer appearance-none bg-transparent p-0.5"
                        style={{ colorScheme: "normal" }}
                      />
                    </div>
                    <Input
                      value={accentColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = e.target.value;
                        if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                          setAccentColor(val);
                        }
                      }}
                      className="w-28 font-mono text-sm"
                      maxLength={7}
                      placeholder="#1E4DB7"
                    />
                    <div className="flex gap-1.5">
                      {["#1E4DB7", "#F59A23", "#10b981", "#ef4444", "#8b5cf6"].map(
                        (color) => (
                          <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={cn(
                              "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                              accentColor === color
                                ? "border-neutral-900 dark:border-white scale-110"
                                : "border-transparent",
                            )}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ),
                      )}
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      Border Radius
                    </label>
                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      {borderRadius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={24}
                    step={1}
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#1E4DB7] bg-neutral-200 dark:bg-neutral-700"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                    <span>0px</span>
                    <span>12px</span>
                    <span>24px</span>
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Locale */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Locale
                  </label>
                  <select
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1E4DB7] focus:border-transparent"
                  >
                    {LOCALE_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.section>
          </motion.div>

          {/* ============================================================== */}
          {/* Right Column -- Preview & Code                                  */}
          {/* ============================================================== */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            {/* ------ Live Preview ------ */}
            <motion.section variants={fadeIn}>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="h-4 w-4 text-[#1E4DB7]" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                  Live Preview
                </h2>
              </div>
              <div
                className="relative rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                style={{ minHeight: 280 }}
              >
                {/* Checkered background */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, #d4d4d4 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    opacity: 0.3,
                  }}
                />
                {/* Preview surface */}
                <div className="relative flex items-center justify-center p-8 min-h-[280px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${widgetType}-${resolvedTheme}-${accentColor}-${borderRadius}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                    >
                      {widgetType === "product-card" && (
                        <ProductCardPreview
                          accentColor={accentColor}
                          borderRadius={borderRadius}
                          theme={resolvedTheme}
                        />
                      )}
                      {widgetType === "product-grid" && (
                        <ProductGridPreview
                          accentColor={accentColor}
                          borderRadius={borderRadius}
                          theme={resolvedTheme}
                        />
                      )}
                      {widgetType === "buy-button" && (
                        <BuyButtonPreview
                          accentColor={accentColor}
                          borderRadius={borderRadius}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {/* Configuration summary bar */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm px-4 py-2.5 flex items-center gap-3 flex-wrap text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    {accentColor}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">|</span>
                  <span className="flex items-center gap-1">
                    <Settings2 className="h-3 w-3" />
                    {borderRadius}px radius
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">|</span>
                  <span className="capitalize">
                    {theme} theme
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600">|</span>
                  <span className="uppercase">{locale}</span>
                </div>
              </div>
            </motion.section>

            {/* ------ Code Output ------ */}
            <motion.section variants={fadeIn}>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-4 w-4 text-[#1E4DB7]" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wide">
                  Code Snippet
                </h2>
              </div>
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
                {/* Tabs */}
                <div className="flex items-center border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-1 overflow-x-auto">
                  {CODE_TABS.map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setActiveCodeTab(tab.value)}
                      className={cn(
                        "relative px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                        activeCodeTab === tab.value
                          ? "text-[#1E4DB7] dark:text-blue-400"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300",
                      )}
                    >
                      {tab.label}
                      {activeCodeTab === tab.value && (
                        <motion.div
                          layoutId="code-tab-underline"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4DB7]"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 30,
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Code Block */}
                <div className="relative">
                  <div className="absolute top-3 right-3 z-10">
                    <CopyButton text={codeSnippets[activeCodeTab]} />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeCodeTab}
                      variants={tabContent}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <pre className="p-5 pr-24 overflow-x-auto text-sm leading-relaxed bg-neutral-950 text-neutral-300 font-mono min-h-[160px]">
                        <code>{codeSnippets[activeCodeTab]}</code>
                      </pre>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Integration hint */}
              <div className="mt-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-lg p-4">
                <div className="flex-shrink-0 mt-0.5">
                  <Star className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                  <strong className="font-semibold">Tip:</strong> The embed
                  script automatically handles responsive sizing, theme
                  detection when set to &quot;auto&quot;, and locale matching.
                  Just paste the snippet and it works.
                </div>
              </div>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
