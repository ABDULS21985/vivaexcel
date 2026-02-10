import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsArray,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShowcaseStatus } from '../enums/showcase.enums';

export enum ShowcaseSortBy {
  NEWEST = 'newest',
  POPULAR = 'popular',
  FEATURED = 'featured',
}

export class CreateShowcaseDto {
  @ApiProperty({ description: 'Showcase title', example: 'My awesome project' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Showcase description', example: 'Built with VivaExcel templates...' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Digital product ID used in the project' })
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
  images?: string[];

  @ApiPropertyOptional({ description: 'URL to the live project', example: 'https://myproject.com' })
  @IsOptional()
  @IsString()
  projectUrl?: string;

  @ApiPropertyOptional({
    description: 'Tags for the showcase',
    type: [String],
    example: ['dashboard', 'saas'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateShowcaseDto extends PartialType(CreateShowcaseDto) {}

export class ShowcaseQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: ShowcaseSortBy,
    description: 'Sort order for results',
    default: ShowcaseSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(ShowcaseSortBy)
  sortBy?: ShowcaseSortBy;

  @ApiPropertyOptional({ enum: ShowcaseStatus, description: 'Filter by status' })
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
  @ApiProperty({ description: 'Comment content', example: 'Great work!' })
  @IsString()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ description: 'Parent comment ID for replies' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class ModerateShowcaseDto {
  @ApiProperty({
    enum: ShowcaseStatus,
    description: 'New status for the showcase',
    example: ShowcaseStatus.APPROVED,
  })
  @IsEnum(ShowcaseStatus)
  status: ShowcaseStatus;
}
