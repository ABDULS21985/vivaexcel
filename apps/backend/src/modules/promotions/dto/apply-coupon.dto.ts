import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ApplyCouponDto {
  @ApiProperty({ description: 'Coupon code to apply', example: 'SUMMER2025' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Order ID to apply the coupon to' })
  @IsUUID()
  orderId: string;

  @ApiProperty({ description: 'Calculated discount amount', example: 15.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  discountAmount: number;
}
