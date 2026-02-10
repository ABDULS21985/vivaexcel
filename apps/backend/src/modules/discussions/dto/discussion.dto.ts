import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  MaxLength,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ThreadSortBy {
  NEWEST = 'newest',
  ACTIVE = 'active',
  POPULAR = 'popular',
}

export class CreateThreadDto {
  @ApiProperty({ description: 'Thread title', maxLength: 300 })
  @IsString()
  @MaxLength(300)
  title: string;

  @ApiProperty({ description: 'Thread content (supports markdown)' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Tags for the thread',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateThreadDto extends PartialType(CreateThreadDto) {}

export class CreateReplyDto {
  @ApiProperty({ description: 'Reply content', maxLength: 5000 })
  @IsString()
  @MaxLength(5000)
  content: string;

  @ApiPropertyOptional({ description: 'Parent reply ID for nested replies' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class ThreadQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Filter by category slug' })
  @IsOptional()
  @IsString()
  categorySlug?: string;

  @ApiPropertyOptional({
    description: 'Sort threads by',
    enum: ThreadSortBy,
    default: ThreadSortBy.NEWEST,
  })
  @IsOptional()
  @IsEnum(ThreadSortBy)
  sortBy: ThreadSortBy = ThreadSortBy.NEWEST;

  @ApiPropertyOptional({ description: 'Search threads by title' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ModerateThreadDto {
  @ApiPropertyOptional({ description: 'Pin the thread' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ description: 'Lock the thread (no new replies)' })
  @IsOptional()
  @IsBoolean()
  isLocked?: boolean;

  @ApiPropertyOptional({ description: 'Close the thread' })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}
