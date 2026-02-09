import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean, IsNumber, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CursorPaginationDto } from '../../../common/dto/pagination.dto';
import {
  Industry,
  PresentationType,
  FileFormat,
  AspectRatio,
} from '../enums/presentation.enums';

export class PresentationQueryDto extends CursorPaginationDto {
  @ApiPropertyOptional({ description: 'Search by title or description (from digital product)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: Industry, description: 'Filter by industry' })
  @IsOptional()
  @IsEnum(Industry)
  industry?: Industry;

  @ApiPropertyOptional({ enum: PresentationType, description: 'Filter by presentation type' })
  @IsOptional()
  @IsEnum(PresentationType)
  presentationType?: PresentationType;

  @ApiPropertyOptional({ enum: FileFormat, description: 'Filter by file format' })
  @IsOptional()
  @IsEnum(FileFormat)
  fileFormat?: FileFormat;

  @ApiPropertyOptional({ enum: AspectRatio, description: 'Filter by aspect ratio' })
  @IsOptional()
  @IsEnum(AspectRatio)
  aspectRatio?: AspectRatio;

  @ApiPropertyOptional({ description: 'Filter by animations support' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasAnimations?: boolean;

  @ApiPropertyOptional({ description: 'Filter by speaker notes availability' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasSpeakerNotes?: boolean;

  @ApiPropertyOptional({ description: 'Minimum slide count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minSlideCount?: number;

  @ApiPropertyOptional({ description: 'Maximum slide count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(1000)
  maxSlideCount?: number;

  @ApiPropertyOptional({ description: 'Filter by software compatibility (e.g., "PowerPoint 2019")' })
  @IsOptional()
  @IsString()
  softwareCompatibility?: string;

  @ApiPropertyOptional({ description: 'Minimum price filter' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price filter' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by featured presentations' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;
}
