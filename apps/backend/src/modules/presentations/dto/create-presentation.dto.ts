import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsInt,
  IsOptional,
  IsArray,
  IsUUID,
  IsDateString,
  Min,
  Max,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AspectRatio,
  Industry,
  PresentationType,
  FileFormat,
} from '../enums/presentation.enums';

export class ColorSchemeDto {
  @ApiProperty({ example: 'Corporate Blue' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: ['#003366', '#0066CC', '#FFFFFF', '#F0F0F0'] })
  @IsArray()
  @IsString({ each: true })
  colors: string[];
}

export class CreatePresentationDto {
  @ApiProperty({ description: 'Digital product ID to associate with this presentation' })
  @IsUUID()
  digitalProductId: string;

  @ApiProperty({ description: 'Total number of slides', example: 30 })
  @IsInt()
  @Min(1)
  @Max(1000)
  slideCount: number;

  @ApiProperty({ enum: AspectRatio, description: 'Slide aspect ratio', example: AspectRatio.WIDESCREEN })
  @IsEnum(AspectRatio)
  aspectRatio: AspectRatio;

  @ApiProperty({
    description: 'Compatible software versions',
    type: [String],
    example: ['PowerPoint 2016+', 'Google Slides', 'Keynote'],
  })
  @IsArray()
  @IsString({ each: true })
  softwareCompatibility: string[];

  @ApiPropertyOptional({
    description: 'Color schemes used in the presentation',
    type: [ColorSchemeDto],
    example: [{ name: 'Corporate Blue', colors: ['#003366', '#0066CC', '#FFFFFF'] }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ColorSchemeDto)
  colorSchemes?: ColorSchemeDto[];

  @ApiPropertyOptional({
    description: 'Font families used in the presentation',
    type: [String],
    example: ['Montserrat', 'Open Sans', 'Roboto'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fontFamilies?: string[];

  @ApiPropertyOptional({ description: 'Whether the presentation has animations', default: false })
  @IsOptional()
  @IsBoolean()
  hasAnimations?: boolean;

  @ApiPropertyOptional({ description: 'Whether the presentation has transitions', default: false })
  @IsOptional()
  @IsBoolean()
  hasTransitions?: boolean;

  @ApiPropertyOptional({ description: 'Whether the presentation has speaker notes', default: false })
  @IsOptional()
  @IsBoolean()
  hasSpeakerNotes?: boolean;

  @ApiPropertyOptional({ description: 'Whether the presentation has charts', default: false })
  @IsOptional()
  @IsBoolean()
  hasCharts?: boolean;

  @ApiPropertyOptional({ description: 'Whether the presentation has images', default: false })
  @IsOptional()
  @IsBoolean()
  hasImages?: boolean;

  @ApiPropertyOptional({ description: 'Number of master slides', example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  masterSlideCount?: number;

  @ApiPropertyOptional({ description: 'Number of slide layouts', example: 12 })
  @IsOptional()
  @IsInt()
  @Min(0)
  layoutCount?: number;

  @ApiProperty({ enum: Industry, description: 'Target industry', example: Industry.BUSINESS })
  @IsEnum(Industry)
  industry: Industry;

  @ApiProperty({
    enum: PresentationType,
    description: 'Presentation type',
    example: PresentationType.PITCH_DECK,
  })
  @IsEnum(PresentationType)
  presentationType: PresentationType;

  @ApiProperty({ enum: FileFormat, description: 'File format', example: FileFormat.PPTX })
  @IsEnum(FileFormat)
  fileFormat: FileFormat;

  @ApiPropertyOptional({ description: 'Human-readable file size', example: '25.4 MB' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  presentationSize?: string;

  @ApiPropertyOptional({ description: 'Subcategory for templates', example: 'Corporate' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  templateCategory?: string;

  @ApiPropertyOptional({ description: 'Whether all elements are fully editable', default: true })
  @IsOptional()
  @IsBoolean()
  isFullyEditable?: boolean;

  @ApiPropertyOptional({ description: 'Whether documentation is included', default: false })
  @IsOptional()
  @IsBoolean()
  includesDocumentation?: boolean;

  @ApiPropertyOptional({ description: 'When AI last analyzed the presentation' })
  @IsOptional()
  @IsDateString()
  lastAnalyzedAt?: string;

  @ApiPropertyOptional({ description: 'AI-generated description of the presentation' })
  @IsOptional()
  @IsString()
  aiGeneratedDescription?: string;

  @ApiPropertyOptional({
    description: 'AI-suggested tags for the presentation',
    type: [String],
    example: ['business', 'corporate', 'pitch-deck'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aiSuggestedTags?: string[];

  @ApiPropertyOptional({ description: 'AI-suggested price for the presentation', example: 29.99 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  aiSuggestedPrice?: number;
}
