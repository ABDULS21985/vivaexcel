import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  TemplateType,
  TemplateFramework,
  TemplateLicenseType,
  TemplatePackageManager,
  TemplateStatus,
} from '../../../entities/web-template.entity';

export class CreateWebTemplateDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ enum: TemplateType })
  @IsEnum(TemplateType)
  templateType: TemplateType;

  @ApiProperty({ enum: TemplateFramework })
  @IsEnum(TemplateFramework)
  framework: TemplateFramework;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  demoCredentials?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  githubRepoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  techStack?: {
    frontend: string[];
    backend: string[];
    database: string[];
    hosting: string[];
    services: string[];
  };

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  browserSupport?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  responsiveBreakpoints?: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  pageCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  componentCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasTypeScript?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nodeVersion?: string;

  @ApiPropertyOptional({ enum: TemplatePackageManager })
  @IsOptional()
  @IsEnum(TemplatePackageManager)
  packageManager?: TemplatePackageManager;

  @ApiPropertyOptional({ enum: TemplateLicenseType })
  @IsOptional()
  @IsEnum(TemplateLicenseType)
  license?: TemplateLicenseType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  supportDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  documentationUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  changelogUrl?: string;

  @ApiProperty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Type(() => Number)
  compareAtPrice?: number;

  @ApiPropertyOptional({ enum: TemplateStatus })
  @IsOptional()
  @IsEnum(TemplateStatus)
  status?: TemplateStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewImages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  seoKeywords?: string;
}
