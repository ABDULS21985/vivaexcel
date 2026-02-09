import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUUID,
  IsNumber,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DigitalProductType,
  DigitalProductStatus,
} from '../../../entities/digital-product.entity';

export class CreateDigitalProductDto {
  @ApiProperty({ example: 'Professional PowerPoint Template' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'professional-powerpoint-template' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({
    example: 'A comprehensive PowerPoint template for business presentations',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Professional template for business presentations',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty({ enum: DigitalProductType, example: DigitalProductType.POWERPOINT })
  @IsEnum(DigitalProductType)
  type: DigitalProductType;

  @ApiPropertyOptional({
    enum: DigitalProductStatus,
    default: DigitalProductStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(DigitalProductStatus)
  status?: DigitalProductStatus;

  @ApiProperty({ example: 29.99 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 49.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ example: 'https://example.com/featured.jpg' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  galleryImages?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isBestseller?: boolean;

  @ApiPropertyOptional({ example: { compatibility: 'Office 365', slides: 50 } })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: 'Professional PowerPoint Template | KTBlog' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @ApiPropertyOptional({
    example: 'Download our professional PowerPoint template for stunning presentations',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @ApiPropertyOptional({ type: [String], example: ['powerpoint', 'template', 'business'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];

  @ApiPropertyOptional({ example: 'uuid-of-organization' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['uuid-tag-1', 'uuid-tag-2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ example: '2024-06-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  publishedAt?: string;
}
