import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCouponDto } from './create-coupon.dto';

export class BulkCreateCouponsDto extends OmitType(CreateCouponDto, ['code'] as const) {
  @ApiProperty({ description: 'Number of coupons to generate', example: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(1000)
  count: number;

  @ApiPropertyOptional({
    description: 'Prefix for generated coupon codes',
    example: 'BULK',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  prefix?: string;
}
