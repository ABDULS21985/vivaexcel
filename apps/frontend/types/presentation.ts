// =============================================================================
// Presentation Types
// =============================================================================
// Frontend types for the PowerPoint & Presentation Marketplace module,
// based on backend entities.

// -----------------------------------------------------------------------------
// Enums (as const objects + derived types)
// -----------------------------------------------------------------------------

export const AspectRatio = {
  WIDESCREEN_16_9: "16:9",
  STANDARD_4_3: "4:3",
  ULTRAWIDE_21_9: "21:9",
  SQUARE_1_1: "1:1",
  PORTRAIT_9_16: "9:16",
} as const;
export type AspectRatio = (typeof AspectRatio)[keyof typeof AspectRatio];

export const Industry = {
  TECHNOLOGY: "technology",
  HEALTHCARE: "healthcare",
  FINANCE: "finance",
  EDUCATION: "education",
  MARKETING: "marketing",
  REAL_ESTATE: "real_estate",
  CONSULTING: "consulting",
  STARTUP: "startup",
  GOVERNMENT: "government",
  NONPROFIT: "nonprofit",
  RETAIL: "retail",
  MANUFACTURING: "manufacturing",
  ENERGY: "energy",
  HOSPITALITY: "hospitality",
  LEGAL: "legal",
  GENERAL: "general",
} as const;
export type Industry = (typeof Industry)[keyof typeof Industry];

export const PresentationType = {
  PITCH_DECK: "pitch_deck",
  BUSINESS_PLAN: "business_plan",
  SALES_PROPOSAL: "sales_proposal",
  COMPANY_PROFILE: "company_profile",
  ANNUAL_REPORT: "annual_report",
  PROJECT_PROPOSAL: "project_proposal",
  TRAINING_MATERIAL: "training_material",
  WEBINAR_SLIDES: "webinar_slides",
  INFOGRAPHIC_DECK: "infographic_deck",
  CASE_STUDY: "case_study",
  PORTFOLIO: "portfolio",
  GENERAL: "general",
} as const;
export type PresentationType =
  (typeof PresentationType)[keyof typeof PresentationType];

export const FileFormat = {
  PPTX: "pptx",
  PPT: "ppt",
  KEY: "key",
  GSLIDES: "gslides",
  PDF: "pdf",
  ODP: "odp",
} as const;
export type FileFormat = (typeof FileFormat)[keyof typeof FileFormat];

export const SlideContentType = {
  TITLE: "title",
  CONTENT: "content",
  CHART: "chart",
  IMAGE: "image",
  COMPARISON: "comparison",
  TIMELINE: "timeline",
  TEAM: "team",
  PRICING: "pricing",
  TESTIMONIAL: "testimonial",
  CTA: "cta",
  SECTION_BREAK: "section_break",
  BLANK: "blank",
} as const;
export type SlideContentType =
  (typeof SlideContentType)[keyof typeof SlideContentType];

// -----------------------------------------------------------------------------
// Core Interfaces
// -----------------------------------------------------------------------------

export interface ColorScheme {
  name: string;
  colors: string[];
}

export interface SlidePreview {
  id: string;
  slideNumber: number;
  thumbnailUrl: string;
  fullImageUrl?: string;
  contentType: SlideContentType;
  title?: string;
  speakerNotes?: string;
}

export interface PresentationCreator {
  id: string;
  name: string;
  avatar?: string;
}

