"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { DigitalProduct, DigitalProductPreviewType } from "@/types/digital-product";
import { DigitalProductType } from "@/types/digital-product";
import type { SlideData } from "./slide-viewer";
import type { TOCItem, DocumentInfo } from "./document-viewer";
import type { CodeFileNode, ProjectStats } from "./code-viewer";
import type { TemplatePage } from "./template-previewer";

// Dynamic imports for code splitting
const SlideViewer = dynamic(() => import("./slide-viewer"), { ssr: false });
const DocumentViewer = dynamic(() => import("./document-viewer"), { ssr: false });
const TemplatePreviewer = dynamic(() => import("./template-previewer"), { ssr: false });
const CodeViewer = dynamic(() => import("./code-viewer"), { ssr: false });

// Fallback gallery - imported statically as it's the default
import ProductGallery from "../product-gallery";

// =============================================================================
// Types
// =============================================================================

interface ProductPreviewProps {
  product: DigitalProduct;
  slides?: SlideData[];
  fileTree?: CodeFileNode[];
  projectStats?: ProjectStats;
  tableOfContents?: TOCItem[];
  documentInfo?: DocumentInfo;
  templatePages?: TemplatePage[];
  onPurchaseClick?: () => void;
  className?: string;
}

type ViewerType = "slide" | "document" | "template" | "code" | "gallery";

// =============================================================================
// Helpers
// =============================================================================

function getViewerType(type: DigitalProductType): ViewerType {
  switch (type) {
    case DigitalProductType.POWERPOINT:
      return "slide";
    case DigitalProductType.DOCUMENT:
    case DigitalProductType.SOLUTION_TEMPLATE:
      return "document";
    case DigitalProductType.WEB_TEMPLATE:
    case DigitalProductType.DESIGN_SYSTEM:
      return "template";
    case DigitalProductType.CODE_TEMPLATE:
    case DigitalProductType.STARTUP_KIT:
      return "code";
    default:
      return "gallery";
  }
}

function extractSlideData(product: DigitalProduct): SlideData[] {
  if (!product.previews?.length) return [];

  return product.previews
    .filter((p) => p.type === "slide_image" || p.type === "image")
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((p) => ({
      id: p.id,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl,
      label: p.label,
      width: p.width,
      height: p.height,
    }));
}

function extractPageImages(product: DigitalProduct): string[] {
  if (!product.previews?.length) return [];

  return product.previews
    .filter((p) => p.type === "pdf_preview" || p.type === "image")
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((p) => p.url);
}

function extractDemoUrl(product: DigitalProduct): string | null {
  const demoPreview = product.previews?.find((p) => p.type === "live_demo_url");
  if (demoPreview) return demoPreview.url;

  const meta = product.metadata as Record<string, unknown> | undefined;
  if (meta?.demoUrl && typeof meta.demoUrl === "string") return meta.demoUrl;

  return null;
}

function extractCodePreview(product: DigitalProduct): {
  fileTree: CodeFileNode[];
  projectStats?: ProjectStats;
} | null {
  const meta = product.metadata as Record<string, unknown> | undefined;
  if (meta?.codePreview) {
    const cp = meta.codePreview as { fileTree?: CodeFileNode[]; projectStats?: ProjectStats };
    if (cp.fileTree) return { fileTree: cp.fileTree, projectStats: cp.projectStats };
  }
  return null;
}

// =============================================================================
// ProductPreview Component
// =============================================================================

export function ProductPreview({
  product,
  slides: slidesProp,
  fileTree: fileTreeProp,
  projectStats: projectStatsProp,
  tableOfContents,
  documentInfo,
  templatePages,
  onPurchaseClick,
  className,
}: ProductPreviewProps) {
  const viewerType = getViewerType(product.type);

  // Extract data from product based on viewer type
  const slideData = useMemo(
    () => slidesProp ?? extractSlideData(product),
    [slidesProp, product],
  );

  const pageImages = useMemo(() => extractPageImages(product), [product]);

  const demoUrl = useMemo(() => extractDemoUrl(product), [product]);

  const codePreview = useMemo(() => {
    if (fileTreeProp) return { fileTree: fileTreeProp, projectStats: projectStatsProp };
    return extractCodePreview(product);
  }, [fileTreeProp, projectStatsProp, product]);

  // Determine if we have enough data for the specialized viewer
  switch (viewerType) {
    case "slide":
      if (slideData.length > 0) {
        return (
          <SlideViewer
            product={product}
            slides={slideData}
            onPurchaseClick={onPurchaseClick}
            className={className}
          />
        );
      }
      break;

    case "document":
      if (pageImages.length > 0) {
        return (
          <DocumentViewer
            product={product}
            pageImages={pageImages}
            totalPages={pageImages.length}
            tableOfContents={tableOfContents}
            documentInfo={documentInfo}
            onPurchaseClick={onPurchaseClick}
            className={className}
          />
        );
      }
      break;

    case "template":
      if (demoUrl) {
        return (
          <TemplatePreviewer
            demoUrl={demoUrl}
            title={product.title}
            pages={templatePages}
            className={className}
          />
        );
      }
      break;

    case "code":
      if (codePreview) {
        return (
          <CodeViewer
            fileTree={codePreview.fileTree}
            projectStats={codePreview.projectStats}
            onPurchaseClick={onPurchaseClick}
            className={className}
          />
        );
      }
      break;
  }

  // Fallback to generic product gallery
  return <ProductGallery product={product} />;
}

export default ProductPreview;
