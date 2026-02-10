import { IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum ScreenshotBreakpoint {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop',
}

export class GeneratePreviewsDto {
  @ApiPropertyOptional({
    description: 'Whether to apply watermark to generated previews',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  watermark?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of slides to generate previews for',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  maxSlides?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of PDF pages to generate previews for',
    minimum: 1,
    maximum: 50,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  maxPages?: number;

  @ApiPropertyOptional({
    description: 'Breakpoints to capture screenshots for web templates',
    enum: ScreenshotBreakpoint,
    isArray: true,
  })
  @IsOptional()
  @IsEnum(ScreenshotBreakpoint, { each: true })
  breakpoints?: ScreenshotBreakpoint[];

  @ApiPropertyOptional({
    description: 'Maximum number of code files to extract and highlight',
    minimum: 1,
    maximum: 20,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  @Type(() => Number)
  maxCodeFiles?: number;

  @ApiPropertyOptional({
    description: 'Force regeneration even if previews already exist',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
