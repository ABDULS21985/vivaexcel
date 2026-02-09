import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  IsString,
  IsUUID,
  IsNumber,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// ──────────────────────────────────────────────
//  Query DTOs
// ──────────────────────────────────────────────

export class GetSimilarProductsDto {
  @ApiPropertyOptional({
    description: 'Maximum number of similar products to return',
    default: 8,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 8;

  @ApiPropertyOptional({
    description: 'Filter by product type (e.g. powerpoint, document)',
  })
  @IsOptional()
  @IsString()
  type?: string;
}

export class GetPersonalizedDto {
  @ApiPropertyOptional({
    description: 'Maximum number of recommendations to return',
    default: 12,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({
    description: 'Filter by product types (comma-separated)',
    example: 'powerpoint,document',
  })
  @IsOptional()
  @IsString()
  types?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  priceMax?: number;
}

// ──────────────────────────────────────────────
//  Body DTOs
// ──────────────────────────────────────────────

export class GetAIRecommendationsDto {
  @ApiPropertyOptional({
    description: 'Natural language context describing what the user is looking for',
    example: 'I need a financial dashboard template for my startup',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  context?: string;

  @ApiPropertyOptional({
    description: 'Preferred product types',
    example: ['powerpoint', 'document'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferences?: string[];

  @ApiPropertyOptional({
    description: 'Maximum number of AI recommendations to return',
    default: 6,
    minimum: 1,
    maximum: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  limit?: number = 6;
}

export class LogRecommendationClickDto {
  @ApiProperty({
    description: 'The recommendation log ID',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  recommendationLogId: string;

  @ApiProperty({
    description: 'The product ID that was clicked',
    example: 'f1e2d3c4-b5a6-7890-fedc-ba0987654321',
  })
  @IsUUID()
  clickedProductId: string;
}
