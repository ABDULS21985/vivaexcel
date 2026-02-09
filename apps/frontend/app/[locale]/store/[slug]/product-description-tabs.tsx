"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Package,
  Monitor,
  Star,
  MessageCircle,
  History,
  Check,
  X,
  FileText,
  Download,
  ChevronDown,
} from "lucide-react";
import type { DigitalProduct } from "@/types/digital-product";

// =============================================================================
// Types
// =============================================================================

interface ProductDescriptionTabsProps {
  product: DigitalProduct;
}

type TabId =
  | "overview"
  | "included"
  | "compatibility"
  | "reviews"
  | "faq"
  | "changelog";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface CompatibilityRow {
  platform: string;
  supported: boolean;
  version?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  label?: string;
  changes: string[];
}

// =============================================================================
// Constants
// =============================================================================

const TABS: Tab[] = [
  {
    id: "overview",
    label: "Overview",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    id: "included",
    label: "What's Included",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "compatibility",
    label: "Compatibility",
    icon: <Monitor className="h-4 w-4" />,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: "faq",
    label: "FAQ",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    id: "changelog",
    label: "Changelog",
    icon: <History className="h-4 w-4" />,
  },
];

const TAB_TRANSITION = { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const };

// =============================================================================
// Helpers
// =============================================================================

function getFeatures(product: DigitalProduct): string[] {
  const meta = product.metadata || {};
  if (Array.isArray(meta.features)) {
    return meta.features as string[];
  }
  if (product.description) {
    const bulletRegex = /[•\-*]\s*(.+)/g;
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = bulletRegex.exec(product.description)) !== null) {
      matches.push(match[1].trim());
    }
    if (matches.length > 0) return matches;
  }
  return [];
}

function getCompatibility(product: DigitalProduct): CompatibilityRow[] {
  const meta = product.metadata || {};

  // If metadata has a structured compatibility matrix, use it
  if (Array.isArray(meta.compatibilityMatrix)) {
    return meta.compatibilityMatrix as CompatibilityRow[];
  }

  // Build from string-based compatibility
  if (Array.isArray(meta.compatibility)) {
    return (meta.compatibility as string[]).map((item) => ({
      platform: item,
      supported: true,
    }));
  }
  if (typeof meta.compatibility === "string") {
    return [{ platform: meta.compatibility, supported: true }];
  }

  // Default compatibility grids based on product type
  const defaultCompat: Record<string, CompatibilityRow[]> = {
    powerpoint: [
      { platform: "Microsoft PowerPoint", supported: true, version: "2016+" },
      { platform: "Google Slides", supported: true, version: "Latest" },
      {
        platform: "Apple Keynote",
        supported: true,
        version: "With conversion",
      },
      {
        platform: "LibreOffice Impress",
        supported: true,
        version: "7.0+",
      },
      { platform: "WPS Presentation", supported: true, version: "Latest" },
      { platform: "Canva", supported: false },
    ],
    document: [
      { platform: "Microsoft Word", supported: true, version: "2016+" },
      { platform: "Google Docs", supported: true, version: "Latest" },
      { platform: "LibreOffice Writer", supported: true, version: "7.0+" },
      { platform: "Apple Pages", supported: true, version: "With conversion" },
      { platform: "WPS Writer", supported: true, version: "Latest" },
      { platform: "Notion Import", supported: false },
    ],
    web_template: [
      { platform: "Chrome", supported: true, version: "90+" },
      { platform: "Firefox", supported: true, version: "88+" },
      { platform: "Safari", supported: true, version: "14+" },
      { platform: "Edge", supported: true, version: "90+" },
      { platform: "Node.js", supported: true, version: "18+" },
      { platform: "Internet Explorer", supported: false },
    ],
    startup_kit: [
      { platform: "Microsoft Office", supported: true, version: "2016+" },
      { platform: "Google Workspace", supported: true, version: "Latest" },
      { platform: "Notion", supported: true, version: "Latest" },
      { platform: "Figma", supported: true, version: "Latest" },
      { platform: "PDF Reader", supported: true, version: "Any" },
      { platform: "Apple iWork", supported: true, version: "With conversion" },
    ],
    solution_template: [
      { platform: "Microsoft Office", supported: true, version: "2016+" },
      { platform: "Google Workspace", supported: true, version: "Latest" },
      { platform: "PDF Reader", supported: true, version: "Any" },
      { platform: "LibreOffice", supported: true, version: "7.0+" },
      { platform: "WPS Office", supported: true, version: "Latest" },
      { platform: "Apple iWork", supported: false },
    ],
    design_system: [
      { platform: "Figma", supported: true, version: "Latest" },
      { platform: "Adobe XD", supported: true, version: "Latest" },
      { platform: "Sketch", supported: true, version: "With conversion" },
      { platform: "Adobe Illustrator", supported: true, version: "2021+" },
      { platform: "InVision", supported: false },
      { platform: "Canva", supported: false },
    ],
    code_template: [
      { platform: "VS Code", supported: true, version: "Latest" },
      { platform: "WebStorm", supported: true, version: "2021+" },
      { platform: "Node.js", supported: true, version: "18+" },
      { platform: "Chrome", supported: true, version: "90+" },
      { platform: "Firefox", supported: true, version: "88+" },
      { platform: "Safari", supported: true, version: "14+" },
    ],
  };

  return (
    defaultCompat[product.type] || [
      { platform: "Cross-platform", supported: true, version: "Any" },
    ]
  );
}

