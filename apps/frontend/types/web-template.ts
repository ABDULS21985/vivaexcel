// =============================================================================
// Web Template Types
// =============================================================================
// Frontend types for the web templates marketplace, based on backend entities.

import type { CursorMeta } from "./digital-product";

// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum TemplateType {
  LANDING_PAGE = "landing_page",
  SAAS_BOILERPLATE = "saas_boilerplate",
  ECOMMERCE_THEME = "ecommerce_theme",
  PORTFOLIO = "portfolio",
  BLOG_THEME = "blog_theme",
  ADMIN_DASHBOARD = "admin_dashboard",
  MOBILE_APP_TEMPLATE = "mobile_app_template",
  EMAIL_TEMPLATE = "email_template",
  STARTUP_KIT = "startup_kit",
  COMPONENT_LIBRARY = "component_library",
}

export enum Framework {
  NEXTJS = "nextjs",
  REACT = "react",
  VUE = "vue",
  NUXT = "nuxt",
  SVELTE = "svelte",
  ASTRO = "astro",
  ANGULAR = "angular",
  HTML_CSS = "html_css",
  TAILWIND = "tailwind",
  BOOTSTRAP = "bootstrap",
  WORDPRESS = "wordpress",
  SHOPIFY = "shopify",
}

export enum PackageManager {
  NPM = "npm",
  YARN = "yarn",
  PNPM = "pnpm",
  BUN = "bun",
}

export enum LicenseType {
  SINGLE_USE = "single_use",
  MULTI_USE = "multi_use",
  EXTENDED = "extended",
  UNLIMITED = "unlimited",
}

export enum WebTemplateStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
  COMING_SOON = "coming_soon",
}

// -----------------------------------------------------------------------------
// Core Types
// -----------------------------------------------------------------------------

export interface WebTemplateCreator {
  id: string;
  name: string;
  avatar?: string;
}

export interface TemplateDemo {
  id: string;
  templateId: string;
  name: string;
  demoUrl: string;
  screenshotUrl?: string;
  sortOrder: number;
}

export interface TemplateLicense {
  id: string;
  templateId: string;
  userId: string;
  orderId?: string;
  licenseKey: string;
  licenseType: LicenseType;
  activationCount: number;
  maxActivations: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  hosting: string[];
  services: string[];
}

