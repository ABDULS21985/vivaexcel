import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFlashSaleDto {
  @ApiProperty({ description: 'Flash sale name', example: 'Weekend Flash Sale' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Flash sale description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Discount percentage', example: 30 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiProperty({
    description: 'Product IDs included in the flash sale',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];

  @ApiProperty({ description: 'Flash sale start date', example: '2025-07-01T00:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'Flash sale end date', example: '2025-07-02T00:00:00Z' })
  @IsDateString()
  endsAt: string;

  @ApiPropertyOptional({ description: 'Featured image URL for the flash sale' })
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @ApiPropertyOptional({ description: 'Maximum purchases allowed per user', example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxPurchasesPerUser?: number;
}
