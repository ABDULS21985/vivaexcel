import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class CreateServiceTowerDto {
  @ApiProperty({ example: 'Corporate, Digital & Business Strategy' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Business Strategy' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  shortName: string;

  @ApiProperty({ example: 'STRATEGY' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Z][A-Z0-9_-]*$/, {
    message: 'Code must be uppercase alphanumeric with optional hyphens/underscores',
  })
  code: string;

  @ApiProperty({ example: 'business-strategy' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @ApiProperty({ example: 'Define strategic direction, competitive positioning, and digital business models.' })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiPropertyOptional({ example: 'Corporate strategy, growth strategy, competitive positioning...' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ type: [String], example: ['Clear direction with quantified benefits'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  typicalOutcomes?: string[];

  @ApiProperty({ example: 'Target' })
  @IsString()
  @MaxLength(50)
  icon: string;

  @ApiProperty({ example: '#1E4DB7' })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Accent color must be a valid hex color (e.g., #1E4DB7)',
  })
  accentColor: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: false })
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
