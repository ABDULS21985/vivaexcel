import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { BillingPeriod } from '../../../entities/marketplace-subscription.entity';

export class CreateMarketplaceSubscriptionDto {
  @IsUUID()
  planId: string;

  @IsEnum(BillingPeriod)
  billingPeriod: BillingPeriod;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
