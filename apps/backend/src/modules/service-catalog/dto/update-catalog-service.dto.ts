import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsUUID,
  IsObject,
  MaxLength,
  MinLength,
  Min,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DurationRangeDto } from './create-catalog-service.dto';

export class UpdateCatalogServiceDto {
  @ApiPropertyOptional({ example: 'Digital Transformation Strategy' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ example: 'digital-transformation-strategy' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Comprehensive digital transformation strategy development and implementation planning.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ example: 'Assessment of current digital maturity, roadmap development, technology selection...' })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiPropertyOptional({ example: 'Lightbulb' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  towerId?: string;

  @ApiPropertyOptional({ type: [String], example: ['Digital Maturity Assessment Report', 'Transformation Roadmap', 'Technology Selection Matrix'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  typicalDeliverables?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Clear digital vision and strategy', 'Prioritized transformation initiatives', 'Measurable business outcomes'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  outcomes?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Advisory', 'Project-based', 'Retainer'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  engagementTypes?: string[];

  @ApiPropertyOptional({ type: DurationRangeDto, example: { min: '4 weeks', max: '12 weeks' } })
  @IsOptional()
  @ValidateNested()
  @Type(() => DurationRangeDto)
  durationRange?: DurationRangeDto;

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

  @ApiPropertyOptional({ type: [String], example: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  relatedServiceIds?: string[];

  @ApiPropertyOptional({ type: [String], example: ['Financial Services', 'Healthcare', 'Manufacturing'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industryTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
