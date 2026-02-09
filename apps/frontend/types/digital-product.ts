// =============================================================================
// Digital Product Types
// =============================================================================
// Frontend types for the digital products store, based on backend entities.

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum DigitalProductType {
  POWERPOINT = "powerpoint",
  DOCUMENT = "document",
  WEB_TEMPLATE = "web_template",
  STARTUP_KIT = "startup_kit",
  SOLUTION_TEMPLATE = "solution_template",
  DESIGN_SYSTEM = "design_system",
  CODE_TEMPLATE = "code_template",
  OTHER = "other",
}

export enum DigitalProductStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
  COMING_SOON = "coming_soon",
}

export enum DigitalProductPreviewType {
  IMAGE = "image",
  PDF_PREVIEW = "pdf_preview",
  VIDEO = "video",
  LIVE_DEMO_URL = "live_demo_url",
}

// -----------------------------------------------------------------------------
// Core Types
// -----------------------------------------------------------------------------

export interface DigitalProductCreator {
  id: string;
  name: string;
  avatar?: string;
}

export interface DigitalProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  parent?: DigitalProductCategory | null;
  children?: DigitalProductCategory[];
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface DigitalProductTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface DigitalProductVariant {
  id: string;
  name: string;
  price: number;
  features?: string[];
  sortOrder?: number;
}

export interface DigitalProductPreview {
  id: string;
  type: DigitalProductPreviewType;
  url: string;
  thumbnailUrl?: string;
  sortOrder?: number;
}

export interface DigitalProduct {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  type: DigitalProductType;
  status: DigitalProductStatus;
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  featuredImage?: string | null;
  galleryImages?: string[];
  downloadCount: number;
  viewCount: number;
  averageRating: number;
  totalReviews: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  metadata?: Record<string, unknown>;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  creator?: DigitalProductCreator;
  category?: DigitalProductCategory | null;
  tags?: DigitalProductTag[];
  variants?: DigitalProductVariant[];
  previews?: DigitalProductPreview[];
}

// -----------------------------------------------------------------------------
// Filter / Query Types
// -----------------------------------------------------------------------------

export interface DigitalProductFilters {
  cursor?: string;
  limit?: number;
  search?: string;
  type?: DigitalProductType;
  status?: DigitalProductStatus;
  categorySlug?: string;
  tagSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface CursorMeta {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface DigitalProductsResponse {
  items: DigitalProduct[];
  meta: CursorMeta;
}

export interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: CursorMeta;
}

// -----------------------------------------------------------------------------
// Display Helpers
// -----------------------------------------------------------------------------

export const DIGITAL_PRODUCT_TYPE_LABELS: Record<DigitalProductType, string> = {
  [DigitalProductType.POWERPOINT]: "PowerPoint",
  [DigitalProductType.DOCUMENT]: "Document",
  [DigitalProductType.WEB_TEMPLATE]: "Web Template",
  [DigitalProductType.STARTUP_KIT]: "Startup Kit",
  [DigitalProductType.SOLUTION_TEMPLATE]: "Solution Template",
  [DigitalProductType.DESIGN_SYSTEM]: "Design System",
  [DigitalProductType.CODE_TEMPLATE]: "Code Template",
  [DigitalProductType.OTHER]: "Other",
};

export const DIGITAL_PRODUCT_TYPE_COLORS: Record<DigitalProductType, string> = {
  [DigitalProductType.POWERPOINT]: "#D24726",
  [DigitalProductType.DOCUMENT]: "#2B579A",
  [DigitalProductType.WEB_TEMPLATE]: "#7C3AED",
  [DigitalProductType.STARTUP_KIT]: "#059669",
  [DigitalProductType.SOLUTION_TEMPLATE]: "#F59A23",
  [DigitalProductType.DESIGN_SYSTEM]: "#EC4899",
  [DigitalProductType.CODE_TEMPLATE]: "#1E4DB7",
  [DigitalProductType.OTHER]: "#6B7280",
};