function getIncludedItems(
  product: DigitalProduct
): { label: string; icon: "package" | "file" | "download"; size?: string }[] {
  const meta = product.metadata || {};

  // Structured included items from metadata
  if (Array.isArray(meta.includedItems)) {
    return (meta.includedItems as string[]).map((item) => ({
      label: item,
      icon: "package" as const,
    }));
  }
  if (Array.isArray(meta.whatsIncluded)) {
    return (meta.whatsIncluded as string[]).map((item) => ({
      label: item,
      icon: "package" as const,
    }));
  }

  // Build default included items
  const items: {
    label: string;
    icon: "package" | "file" | "download";
    size?: string;
  }[] = [];

  if (meta.slideCount) {
    items.push({
      label: `${meta.slideCount} professionally designed slides`,
      icon: "file",
    });
  }
  if (meta.pageCount) {
    items.push({
      label: `${meta.pageCount} pages of content`,
      icon: "file",
    });
  }
  if (meta.format) {
    items.push({
      label: `Source files in ${meta.format} format`,
      icon: "download",
      size: meta.fileSize as string | undefined,
    });
  }
  if (meta.fileSize && !meta.format) {
    items.push({
      label: `Download package`,
      icon: "download",
      size: meta.fileSize as string,
    });
  }

  if (items.length === 0) {
    items.push({ label: "Complete source files", icon: "download" });
    items.push({ label: "Documentation & setup guide", icon: "file" });
    items.push({ label: "Free lifetime updates", icon: "package" });
  }

  return items;
}

function parseTableOfContents(html: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const regex = /<(h[23])[^>]*(?:id=["']([^"']*)["'])?[^>]*>(.*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(html)) !== null) {
    const level = match[1].toLowerCase() === "h2" ? 2 : 3;
    const existingId = match[2];
    const rawText = match[3].replace(/<[^>]*>/g, "").trim();
    const id =
      existingId ||
      rawText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      `heading-${index}`;
    if (rawText) {
      headings.push({ id, text: rawText, level });
    }
    index++;
  }

  return headings;
}