export interface ResponsiveBreakpoints {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

export interface WebTemplate {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  templateType: TemplateType;
  framework: Framework;
  features: string[];
  demoUrl?: string;
  githubRepoUrl?: string;
  techStack?: TechStack;
  browserSupport: string[];
  responsiveBreakpoints?: ResponsiveBreakpoints;
  pageCount: number;
  componentCount: number;
  hasTypeScript: boolean;
  nodeVersion?: string;
  packageManager?: PackageManager;
  license: LicenseType;
  supportDuration: number;
  documentationUrl?: string;
  changelogUrl?: string;
  price: number;
  compareAtPrice?: number | null;
  status: WebTemplateStatus;
  featuredImage?: string | null;
  previewImages?: string[];
  metadata?: Record<string, unknown>;
  organizationId?: string;
  createdBy?: string;
  creator?: WebTemplateCreator;
  demos?: TemplateDemo[];
  licenses?: TemplateLicense[];
  // Extended fields available from the API
  isFeatured?: boolean;
  category?: { id: string; name: string; slug: string };
  tags?: { id: string; name: string; slug: string }[];
  averageRating?: number;
  totalReviews?: number;
  downloadCount?: number;
  viewCount?: number;
  currency?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// -----------------------------------------------------------------------------
// Filter / Query Types
// -----------------------------------------------------------------------------

export interface WebTemplateFilters {
  cursor?: string;
  limit?: number;
  search?: string;
  templateType?: TemplateType;
  framework?: Framework;
  licenseType?: LicenseType;
  status?: WebTemplateStatus;
  minPrice?: number;
  maxPrice?: number;
  hasTypeScript?: boolean;
  isFeatured?: boolean;
  features?: string[];
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CompatibilityCheckRequest {
  framework?: Framework;
  features?: string[];
  hasTypeScript?: boolean;
  packageManager?: PackageManager;
  nodeVersion?: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------

export interface WebTemplatesResponse {
  items: WebTemplate[];
  meta: CursorMeta;
}

// -----------------------------------------------------------------------------
// Display Helpers
// -----------------------------------------------------------------------------

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  [TemplateType.LANDING_PAGE]: "Landing Page",
  [TemplateType.SAAS_BOILERPLATE]: "SaaS Boilerplate",
  [TemplateType.ECOMMERCE_THEME]: "eCommerce Theme",
  [TemplateType.PORTFOLIO]: "Portfolio",
  [TemplateType.BLOG_THEME]: "Blog Theme",
  [TemplateType.ADMIN_DASHBOARD]: "Admin Dashboard",
  [TemplateType.MOBILE_APP_TEMPLATE]: "Mobile App Template",
  [TemplateType.EMAIL_TEMPLATE]: "Email Template",
  [TemplateType.STARTUP_KIT]: "Startup Kit",
  [TemplateType.COMPONENT_LIBRARY]: "Component Library",
};

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  [Framework.NEXTJS]: "Next.js",
  [Framework.REACT]: "React",
  [Framework.VUE]: "Vue",
  [Framework.NUXT]: "Nuxt",
  [Framework.SVELTE]: "Svelte",
  [Framework.ASTRO]: "Astro",
  [Framework.ANGULAR]: "Angular",
  [Framework.HTML_CSS]: "HTML / CSS",
  [Framework.TAILWIND]: "Tailwind CSS",
  [Framework.BOOTSTRAP]: "Bootstrap",
  [Framework.WORDPRESS]: "WordPress",
  [Framework.SHOPIFY]: "Shopify",
};

export const LICENSE_TYPE_LABELS: Record<LicenseType, string> = {
  [LicenseType.SINGLE_USE]: "Single Use",
  [LicenseType.MULTI_USE]: "Multi Use",
  [LicenseType.EXTENDED]: "Extended",
  [LicenseType.UNLIMITED]: "Unlimited",
};

export const TEMPLATE_FEATURES: string[] = [
  "Authentication",
  "Payments",
  "Dark Mode",
  "i18n",
  "SEO Optimized",
  "Responsive",
  "TypeScript",
  "API Routes",
  "Database",
  "Email",
  "Analytics",
  "CMS",
];

// Aliases used by various components
export type TemplateFramework = Framework;
export type TemplateLicenseType = LicenseType;

// Category & tag types (mirrors DigitalProductCategory / DigitalProductTag)
export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface TemplateTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Re-export ApiResponseWrapper for template-api.ts convenience
export type { ApiResponseWrapper } from "./digital-product";

// Framework colors
export const FRAMEWORK_COLORS: Record<Framework, string> = {
  [Framework.NEXTJS]: "#000000",
  [Framework.REACT]: "#61DAFB",
  [Framework.VUE]: "#4FC08D",
  [Framework.NUXT]: "#00DC82",
  [Framework.SVELTE]: "#FF3E00",
  [Framework.ASTRO]: "#BC52EE",
  [Framework.ANGULAR]: "#DD0031",
  [Framework.HTML_CSS]: "#E34F26",
  [Framework.TAILWIND]: "#06B6D4",
  [Framework.BOOTSTRAP]: "#7952B3",
  [Framework.WORDPRESS]: "#21759B",
  [Framework.SHOPIFY]: "#96BF48",
};

// Template type colors
export const TEMPLATE_TYPE_COLORS: Record<TemplateType, string> = {
  [TemplateType.LANDING_PAGE]: "#1E4DB7",
  [TemplateType.SAAS_BOILERPLATE]: "#7C3AED",
  [TemplateType.ECOMMERCE_THEME]: "#059669",
  [TemplateType.PORTFOLIO]: "#EC4899",
  [TemplateType.BLOG_THEME]: "#F59A23",
  [TemplateType.ADMIN_DASHBOARD]: "#D24726",
  [TemplateType.MOBILE_APP_TEMPLATE]: "#06B6D4",
  [TemplateType.EMAIL_TEMPLATE]: "#6366F1",
  [TemplateType.STARTUP_KIT]: "#059669",
  [TemplateType.COMPONENT_LIBRARY]: "#8B5CF6",
};
