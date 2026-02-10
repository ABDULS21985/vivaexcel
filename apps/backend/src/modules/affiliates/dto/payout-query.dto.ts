import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliatePayoutStatus } from '../../../entities/affiliate-payout.entity';

export class PayoutQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cursor?: string;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ enum: AffiliatePayoutStatus })
  @IsOptional()
  @IsEnum(AffiliatePayoutStatus)
  status?: AffiliatePayoutStatus;
}
