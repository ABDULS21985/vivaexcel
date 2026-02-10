import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { BillingPeriod } from '../../../entities/marketplace-subscription.entity';

export class ChangePlanDto {
  @IsUUID()
  newPlanId: string;

  @IsOptional()
  @IsEnum(BillingPeriod)
  billingPeriod?: BillingPeriod;
}
