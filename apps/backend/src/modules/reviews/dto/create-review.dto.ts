import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsArray,
  IsObject,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Digital product ID to review' })
  @IsUUID()
  digitalProductId: string;

  @ApiPropertyOptional({ description: 'Order ID for purchase verification' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({ description: 'Rating from 1 to 5', example: 4 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review title', example: 'Great product!' })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Review body text', example: 'This product exceeded my expectations...' })
  @IsString()
  body: string;

  @ApiPropertyOptional({
    description: 'List of pros',
    type: [String],
    example: ['Easy to use', 'Well documented'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pros?: string[];

  @ApiPropertyOptional({
    description: 'List of cons',
    type: [String],
    example: ['Could use more templates'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cons?: string[];

  @ApiPropertyOptional({
    description: 'Image URLs attached to the review',
    type: [String],
    example: ['https://example.com/screenshot1.png'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata (browser, OS info)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
