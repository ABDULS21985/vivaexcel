import {
  Entity,
  Column,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
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

export enum Framework {
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

export enum PackageManager {
  NPM = 'NPM',
  YARN = 'YARN',
  PNPM = 'PNPM',
  BUN = 'BUN',
}

export enum LicenseType {
  SINGLE_USE = 'SINGLE_USE',
  MULTI_USE = 'MULTI_USE',
  EXTENDED = 'EXTENDED',
  UNLIMITED = 'UNLIMITED',
}

export enum WebTemplateStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
  COMING_SOON = 'COMING_SOON',
}

@Entity('web_templates')
export class WebTemplate extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string;

  @Column({ name: 'template_type', type: 'enum', enum: TemplateType })
  templateType: TemplateType;

  @Column({ type: 'enum', enum: Framework })
  framework: Framework;

  @Column({ type: 'jsonb', default: '[]' })
  features: string[];

  @Column({ name: 'demo_url', nullable: true })
  demoUrl?: string;

  @Column({ name: 'demo_credentials', type: 'jsonb', nullable: true })
  demoCredentials?: Record<string, string>;

  @Column({ name: 'github_repo_url', nullable: true })
  githubRepoUrl?: string;

  @Column({ name: 'tech_stack', type: 'jsonb', nullable: true })
  techStack?: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    services: string[];
  };

  @Column({
    name: 'browser_support',
    type: 'jsonb',
    default: '["Chrome","Firefox","Safari","Edge"]',
  })
  browserSupport: string[];

  @Column({
    name: 'responsive_breakpoints',
    type: 'jsonb',
    default: '{"mobile":true,"tablet":true,"desktop":true}',
  })
  responsiveBreakpoints: { mobile: boolean; tablet: boolean; desktop: boolean };

  @Column({ name: 'page_count', type: 'int', default: 0 })
  pageCount: number;

  @Column({ name: 'component_count', type: 'int', default: 0 })
  componentCount: number;

  @Column({ name: 'has_typescript', default: false })
  hasTypeScript: boolean;

  @Column({ name: 'node_version', nullable: true })
  nodeVersion?: string;

  @Column({
    name: 'package_manager',
    type: 'enum',
    enum: PackageManager,
    nullable: true,
  })
  packageManager?: PackageManager;

  @Column({
    type: 'enum',
    enum: LicenseType,
    default: LicenseType.SINGLE_USE,
  })
  license: LicenseType;

  @Column({ name: 'support_duration', type: 'int', default: 6 })
  supportDuration: number;

  @Column({ name: 'documentation_url', nullable: true })
  documentationUrl?: string;

  @Column({ name: 'changelog_url', nullable: true })
  changelogUrl?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  compareAtPrice?: number;

  @Column({
    type: 'enum',
    enum: WebTemplateStatus,
    default: WebTemplateStatus.DRAFT,
  })
  status: WebTemplateStatus;

  @Column({ name: 'featured_image', nullable: true })
  featuredImage?: string;

  @Column({ name: 'preview_images', type: 'jsonb', nullable: true })
  previewImages?: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'organization_id', nullable: true })
  organizationId?: string;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: string;

  // Relations

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @OneToMany(() => TemplateLicense, (license) => license.template)
  licenses?: TemplateLicense[];

  @OneToMany(() => TemplateDemo, (demo) => demo.template)
  demos?: TemplateDemo[];
}
