import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AffiliateStatus, AffiliateTier } from '../../../entities/affiliate-profile.entity';

export class AdminUpdateAffiliateDto {
  @ApiPropertyOptional({ enum: AffiliateStatus })
  @IsOptional()
  @IsEnum(AffiliateStatus)
  status?: AffiliateStatus;

  @ApiPropertyOptional({ enum: AffiliateTier })
  @IsOptional()
  @IsEnum(AffiliateTier)
  tier?: AffiliateTier;

  @ApiPropertyOptional({ description: 'Override commission rate' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  commissionRate?: number;

  @ApiPropertyOptional({ description: 'Review notes' })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ReviewAffiliateApplicationDto {
  @ApiPropertyOptional({ enum: [AffiliateStatus.ACTIVE, AffiliateStatus.REJECTED] })
  @IsEnum(AffiliateStatus)
  decision: AffiliateStatus.ACTIVE | AffiliateStatus.REJECTED;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

export class ReviewCommissionDto {
  @ApiPropertyOptional({ description: 'Approve or reverse the commission' })
  @IsEnum(['approved', 'reversed'] as const)
  decision: 'approved' | 'reversed';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkApproveCommissionsDto {
  @IsString({ each: true })
  commissionIds: string[];
}
