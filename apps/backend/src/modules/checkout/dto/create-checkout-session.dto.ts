import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUrl, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'URL to redirect to on successful checkout' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ description: 'URL to redirect to on canceled checkout' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  cancelUrl: string;

  @ApiPropertyOptional({ description: 'Coupon code to apply for a discount' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