function getDefaultFaqs(productType: string): FaqItem[] {
  const commonFaqs: FaqItem[] = [
    {
      question: "What happens after I purchase?",
      answer:
        "After completing your purchase, you will receive an instant download link. You can also access your files anytime from your account dashboard.",
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer:
        "We offer a satisfaction guarantee. If the product doesn't meet your expectations, please contact our support team within 14 days of purchase.",
    },
    {
      question: "Do I get free updates?",
      answer:
        "Yes! All future updates to this product are included with your purchase at no additional cost. You'll be notified when updates are available.",
    },
  ];

  const typeFaqs: Record<string, FaqItem[]> = {
    powerpoint: [
      {
        question: "Can I edit the slides and customize the content?",
        answer:
          "Absolutely! All slides are fully editable. You can change text, colors, images, charts, and layouts to match your brand and presentation needs.",
      },
      {
        question: "What fonts are used in the presentation?",
        answer:
          "We use widely available system fonts and Google Fonts to ensure compatibility. Font information is included in the documentation.",
      },
    ],
    document: [
      {
        question: "Can I modify the document templates?",
        answer:
          "Yes, all templates are fully editable. You can customize text, formatting, headers, and styling to suit your needs.",
      },
      {
        question: "Are the documents print-ready?",
        answer:
          "Yes, all documents are designed with proper margins and formatting for both digital use and professional printing.",
      },
    ],
    web_template: [
      {
        question: "Is the template responsive and mobile-friendly?",
        answer:
          "Yes, the template is fully responsive and has been tested across all major browsers and device sizes including mobile, tablet, and desktop.",
      },
      {
        question: "Do I need coding knowledge to use this template?",
        answer:
          "Basic HTML/CSS knowledge is helpful for customization. The template comes with detailed documentation to guide you through setup and modifications.",
      },
    ],
    startup_kit: [
      {
        question: "Is this suitable for my specific industry?",
        answer:
          "The kit is designed to be versatile and adaptable across industries. All templates and documents can be customized to fit your specific business context.",
      },
      {
        question: "Can I use this for multiple projects?",
        answer:
          "Yes, your license allows you to use the kit for multiple personal or business projects. However, redistribution or resale of the templates is not permitted.",
      },
    ],
    design_system: [
      {
        question: "Is the design system compatible with my design tool?",
        answer:
          "The design system is available in major formats. Check the compatibility tab for specific tool support. We include conversion guides where applicable.",
      },
      {
        question: "How often is the design system updated?",
        answer:
          "We regularly update the design system to include new components, patterns, and improvements. All updates are free for existing customers.",
      },
    ],
    code_template: [
      {
        question: "What tech stack does this template use?",
        answer:
          "The tech stack details are listed in the compatibility tab and documentation. The template follows modern best practices and uses current, well-maintained technologies.",
      },
      {
        question: "Is the code well-documented?",
        answer:
          "Yes, the codebase includes inline comments, a comprehensive README, and setup documentation to help you get started quickly.",
      },
    ],
    solution_template: [
      {
        question: "Can I adapt this to my organization's workflow?",
        answer:
          "Yes, the templates are fully customizable. You can modify workflows, add or remove sections, and tailor the solution to your specific organizational needs.",
      },
      {
        question: "Is training included with the purchase?",
        answer:
          "The product includes detailed documentation and setup guides. For additional training or consultation, please contact our support team.",
      },
    ],
  };

  return [...(typeFaqs[productType] || []), ...commonFaqs];
}

function getChangelogEntries(product: DigitalProduct): ChangelogEntry[] {
  const meta = product.metadata || {};
  const entries: ChangelogEntry[] = [];

  // If metadata has structured changelog, use it
  if (Array.isArray(meta.changelog)) {
    return meta.changelog as ChangelogEntry[];
  }

  // Build from product dates
  if (product.updatedAt && product.updatedAt !== product.createdAt) {
    const updateDate = new Date(product.updatedAt);
    entries.push({
      version: meta.version ? String(meta.version) : "1.1.0",
      date: updateDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      label: "Latest",
      changes: [
        "Quality improvements and optimizations",
        "Updated for latest platform compatibility",
        ...(meta.updateNotes ? [String(meta.updateNotes)] : []),
      ],
    });
  }

  if (product.createdAt) {
    const createDate = new Date(product.createdAt);
    entries.push({
      version: "1.0.0",
      date: createDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      changes: [
        "Initial release",
        "All core features and templates included",
        "Full documentation and setup guide",
      ],
    });
  }

  if (entries.length === 0) {
    entries.push({
      version: "1.0.0",
      date: "Release date not available",
      changes: ["Initial release"],
    });
  }

  return entries;
}

