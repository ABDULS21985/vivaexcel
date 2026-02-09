import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Updated rating from 1 to 5', example: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Updated review title', example: 'Updated: Still a great product!' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Updated review body text' })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    description: 'Updated list of pros',
    type: [String],
    example: ['Easy to use', 'Well documented'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pros?: string[];

  @ApiPropertyOptional({
    description: 'Updated list of cons',
    type: [String],
    example: ['Could use more templates'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cons?: string[];

  @ApiPropertyOptional({
    description: 'Updated image URLs',
    type: [String],
    example: ['https://example.com/screenshot1.png'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
