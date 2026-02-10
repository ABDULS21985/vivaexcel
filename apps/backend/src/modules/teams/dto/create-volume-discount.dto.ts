import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsEnum, IsOptional, IsArray, IsBoolean, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VolumeDiscountApplicableTo } from '../entities/volume-discount.entity';

export class CreateVolumeDiscountDto {
  @ApiProperty({ example: 5, description: 'Minimum quantity for this discount tier' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minQuantity: number;

  @ApiPropertyOptional({ example: 9, description: 'Maximum quantity (null for unlimited)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

  @ApiProperty({ example: 10.0, description: 'Discount percentage' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountPercentage: number;

  @ApiPropertyOptional({ enum: VolumeDiscountApplicableTo, default: VolumeDiscountApplicableTo.ALL })
  @IsOptional()
  @IsEnum(VolumeDiscountApplicableTo)
  applicableTo?: VolumeDiscountApplicableTo;

  @ApiPropertyOptional({ type: [String], example: ['product-uuid-1', 'product-uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableIds?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
