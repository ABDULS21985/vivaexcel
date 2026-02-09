import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUUID,
  IsInt,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';
import { PostStatus, PostVisibility, MembershipTierLevel } from '../../../entities/post.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'How to Build a REST API' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'how-to-build-a-rest-api' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'A deep dive into REST API design' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @ApiPropertyOptional({ example: 'A comprehensive guide to building REST APIs' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @ApiPropertyOptional({ example: '<p>Full article content here...</p>' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ enum: PostStatus, default: PostStatus.DRAFT })
  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @ApiPropertyOptional({ enum: PostVisibility, default: PostVisibility.PUBLIC })
  @IsOptional()
  @IsEnum(PostVisibility)
  visibility?: PostVisibility;

  @ApiPropertyOptional({ enum: MembershipTierLevel, description: 'Minimum tier required when visibility is paid' })
  @IsOptional()
  @IsEnum(MembershipTierLevel)
  minimumTier?: MembershipTierLevel;

  @ApiPropertyOptional({ example: 'Building REST APIs' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  series?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seriesOrder?: number;

  @ApiPropertyOptional({ example: 'https://example.com/original-post' })
  @IsOptional()
  @IsString()
  canonicalUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  noIndex?: boolean;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ example: 'uuid-of-category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String], example: ['uuid-tag-1', 'uuid-tag-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 'REST API Guide - Complete Tutorial' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'Learn how to build REST APIs from scratch' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
