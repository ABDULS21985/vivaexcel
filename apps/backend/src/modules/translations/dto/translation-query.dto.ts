import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  TranslatableEntityType,
  SupportedLocale,
  TranslatableField,
} from '../entities/content-translation.entity';

/**
 * DTO for querying translations with filters
 */
export class TranslationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by entity type',
    enum: TranslatableEntityType,
  })
  @IsOptional()
  @IsEnum(TranslatableEntityType)
  entityType?: TranslatableEntityType;

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by locale',
    enum: SupportedLocale,
  })
  @IsOptional()
  @IsEnum(SupportedLocale)
  locale?: SupportedLocale;

  @ApiPropertyOptional({
    description: 'Filter by field',
    enum: TranslatableField,
  })
  @IsOptional()
  @IsEnum(TranslatableField)
  field?: TranslatableField;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
