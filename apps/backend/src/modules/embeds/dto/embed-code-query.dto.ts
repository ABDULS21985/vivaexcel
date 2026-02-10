import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EmbedWidgetType, EmbedTheme } from '../enums/embed.enums';

export class EmbedCodeQueryDto {
  @ApiProperty({
    description: 'Widget type',
    enum: EmbedWidgetType,
    example: EmbedWidgetType.PRODUCT_CARD,
  })
  @IsEnum(EmbedWidgetType)
  type!: EmbedWidgetType;

  @ApiPropertyOptional({
    description: 'Product ID (for product-card and buy-button)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Product slug (for product-card and buy-button)',
    example: 'premium-excel-template',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  productSlug?: string;

  @ApiPropertyOptional({
    description: 'Category slug (for product-grid)',
    example: 'excel-templates',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Number of products to display (for product-grid)',
    default: 4,
    minimum: 1,
    maximum: 24,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  count?: number;

  @ApiPropertyOptional({
    description: 'Widget theme',
    enum: EmbedTheme,
    default: EmbedTheme.LIGHT,
  })
  @IsOptional()
  @IsEnum(EmbedTheme)
  theme?: EmbedTheme;

  @ApiPropertyOptional({
    description: 'Accent color (hex)',
    example: '#1E4DB7',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'accentColor must be a valid hex color (e.g. #1E4DB7)',
  })
  accentColor?: string;

  @ApiPropertyOptional({
    description: 'Border radius in pixels',
    example: 8,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  borderRadius?: number;

  @ApiPropertyOptional({
    description: 'Font family name',
    example: 'Inter',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fontFamily?: string;

  @ApiPropertyOptional({
    description: 'Locale for the widget',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  locale?: string;
}
