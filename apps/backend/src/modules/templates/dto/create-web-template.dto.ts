import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsUUID,
  IsInt,
  Min,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  TemplateType,
  Framework,
  LicenseType,
  PackageManager,
  WebTemplateStatus,
} from '../../../entities/web-template.enums';

export class CreateWebTemplateDto {
  @ApiProperty({ example: 'SaaS Dashboard Pro', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'saas-dashboard-pro', maxLength: 255 })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'A fully-featured SaaS dashboard template with analytics, user management, and billing integration.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Professional SaaS dashboard with 50+ components', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ enum: TemplateType, example: TemplateType.SAAS_BOILERPLATE })
  @IsEnum(TemplateType)
  templateType: TemplateType;

  @ApiProperty({ enum: Framework, example: Framework.NEXTJS })
  @IsEnum(Framework)
  framework: Framework;

  @ApiPropertyOptional({ type: [String], example: ['authentication', 'dark-mode', 'i18n', 'stripe-billing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ example: 'https://demo.example.com/saas-dashboard' })
  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @ApiPropertyOptional({ example: { email: 'demo@example.com', password: 'demo123' } })
  @IsOptional()
  @IsObject()
  demoCredentials?: Record<string, string>;

  @ApiPropertyOptional({ example: 'https://github.com/org/saas-dashboard-pro' })
  @IsOptional()
  @IsUrl()
  githubRepoUrl?: string;

  @ApiPropertyOptional({
    example: {
      frontend: ['Next.js', 'React', 'Tailwind CSS'],
      backend: ['Node.js', 'Prisma'],
      database: ['PostgreSQL'],
      hosting: ['Vercel'],
      services: ['Stripe', 'SendGrid'],
    },
  })
  @IsOptional()
  @IsObject()
  techStack?: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    services: string[];
  };

  @ApiPropertyOptional({ type: [String], example: ['Chrome', 'Firefox', 'Safari', 'Edge'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  browserSupport?: string[];

  @ApiPropertyOptional({ example: { mobile: true, tablet: true, desktop: true } })
  @IsOptional()
  @IsObject()
  responsiveBreakpoints?: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  pageCount?: number;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  componentCount?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  hasTypeScript?: boolean;

  @ApiPropertyOptional({ example: '18.17.0' })
  @IsOptional()
  @IsString()
  nodeVersion?: string;

  @ApiPropertyOptional({ enum: PackageManager, example: PackageManager.PNPM })
  @IsOptional()
  @IsEnum(PackageManager)
  packageManager?: PackageManager;

  @ApiPropertyOptional({ enum: LicenseType, example: LicenseType.SINGLE_USE })
  @IsOptional()
  @IsEnum(LicenseType)
  license?: LicenseType;

  @ApiPropertyOptional({ example: 180, description: 'Support duration in days' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  supportDuration?: number;

  @ApiPropertyOptional({ example: 'https://docs.example.com/saas-dashboard' })
  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional({ example: 'https://changelog.example.com/saas-dashboard' })
  @IsOptional()
  @IsUrl()
  changelogUrl?: string;

  @ApiProperty({ example: 79.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 129.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 'USD', description: 'ISO 4217 currency code' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ enum: WebTemplateStatus, example: WebTemplateStatus.DRAFT })
  @IsOptional()
  @IsEnum(WebTemplateStatus)
  status?: WebTemplateStatus;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/images/saas-dashboard-featured.png' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({
    type: [String],
    example: [
      'https://cdn.example.com/images/preview-1.png',
      'https://cdn.example.com/images/preview-2.png',
    ],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewImages?: string[];

  @ApiPropertyOptional({ example: { version: '2.1.0', lastUpdated: '2025-01-15' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @ApiPropertyOptional({ example: 'SaaS Dashboard Pro - Premium Next.js Template', maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({ example: 'Build your SaaS application faster with our premium dashboard template.', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @ApiPropertyOptional({ example: 'saas, dashboard, nextjs, template, boilerplate' })
  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String], example: ['tag-uuid-1', 'tag-uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
