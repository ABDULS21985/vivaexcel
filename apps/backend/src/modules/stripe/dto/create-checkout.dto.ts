import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Stripe Price ID for the subscription plan' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

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
