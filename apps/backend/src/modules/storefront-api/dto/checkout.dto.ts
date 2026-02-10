import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Cart ID to create checkout from',
    example: 'uuid-string',
  })
  @IsString()
  @IsNotEmpty()
  cartId: string;

  @ApiProperty({
    description: 'URL to redirect to after successful payment',
    example: 'https://mystore.com/success',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  successUrl: string;

  @ApiProperty({
    description: 'URL to redirect to when payment is cancelled',
    example: 'https://mystore.com/cancel',
  })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  cancelUrl: string;
}
