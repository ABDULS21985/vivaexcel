import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

// ─── Request DTOs ────────────────────────────────────────────────────────────

export class GenerateTitlesDto {
  @ApiProperty({
    description: 'The blog post content to generate title suggestions for',
    example: 'This article covers the best practices for building REST APIs with NestJS...',
  })
  @IsString()
  @MaxLength(50000)
  content: string;
}

export class GenerateMetaDescriptionDto {
  @ApiProperty({
    description: 'The blog post title',
    example: 'How to Build a REST API with NestJS',
  })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'The blog post content',
    example: 'This article covers the best practices for building REST APIs with NestJS...',
  })
  @IsString()
  @MaxLength(50000)
  content: string;
}

export class GenerateExcerptDto {
  @ApiProperty({
    description: 'The blog post content to generate an excerpt from',
    example: 'This article covers the best practices for building REST APIs with NestJS...',
  })
  @IsString()
  @MaxLength(50000)
  content: string;

  @ApiPropertyOptional({
    description: 'Maximum length of the excerpt in characters',
    example: 160,
    default: 160,
  })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  maxLength?: number;
}

export class GenerateOutlineDto {
  @ApiProperty({
    description: 'The topic to generate an article outline for',
    example: 'Building Scalable REST APIs with NestJS',
  })
  @IsString()
  @MaxLength(500)
  topic: string;

  @ApiPropertyOptional({
    description: 'Keywords to include in the outline',
    example: ['NestJS', 'REST API', 'TypeScript', 'scalability'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];
}

export class AnalyzeContentDto {
  @ApiProperty({
    description: 'The blog post content to analyze',
    example: 'This article covers the best practices for building REST APIs with NestJS...',
  })
  @IsString()
  @MaxLength(100000)
  content: string;
}

export enum WritingTone {
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  TECHNICAL = 'technical',
}

export class ImproveParagraphDto {
  @ApiProperty({
    description: 'The text to improve',
    example: 'APIs are good. You should build them with NestJS because it is nice.',
  })
  @IsString()
  @MaxLength(10000)
  text: string;

  @ApiPropertyOptional({
    description: 'The desired writing tone',
    enum: WritingTone,
    default: WritingTone.PROFESSIONAL,
  })
  @IsOptional()
  @IsEnum(WritingTone)
  tone?: WritingTone;
}

export class GenerateAltTextDto {
  @ApiProperty({
    description: 'A description of the image to generate alt text for',
    example: 'A screenshot of a NestJS application running in the terminal with green success messages',
  })
  @IsString()
  @MaxLength(2000)
  imageDescription: string;
}

// ─── Response Interfaces ─────────────────────────────────────────────────────

export interface ContentAnalysis {
  readabilityScore: number; // 0-100
  wordCount: number;
  estimatedReadTime: number; // minutes
  sentimentScore: number; // -1 to 1
  keyTopics: string[];
  seoScore: number; // 0-100
  suggestions: string[];
}

export interface AiTitlesResponse {
  titles: string[];
}

export interface AiTextResponse {
  text: string;
}

export interface AiAnalysisResponse {
  analysis: ContentAnalysis;
}
