export enum TemplateType {
  LANDING_PAGE = 'LANDING_PAGE',
  SAAS_BOILERPLATE = 'SAAS_BOILERPLATE',
  ECOMMERCE_THEME = 'ECOMMERCE_THEME',
  PORTFOLIO = 'PORTFOLIO',
  BLOG_THEME = 'BLOG_THEME',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  MOBILE_APP_TEMPLATE = 'MOBILE_APP_TEMPLATE',
  EMAIL_TEMPLATE = 'EMAIL_TEMPLATE',
  STARTUP_KIT = 'STARTUP_KIT',
  COMPONENT_LIBRARY = 'COMPONENT_LIBRARY',
}

export enum TemplateFramework {
  NEXTJS = 'NEXTJS',
  REACT = 'REACT',
  VUE = 'VUE',
  NUXT = 'NUXT',
  SVELTE = 'SVELTE',
  ASTRO = 'ASTRO',
  ANGULAR = 'ANGULAR',
  HTML_CSS = 'HTML_CSS',
  TAILWIND = 'TAILWIND',
  BOOTSTRAP = 'BOOTSTRAP',
  WORDPRESS = 'WORDPRESS',
  SHOPIFY = 'SHOPIFY',
}

export enum TemplateLicenseType {
  SINGLE_USE = 'SINGLE_USE',
  MULTI_USE = 'MULTI_USE',
  EXTENDED = 'EXTENDED',
  UNLIMITED = 'UNLIMITED',
}

export enum TemplatePackageManager {
  NPM = 'NPM',
  YARN = 'YARN',
  PNPM = 'PNPM',
  BUN = 'BUN',
}

export enum TemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  COMING_SOON = 'COMING_SOON',
}

export interface TemplateCreator {
  id: string;
  name: string;
  avatar?: string;
}

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

export interface TemplateDemo {
  id: string;
  name: string;
  demoUrl: string;
  screenshotUrl?: string;
  sortOrder: number;
}

export interface TemplateLicense {
  id: string;
  templateId: string;
  userId: string;
  licenseKey: string;
  licenseType: TemplateLicenseType;
  activationCount: number;
  maxActivations: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface WebTemplate {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  templateType: TemplateType;
  framework: TemplateFramework;
  features: string[];
  demoUrl?: string;
  githubRepoUrl?: string;
  techStack?: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    services: string[];
  };
  browserSupport: string[];
  responsiveBreakpoints?: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  pageCount: number;
  componentCount: number;
  hasTypeScript: boolean;
  nodeVersion?: string;
  packageManager?: TemplatePackageManager;
  license: TemplateLicenseType;
  supportDuration: number;
  documentationUrl?: string;
  changelogUrl?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  status: TemplateStatus;
  featuredImage?: string;
  previewImages?: string[];
  metadata?: Record<string, any>;
  downloadCount: number;
  viewCount: number;
  averageRating: number;
  totalReviews: number;
  isFeatured: boolean;
  isBestseller: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  category?: TemplateCategory;
  tags: TemplateTag[];
  demos: TemplateDemo[];
  creator?: TemplateCreator;
  createdAt: string;
  updatedAt: string;
}

export interface WebTemplateFilters {
  cursor?: string;
  limit?: number;
  search?: string;
  templateType?: TemplateType;
  framework?: TemplateFramework;
  licenseType?: TemplateLicenseType;
  status?: TemplateStatus;
  categorySlug?: string;
  tagSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  hasTypeScript?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  features?: string[];
  browserSupport?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CursorMeta {
  total?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  nextCursor?: string | null;
  previousCursor?: string | null;
}

export interface WebTemplatesResponse {
  items: WebTemplate[];
  meta: CursorMeta;
}

export interface ApiResponseWrapper<T> {
  status: string;
  data: T;
  meta?: CursorMeta;
}

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  [TemplateType.LANDING_PAGE]: 'Landing Page',
  [TemplateType.SAAS_BOILERPLATE]: 'SaaS Boilerplate',
  [TemplateType.ECOMMERCE_THEME]: 'E-commerce Theme',
  [TemplateType.PORTFOLIO]: 'Portfolio',
  [TemplateType.BLOG_THEME]: 'Blog Theme',
  [TemplateType.ADMIN_DASHBOARD]: 'Admin Dashboard',
  [TemplateType.MOBILE_APP_TEMPLATE]: 'Mobile App Template',
  [TemplateType.EMAIL_TEMPLATE]: 'Email Template',
  [TemplateType.STARTUP_KIT]: 'Startup Kit',
  [TemplateType.COMPONENT_LIBRARY]: 'Component Library',
};