function formatRatingDistribution(
  averageRating: number,
  totalReviews: number
): { stars: number; count: number; percentage: number }[] {
  // Generate a plausible distribution from the average
  if (totalReviews === 0) {
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: 0,
      percentage: 0,
    }));
  }

  const weights: Record<number, number[]> = {
    5: [0.7, 0.2, 0.06, 0.03, 0.01],
    4: [0.3, 0.45, 0.15, 0.07, 0.03],
    3: [0.1, 0.2, 0.4, 0.2, 0.1],
    2: [0.05, 0.1, 0.2, 0.4, 0.25],
    1: [0.02, 0.05, 0.08, 0.2, 0.65],
  };

  const roundedAvg = Math.max(1, Math.min(5, Math.round(averageRating)));
  const dist = weights[roundedAvg] || weights[4];

  return [5, 4, 3, 2, 1].map((stars, idx) => {
    const count = Math.round(totalReviews * dist[idx]);
    return {
      stars,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });
}

// =============================================================================
// Sub-Components
// =============================================================================

function IncludedItemIcon({ type }: { type: "package" | "file" | "download" }) {
  switch (type) {
    case "file":
      return <FileText className="h-4 w-4 text-[#1E4DB7] dark:text-blue-400" />;
    case "download":
      return (
        <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      );
    default:
      return <Package className="h-4 w-4 text-[#F59A23]" />;
  }
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const halfFilled = !filled && rating >= star - 0.5;
        return (
          <div key={star} className="relative">
            <Star
              className={`${sizeClass} ${
                filled
                  ? "text-amber-400 fill-amber-400"
                  : halfFilled
                    ? "text-amber-400"
                    : "text-neutral-300 dark:text-neutral-600"
              }`}
            />
            {halfFilled && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className={`${sizeClass} text-amber-400 fill-amber-400`} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FaqAccordionItem({ item, index }: { item: FaqItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="border border-neutral-200 dark:border-neutral-700/50 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-900 dark:text-white">
          {item.question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TableOfContents({
  headings,
  activeId,
}: {
  headings: TocHeading[];
  activeId: string | null;
}) {
  if (headings.length === 0) return null;

  return (
    <nav className="hidden lg:block sticky top-8 w-56 flex-shrink-0 self-start">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
        On this page
      </h4>
      <ul className="space-y-1 border-l-2 border-neutral-200 dark:border-neutral-700">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block text-xs py-1 transition-colors ${
                heading.level === 3 ? "pl-6" : "pl-4"
              } ${
                activeId === heading.id
                  ? "text-[#1E4DB7] dark:text-blue-400 font-medium border-l-2 border-[#1E4DB7] dark:border-blue-400 -ml-[2px]"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function ProductDescriptionTabs({
  product,
}: ProductDescriptionTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeTocId, setActiveTocId] = useState<string | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const includedItems = useMemo(() => getIncludedItems(product), [product]);
  const compatibility = useMemo(() => getCompatibility(product), [product]);
  const faqs = useMemo(() => getDefaultFaqs(product.type), [product.type]);
  const changelog = useMemo(() => getChangelogEntries(product), [product]);
  const ratingDistribution = useMemo(
    () =>
      formatRatingDistribution(product.averageRating, product.totalReviews),
    [product.averageRating, product.totalReviews]
  );

  const tableOfContents = useMemo(
    () => (product.description ? parseTableOfContents(product.description) : []),
    [product.description]
  );

  // Inject IDs into description HTML for TOC linking
  const descriptionHtml = useMemo(() => {
    if (!product.description || tableOfContents.length === 0)
      return product.description || "";

    let html = product.description;
    for (const heading of tableOfContents) {
      const tagMatch = new RegExp(
        `(<h[23])([^>]*>)(.*?${heading.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}.*?</h[23]>)`,
        "i"
      );
      html = html.replace(tagMatch, `$1 id="${heading.id}"$2$3`);
    }
    return html;
  }, [product.description, tableOfContents]);

  // Observe headings for active TOC tracking
  useEffect(() => {
    if (activeTab !== "overview" || tableOfContents.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveTocId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );

    const timer = setTimeout(() => {
      for (const heading of tableOfContents) {
        const el = document.getElementById(heading.id);
        if (el) observer.observe(el);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeTab, tableOfContents]);

  // Scroll active tab into view on mobile
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeButton = tabsContainerRef.current.querySelector(
      `[data-tab-id="${activeTab}"]`
    );
    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeTab]);

  return (
    <div>
      {/* ================================================================== */}
      {/* Tab Navigation                                                     */}
      {/* ================================================================== */}
      <div
        ref={tabsContainerRef}
        className="flex gap-2 md:gap-0 overflow-x-auto scrollbar-hide md:border-b md:border-neutral-200 md:dark:border-neutral-700 pb-px"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 whitespace-nowrap text-sm font-medium transition-all
                ${
                  /* Mobile: pill-shaped buttons */
                  ""
                }
                px-4 py-2.5 rounded-full md:rounded-none md:py-3
                ${
                  isActive
                    ? "bg-[#1E4DB7] text-white md:bg-transparent md:text-[#1E4DB7] dark:md:text-blue-400"
                    : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 md:bg-transparent md:dark:bg-transparent hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 md:hover:bg-transparent md:dark:hover:bg-transparent"
                }
              `}
            >
              {tab.icon}
              {tab.label}
              {/* Desktop underline indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="hidden md:block absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4DB7] dark:bg-blue-400"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ================================================================== */}
      {/* Tab Content                                                        */}
      {/* ================================================================== */}
      <div className="pt-8">
        <AnimatePresence mode="wait">
          {/* -------------------------------------------------------------- */}
          {/* Overview Tab                                                    */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={TAB_TRANSITION}
            >
              {product.description ? (
                <div className="flex gap-10">
                  {/* Main content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="prose prose-neutral dark:prose-invert max-w-none
                        prose-headings:text-neutral-900 dark:prose-headings:text-white
                        prose-headings:scroll-mt-24
                        prose-p:text-neutral-600 dark:prose-p:text-neutral-400
                        prose-a:text-[#1E4DB7] dark:prose-a:text-blue-400
                        prose-strong:text-neutral-900 dark:prose-strong:text-white
                        prose-li:text-neutral-600 dark:prose-li:text-neutral-400
                        prose-img:rounded-xl prose-img:shadow-lg"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  </div>
                  {/* Sidebar TOC (desktop only) */}
                  <TableOfContents
                    headings={tableOfContents}
                    activeId={activeTocId}
                  />
                </div>
              ) : (
                <div className="text-center py-16">
                  <BookOpen className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    No detailed description available for this product.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* What's Included Tab                                             */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "included" && (
            <motion.div
              key="included"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={TAB_TRANSITION}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Everything you get when you purchase this product:
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                {includedItems.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.07, duration: 0.3 }}
                    className="group relative flex items-start gap-4 p-5 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl border border-transparent hover:border-[#1E4DB7]/20 dark:hover:border-blue-400/20 transition-colors"
                  >
                    {/* Animated checkmark */}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: idx * 0.07 + 0.15,
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                      className="w-8 h-8 rounded-xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center flex-shrink-0"
                    >
                      <IncludedItemIcon type={item.icon} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {item.label}
                      </span>
                      {item.size && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          {item.size}
                        </p>
                      )}
                    </div>
                    {/* Checkmark indicator */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: idx * 0.07 + 0.25,
                        type: "spring",
                        stiffness: 500,
                        damping: 25,
                      }}
                      className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Guarantee Note */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#1E4DB7]/5 to-[#F59A23]/5 dark:from-[#1E4DB7]/10 dark:to-[#F59A23]/10 rounded-2xl border border-[#1E4DB7]/10 dark:border-[#1E4DB7]/20">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#1E4DB7]/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-[#1E4DB7]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">
                      Quality Guarantee
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      All our digital products are professionally designed and
                      tested. If you encounter any issues, our support team is
                      here to help.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Compatibility Tab                                               */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "compatibility" && (
            <motion.div
              key="compatibility"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={TAB_TRANSITION}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Platform and software compatibility for this product:
              </p>

              <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700/50 overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-3 gap-4 px-5 py-3 bg-neutral-100 dark:bg-neutral-800/80 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  <span>Platform</span>
                  <span className="text-center">Status</span>
                  <span className="text-right">Version</span>
                </div>

                {/* Data rows */}
                {compatibility.map((row, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`grid grid-cols-3 gap-4 px-5 py-4 items-center ${
                      idx % 2 === 0
                        ? "bg-white dark:bg-neutral-900/30"
                        : "bg-neutral-50 dark:bg-neutral-800/30"
                    } ${
                      idx < compatibility.length - 1
                        ? "border-b border-neutral-100 dark:border-neutral-800"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {row.platform}
                    </span>
                    <div className="flex justify-center">
                      {row.supported ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          Supported
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          <X className="h-3 w-3" />
                          Not Supported
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400 text-right">
                      {row.version || "--"}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Reviews Tab                                                     */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={TAB_TRANSITION}
            >
              {/* Summary stats */}
              <div className="flex flex-col sm:flex-row gap-8 p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl mb-8">
                {/* Left: overall rating */}
                <div className="flex flex-col items-center justify-center sm:min-w-[160px]">
                  <span className="text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                    {product.averageRating > 0
                      ? product.averageRating.toFixed(1)
                      : "--"}
                  </span>
                  <StarRating rating={product.averageRating} size="md" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    {product.totalReviews}{" "}
                    {product.totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>

                {/* Right: rating distribution bars */}
                <div className="flex-1 space-y-2">
                  {ratingDistribution.map((dist) => (
                    <div key={dist.stars} className="flex items-center gap-3">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400 w-12 text-right flex items-center justify-end gap-1">
                        {dist.stars}
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dist.percentage}%` }}
                          transition={{ duration: 0.6, delay: 0.1 }}
                          className="h-full bg-amber-400 rounded-full"
                        />
                      </div>
                      <span className="text-xs text-neutral-500 dark:text-neutral-400 w-8">
                        {dist.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list or empty state */}
              {product.totalReviews === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl">
                  <Star className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    Be the first to review this product! Share your experience
                    to help others make informed decisions.
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl">
                  <MessageCircle className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    Reviews loading
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                    Individual reviews will appear here once the review system
                    is fully connected.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* FAQ Tab                                                         */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "faq" && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={TAB_TRANSITION}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Frequently asked questions about this product:
              </p>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <FaqAccordionItem key={idx} item={faq} index={idx} />
                ))}
              </div>

              {/* Contact CTA */}
              <div className="mt-8 p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl text-center">
                <MessageCircle className="h-8 w-8 text-neutral-400 dark:text-neutral-500 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
                  Still have questions?
                </h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Contact our support team and we will get back to you within 24
                  hours.
                </p>
              </div>
            </motion.div>
          )}

          {/* -------------------------------------------------------------- */}
          {/* Changelog Tab                                                   */}
          {/* -------------------------------------------------------------- */}
          {activeTab === "changelog" && (
            <motion.div
              key="changelog"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={TAB_TRANSITION}
            >
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-8">
                Version history and updates:
              </p>

              <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-neutral-200 dark:bg-neutral-700" />

                <div className="space-y-8">
                  {changelog.map((entry, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative flex gap-6"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 flex-shrink-0">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            idx === 0
                              ? "bg-[#1E4DB7] border-[#1E4DB7] dark:bg-blue-500 dark:border-blue-500"
                              : "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-600"
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              idx === 0 ? "bg-white" : "bg-neutral-400 dark:bg-neutral-500"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Content card */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">
                            v{entry.version}
                          </span>
                          {entry.label && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E4DB7]/10 text-[#1E4DB7] dark:bg-blue-500/20 dark:text-blue-400">
                              New
                            </span>
                          )}
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {entry.date}
                          </span>
                        </div>

                        <ul className="space-y-1.5">
                          {entry.changes.map((change, cIdx) => (
                            <li
                              key={cIdx}
                              className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                            >
                              <span className="inline-block w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-500 mt-2 flex-shrink-0" />
                              {change}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProductDescriptionTabs;
