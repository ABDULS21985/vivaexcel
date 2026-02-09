import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'ID of the membership tier to subscribe to' })
  @IsUUID()
  tierId: string;

  @ApiProperty({
    description: 'Stripe payment method ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
