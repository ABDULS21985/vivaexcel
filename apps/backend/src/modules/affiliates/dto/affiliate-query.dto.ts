import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateStatus, AffiliateTier } from '../../../entities/affiliate-profile.entity';

export class AffiliateQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AffiliateStatus })
  @IsOptional()
  @IsEnum(AffiliateStatus)
  status?: AffiliateStatus;

  @ApiPropertyOptional({ enum: AffiliateTier })
  @IsOptional()
  @IsEnum(AffiliateTier)
  tier?: AffiliateTier;
}
