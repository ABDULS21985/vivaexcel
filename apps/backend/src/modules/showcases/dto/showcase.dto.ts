import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsInt,
  IsEnum,
  MaxLength,
  ArrayMaxSize,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShowcaseStatus } from '../enums/showcase.enums';

export enum ShowcaseSortBy {
  NEWEST = 'newest',
  POPULAR = 'popular',
  FEATURED = 'featured',
}

export class CreateShowcaseDto {
  @ApiProperty({ description: 'Showcase title', example: 'My Amazing Project' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Showcase description', example: 'Built using the Excel template...' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Digital product ID used in the showcase' })
  @IsUUID()
  productId: string;

  @ApiPropertyOptional({
    description: 'Image URLs for the showcase',
    type: [String],
    example: ['https://example.com/screenshot1.png'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  images?: string[];

  @ApiPropertyOptional({ description: 'Project URL', example: 'https://myproject.com' })
  @IsOptional()
  @IsString()
  projectUrl?: string;

  @ApiPropertyOptional({
    description: 'Tags for the showcase',
    type: [String],
    example: ['excel', 'dashboard', 'finance'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateShowcaseDto extends PartialType(CreateShowcaseDto) {}

export class ShowcaseQueryDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort order', enum: ShowcaseSortBy })
  @IsOptional()
  @IsEnum(ShowcaseSortBy)
  sortBy?: ShowcaseSortBy;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ShowcaseStatus })
  @IsOptional()
  @IsEnum(ShowcaseStatus)
  status?: ShowcaseStatus;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;
}

export class ShowcaseCommentDto {
  @ApiProperty({ description: 'Comment content', example: 'Great showcase!' })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class ModerateShowcaseDto {
  @ApiProperty({ description: 'New showcase status', enum: ShowcaseStatus })
  @IsEnum(ShowcaseStatus)
  status: ShowcaseStatus;
}
