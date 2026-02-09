import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  JoinColumn,
  VersionColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { DigitalProductCategory } from './digital-product-category.entity';
import { DigitalProductTag } from './digital-product-tag.entity';
import { TemplateLicense } from './template-license.entity';
import { TemplateDemo } from './template-demo.entity';

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

@Entity('web_templates')
export class WebTemplate extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  shortDescription: string | null;

  @Index()
  @Column({ type: 'enum', enum: TemplateType })
  templateType: TemplateType;

  @Index()
  @Column({ type: 'enum', enum: TemplateFramework })
  framework: TemplateFramework;

  @Column({ type: 'jsonb', default: '[]' })
  features: string[];

  @Column({ type: 'varchar', nullable: true })
  demoUrl: string | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  demoCredentials: Record<string, string> | null;

  @Column({ type: 'varchar', nullable: true })
  githubRepoUrl: string | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    services: string[];
  } | null;

  @Column({ type: 'jsonb', default: '[]' })
  browserSupport: string[];

  @Column({ type: 'jsonb', nullable: true, default: null })
  responsiveBreakpoints: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  } | null;

  @Column({ type: 'int', default: 0 })
  pageCount: number;

  @Column({ type: 'int', default: 0 })
  componentCount: number;

  @Column({ type: 'boolean', default: false })
  hasTypeScript: boolean;

  @Column({ type: 'varchar', nullable: true })
  nodeVersion: string | null;

  @Column({ type: 'enum', enum: TemplatePackageManager, nullable: true })
  packageManager: TemplatePackageManager | null;

  @Column({ type: 'enum', enum: TemplateLicenseType, default: TemplateLicenseType.SINGLE_USE })
  license: TemplateLicenseType;

  @Column({ type: 'int', default: 0 })
  supportDuration: number;

  @Column({ type: 'varchar', nullable: true })
  documentationUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  changelogUrl: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  compareAtPrice: number | null;

  @Column({ type: 'varchar', default: 'USD' })
  currency: string;

  @Index()
  @Column({ type: 'enum', enum: TemplateStatus, default: TemplateStatus.DRAFT })
  status: TemplateStatus;

  @Column({ type: 'varchar', nullable: true })
  featuredImage: string | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  previewImages: string[] | null;

  @Column({ type: 'jsonb', nullable: true, default: null })
  metadata: Record<string, any> | null;

  @Column({ type: 'int', default: 0 })
  downloadCount: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isBestseller: boolean;

  @Column({ type: 'varchar', nullable: true })
  seoTitle: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoDescription: string | null;

  @Column({ type: 'varchar', nullable: true })
  seoKeywords: string | null;

  @Column({ type: 'varchar', nullable: true })
  organizationId: string | null;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @VersionColumn()
  version: number;

  // Relations
  @ManyToOne(() => User, { nullable: true, eager: false })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @ManyToOne(() => DigitalProductCategory, { nullable: true, eager: false })
  @JoinColumn({ name: 'categoryId' })
  category: DigitalProductCategory;

  @Column({ type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToMany(() => DigitalProductTag, { eager: false })
  @JoinTable({
    name: 'web_template_tags',
    joinColumn: { name: 'templateId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: DigitalProductTag[];

  @OneToMany(() => TemplateLicense, (license) => license.template)
  licenses: TemplateLicense[];

  @OneToMany(() => TemplateDemo, (demo) => demo.template)
  demos: TemplateDemo[];
}
