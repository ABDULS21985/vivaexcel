import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
  ArrayMinSize,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBundleDiscountDto {
  @ApiProperty({ description: 'Bundle name', example: 'Starter Pack Bundle' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Bundle description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product IDs included in the bundle (minimum 2)',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @IsUUID('4', { each: true })
  productIds: string[];

  @ApiProperty({ description: 'Bundle price', example: 79.99 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bundlePrice: number;

  @ApiPropertyOptional({ description: 'Whether the bundle is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Bundle start date', example: '2025-06-01T00:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'Bundle end date', example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  endsAt: string;
}