export interface Presentation {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  featuredImage?: string | null;
  galleryImages?: string[];
  price: number;
  compareAtPrice?: number | null;
  currency: string;
  slideCount: number;
  aspectRatio: AspectRatio;
  industry: Industry;
  presentationType: PresentationType;
  fileFormats: FileFormat[];
  compatibility: string[];
  colorSchemes: ColorScheme[];
  fontFamilies: string[];
  fileSize?: number;
  hasAnimations: boolean;
  hasTransitions: boolean;
  hasSpeakerNotes: boolean;
  hasCharts: boolean;
  hasImages: boolean;
  isFullyEditable: boolean;
  includesDocumentation: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  downloadCount: number;
  viewCount: number;
  averageRating: number;
  totalReviews: number;
  slides?: SlidePreview[];
  creator?: PresentationCreator;
  tags?: { id: string; name: string; slug: string }[];
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string[];
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// -----------------------------------------------------------------------------
// Query / Filter Types
// -----------------------------------------------------------------------------

export interface PresentationQueryParams {
  cursor?: string;
  limit?: number;
  search?: string;
  industry?: Industry;
  presentationType?: PresentationType;
  aspectRatio?: AspectRatio;
  minSlides?: number;
  maxSlides?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  fileFormat?: FileFormat;
  hasAnimations?: boolean;
  hasTransitions?: boolean;
  hasSpeakerNotes?: boolean;
  hasCharts?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface PresentationCursorMeta {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface PresentationsResponse {
  items: Presentation[];
  meta: PresentationCursorMeta;
}

export interface PresentationLandingData {
  featured: Presentation[];
  newArrivals: Presentation[];
  popular: Presentation[];
  byIndustry: Record<Industry, Presentation[]>;
  byType: Record<PresentationType, Presentation[]>;
  stats: {
    totalPresentations: number;
    totalSlides: number;
    totalIndustries: number;
    totalTypes: number;
  };
  industryCounts: Record<Industry, number>;
  typeCounts: Record<PresentationType, number>;
}

export interface PresentationStatsData {
  totalPresentations: number;
  totalSlides: number;
  totalIndustries: number;
  totalTypes: number;
  averageSlideCount: number;
}

// -----------------------------------------------------------------------------
// Display Helper Maps
// -----------------------------------------------------------------------------

export const INDUSTRY_LABELS: Record<Industry, string> = {
  [Industry.TECHNOLOGY]: "Technology",
  [Industry.HEALTHCARE]: "Healthcare",
  [Industry.FINANCE]: "Finance",
  [Industry.EDUCATION]: "Education",
  [Industry.MARKETING]: "Marketing",
  [Industry.REAL_ESTATE]: "Real Estate",
  [Industry.CONSULTING]: "Consulting",
  [Industry.STARTUP]: "Startup",
  [Industry.GOVERNMENT]: "Government",
  [Industry.NONPROFIT]: "Nonprofit",
  [Industry.RETAIL]: "Retail",
  [Industry.MANUFACTURING]: "Manufacturing",
  [Industry.ENERGY]: "Energy",
  [Industry.HOSPITALITY]: "Hospitality",
  [Industry.LEGAL]: "Legal",
  [Industry.GENERAL]: "General",
};

export const PRESENTATION_TYPE_LABELS: Record<PresentationType, string> = {
  [PresentationType.PITCH_DECK]: "Pitch Deck",
  [PresentationType.BUSINESS_PLAN]: "Business Plan",
  [PresentationType.SALES_PROPOSAL]: "Sales Proposal",
  [PresentationType.COMPANY_PROFILE]: "Company Profile",
  [PresentationType.ANNUAL_REPORT]: "Annual Report",
  [PresentationType.PROJECT_PROPOSAL]: "Project Proposal",
  [PresentationType.TRAINING_MATERIAL]: "Training Material",
  [PresentationType.WEBINAR_SLIDES]: "Webinar Slides",
  [PresentationType.INFOGRAPHIC_DECK]: "Infographic Deck",
  [PresentationType.CASE_STUDY]: "Case Study",
  [PresentationType.PORTFOLIO]: "Portfolio",
  [PresentationType.GENERAL]: "General",
};

export const INDUSTRY_ICONS: Record<Industry, string> = {
  [Industry.TECHNOLOGY]: "💻",
  [Industry.HEALTHCARE]: "🏥",
  [Industry.FINANCE]: "💰",
  [Industry.EDUCATION]: "🎓",
  [Industry.MARKETING]: "📣",
  [Industry.REAL_ESTATE]: "🏠",
  [Industry.CONSULTING]: "📊",
  [Industry.STARTUP]: "🚀",
  [Industry.GOVERNMENT]: "🏛️",
  [Industry.NONPROFIT]: "🤝",
  [Industry.RETAIL]: "🛍️",
  [Industry.MANUFACTURING]: "🏭",
  [Industry.ENERGY]: "⚡",
  [Industry.HOSPITALITY]: "🏨",
  [Industry.LEGAL]: "⚖️",
  [Industry.GENERAL]: "📋",
};

export const INDUSTRY_COLORS: Record<Industry, string> = {
  [Industry.TECHNOLOGY]: "#1E4DB7",
  [Industry.HEALTHCARE]: "#059669",
  [Industry.FINANCE]: "#D97706",
  [Industry.EDUCATION]: "#7C3AED",
  [Industry.MARKETING]: "#EC4899",
  [Industry.REAL_ESTATE]: "#14B8A6",
  [Industry.CONSULTING]: "#F59A23",
  [Industry.STARTUP]: "#EF4444",
  [Industry.GOVERNMENT]: "#6366F1",
  [Industry.NONPROFIT]: "#10B981",
  [Industry.RETAIL]: "#F97316",
  [Industry.MANUFACTURING]: "#64748B",
  [Industry.ENERGY]: "#EAB308",
  [Industry.HOSPITALITY]: "#8B5CF6",
  [Industry.LEGAL]: "#0EA5E9",
  [Industry.GENERAL]: "#6B7280",
};

export const ASPECT_RATIO_LABELS: Record<AspectRatio, string> = {
  [AspectRatio.WIDESCREEN_16_9]: "16:9 (Widescreen)",
  [AspectRatio.STANDARD_4_3]: "4:3 (Standard)",
  [AspectRatio.ULTRAWIDE_21_9]: "21:9 (Ultrawide)",
  [AspectRatio.SQUARE_1_1]: "1:1 (Square)",
  [AspectRatio.PORTRAIT_9_16]: "9:16 (Portrait)",
};

export const PRESENTATION_TYPE_COLORS: Record<PresentationType, string> = {
  [PresentationType.PITCH_DECK]: "#D24726",
  [PresentationType.BUSINESS_PLAN]: "#1E4DB7",
  [PresentationType.SALES_PROPOSAL]: "#059669",
  [PresentationType.COMPANY_PROFILE]: "#7C3AED",
  [PresentationType.ANNUAL_REPORT]: "#D97706",
  [PresentationType.PROJECT_PROPOSAL]: "#F59A23",
  [PresentationType.TRAINING_MATERIAL]: "#EC4899",
  [PresentationType.WEBINAR_SLIDES]: "#14B8A6",
  [PresentationType.INFOGRAPHIC_DECK]: "#EF4444",
  [PresentationType.CASE_STUDY]: "#6366F1",
  [PresentationType.PORTFOLIO]: "#0EA5E9",
  [PresentationType.GENERAL]: "#6B7280",
};
