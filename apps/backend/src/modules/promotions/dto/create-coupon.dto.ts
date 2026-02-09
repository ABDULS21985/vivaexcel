import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDateString,
  IsObject,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DiscountType,
  CouponApplicableTo,
} from '../enums/promotion.enums';

export class CreateCouponDto {
  @ApiPropertyOptional({
    description: 'Coupon code (auto-generated if not provided)',
    example: 'SUMMER2025',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ description: 'Coupon name', example: 'Summer Sale Coupon' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Coupon description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: DiscountType,
    description: 'Type of discount',
    example: DiscountType.PERCENTAGE,
  })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount value', example: 15 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Currency code', example: 'USD' })
  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @ApiPropertyOptional({ description: 'Minimum order amount to apply coupon', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount amount cap', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional({
    enum: CouponApplicableTo,
    description: 'What the coupon applies to',
    default: CouponApplicableTo.ALL_PRODUCTS,
  })
  @IsOptional()
  @IsEnum(CouponApplicableTo)
  applicableTo?: CouponApplicableTo;

  @ApiPropertyOptional({
    description: 'Product IDs the coupon applies to',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableProductIds?: string[];

  @ApiPropertyOptional({
    description: 'Category IDs the coupon applies to',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableCategoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Product types the coupon applies to',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableProductTypes?: string[];

  @ApiPropertyOptional({
    description: 'Seller IDs the coupon applies to',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  applicableSellerIds?: string[];

  @ApiPropertyOptional({ description: 'Total usage limit for the coupon', example: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Usage limit per user', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  usageLimitPerUser?: number;

  @ApiProperty({ description: 'Coupon start date', example: '2025-06-01T00:00:00Z' })
  @IsDateString()
  startsAt: string;

  @ApiProperty({ description: 'Coupon expiration date', example: '2025-08-31T23:59:59Z' })
  @IsDateString()
  expiresAt: string;

  @ApiPropertyOptional({ description: 'Whether the coupon is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
