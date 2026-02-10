import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsOptional, IsIn } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Tier ID for the subscription plan (e.g. basic, pro, premium)' })
  @IsString()
  @IsNotEmpty()
  tierId: string;

  @ApiProperty({ description: 'Billing interval', enum: ['month', 'year'] })
  @IsIn(['month', 'year'])
  interval: 'month' | 'year';

  @ApiProperty({ description: 'URL to redirect to on successful checkout' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  successUrl: string;

  @ApiProperty({ description: 'URL to redirect to on canceled checkout' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  cancelUrl: string;
}

export class CreatePortalDto {
  @ApiProperty({ description: 'URL to redirect to after leaving the portal' })
  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  returnUrl: string;
}
