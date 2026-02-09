import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { SeriesStatus } from '../../../entities/post-series.entity';

export class UpdateSeriesDto {
  @ApiPropertyOptional({ example: 'Building REST APIs from Scratch' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'building-rest-apis-from-scratch' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    example: 'A comprehensive series covering REST API design and implementation',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/series-cover.jpg' })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({ enum: SeriesStatus })
  @IsOptional()
  @IsEnum(SeriesStatus)
  status?: SeriesStatus;
}
