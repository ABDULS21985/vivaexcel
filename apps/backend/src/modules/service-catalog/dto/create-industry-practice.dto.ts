import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIndustryPracticeDto {
  @ApiProperty({ example: 'Financial Services' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'FIN-SERVICES' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Z][A-Z0-9_-]*$/, {
    message: 'Code must be uppercase alphanumeric with optional hyphens/underscores',
  })
  code: string;

  @ApiProperty({ example: 'financial-services' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'Comprehensive solutions for the financial services industry including banking, insurance, and capital markets.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ example: 'Building2' })
  @IsString()
  @MaxLength(50)
  icon: string;

  @ApiPropertyOptional({ example: '#1E4DB7' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Accent color must be a valid hex color (e.g., #1E4DB7)',
  })
  accentColor?: string;

  @ApiPropertyOptional({ type: [String], example: ['Banking', 'Insurance', 'Capital Markets'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subSectors?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Risk Management', 'Regulatory Compliance', 'Digital Banking'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyOfferings?: string[];

  @ApiPropertyOptional({ type: [String], example: ['550e8400-e29b-41d4-a716-446655440000'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  relatedTowerIds?: string[];

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  displayOrder: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