export const TEMPLATE_TYPE_COLORS: Record<TemplateType, string> = {
  [TemplateType.LANDING_PAGE]: '#3B82F6',
  [TemplateType.SAAS_BOILERPLATE]: '#8B5CF6',
  [TemplateType.ECOMMERCE_THEME]: '#10B981',
  [TemplateType.PORTFOLIO]: '#F59E0B',
  [TemplateType.BLOG_THEME]: '#EF4444',
  [TemplateType.ADMIN_DASHBOARD]: '#6366F1',
  [TemplateType.MOBILE_APP_TEMPLATE]: '#EC4899',
  [TemplateType.EMAIL_TEMPLATE]: '#14B8A6',
  [TemplateType.STARTUP_KIT]: '#F97316',
  [TemplateType.COMPONENT_LIBRARY]: '#06B6D4',
};

export const FRAMEWORK_LABELS: Record<TemplateFramework, string> = {
  [TemplateFramework.NEXTJS]: 'Next.js',
  [TemplateFramework.REACT]: 'React',
  [TemplateFramework.VUE]: 'Vue',
  [TemplateFramework.NUXT]: 'Nuxt',
  [TemplateFramework.SVELTE]: 'Svelte',
  [TemplateFramework.ASTRO]: 'Astro',
  [TemplateFramework.ANGULAR]: 'Angular',
  [TemplateFramework.HTML_CSS]: 'HTML/CSS',
  [TemplateFramework.TAILWIND]: 'Tailwind CSS',
  [TemplateFramework.BOOTSTRAP]: 'Bootstrap',
  [TemplateFramework.WORDPRESS]: 'WordPress',
  [TemplateFramework.SHOPIFY]: 'Shopify',
};

export const FRAMEWORK_COLORS: Record<TemplateFramework, string> = {
  [TemplateFramework.NEXTJS]: '#000000',
  [TemplateFramework.REACT]: '#61DAFB',
  [TemplateFramework.VUE]: '#4FC08D',
  [TemplateFramework.NUXT]: '#00DC82',
  [TemplateFramework.SVELTE]: '#FF3E00',
  [TemplateFramework.ASTRO]: '#FF5D01',
  [TemplateFramework.ANGULAR]: '#DD0031',
  [TemplateFramework.HTML_CSS]: '#E34F26',
  [TemplateFramework.TAILWIND]: '#06B6D4',
  [TemplateFramework.BOOTSTRAP]: '#7952B3',
  [TemplateFramework.WORDPRESS]: '#21759B',
  [TemplateFramework.SHOPIFY]: '#7AB55C',
};

export const LICENSE_TYPE_LABELS: Record<TemplateLicenseType, string> = {
  [TemplateLicenseType.SINGLE_USE]: 'Single Use',
  [TemplateLicenseType.MULTI_USE]: 'Multi Use',
  [TemplateLicenseType.EXTENDED]: 'Extended',
  [TemplateLicenseType.UNLIMITED]: 'Unlimited',
};

export const TEMPLATE_FEATURES = [
  'Authentication',
  'Payments',
  'Dark Mode',
  'i18n',
  'SEO Optimized',
  'Responsive',
  'TypeScript',
  'API Routes',
  'Database',
  'Email',
  'Analytics',
  'CMS',
] as const;
