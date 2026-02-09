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

export class UpdateEngagementModelDto {
  @ApiPropertyOptional({ example: 'Consulting & Advisory' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'CONSULTING' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  @Matches(/^[A-Z][A-Z0-9_-]*$/, {
    message: 'Code must be uppercase alphanumeric with optional hyphens/underscores',
  })
  code?: string;

  @ApiPropertyOptional({ example: 'consulting-advisory' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({ example: 'Expert guidance and strategic advice for your business challenges.' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ example: '2-6 weeks' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  durationRange?: string;

  @ApiPropertyOptional({ type: [String], example: ['Strategic roadmap', 'Assessment report', 'Recommendations'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  typicalOutputs?: string[];

  @ApiPropertyOptional({ example: 'Users' })
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
  metadata?: Record<string, unknown>;
}
