import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
  Min,
  MaxLength,
} from 'class-validator';
import { SlideContentType } from '../enums/presentation.enums';

export class CreateSlidePreviewDto {
  @ApiProperty({ description: 'Slide number in the presentation', example: 1 })
  @IsInt()
  @Min(1)
  slideNumber: number;

  @ApiPropertyOptional({ description: 'Slide title if detectable', example: 'Introduction' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiProperty({ description: 'URL to thumbnail image' })
  @IsString()
  thumbnailUrl: string;

  @ApiProperty({ description: 'Storage key for the thumbnail' })
  @IsString()
  thumbnailKey: string;

  @ApiPropertyOptional({ description: 'Larger preview image URL' })
  @IsOptional()
  @IsString()
  previewUrl?: string;

  @ApiPropertyOptional({ description: 'Storage key for preview image' })
  @IsOptional()
  @IsString()
  previewKey?: string;

  @ApiProperty({ description: 'Image width in pixels', example: 1920 })
  @IsInt()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Image height in pixels', example: 1080 })
  @IsInt()
  @Min(1)
  height: number;

  @ApiPropertyOptional({ description: 'Whether the slide has speaker notes', default: false })
  @IsOptional()
  @IsBoolean()
  hasNotes?: boolean;

  @ApiPropertyOptional({
    description: 'First 200 characters of speaker notes',
    example: 'Welcome to this presentation about...',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notesPreview?: string;

  @ApiPropertyOptional({ enum: SlideContentType, description: 'Type of slide content' })
  @IsOptional()
  @IsEnum(SlideContentType)
  contentType?: SlideContentType;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
