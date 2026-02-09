import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  MaxLength,
  MinLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateServiceTowerDto {
  @ApiPropertyOptional({ example: 'Corporate, Digital & Business Strategy' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Business Strategy' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shortName?: string;

  @ApiPropertyOptional({ example: 'STRATEGY' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Z][A-Z0-9_-]*$/, {
    message: 'Code must be uppercase alphanumeric with optional hyphens/underscores',
  })
  code?: string;

  @ApiPropertyOptional({ example: 'business-strategy' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Define strategic direction, competitive positioning, and digital business models.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ example: 'Corporate strategy, growth strategy, competitive positioning...' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ type: [String], example: ['Clear direction with quantified benefits'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  typicalOutcomes?: string[];

  @ApiPropertyOptional({ example: 'Target' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: '#1E4DB7' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Accent color must be a valid hex color (e.g., #1E4DB7)',
  })
  accentColor?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ type: [String], example: ['ISO 27001', 'NIST CSF'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];

  @ApiPropertyOptional({ type: [String], example: ['TOGAF', 'COBIT', 'ITIL'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  frameworks?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
