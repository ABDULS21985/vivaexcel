import { IsString, IsOptional, IsArray, IsUrl, IsEnum, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PayoutSchedule } from '../../../entities/seller-profile.entity';

export class UpdateAffiliateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  customSlug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  socialLinks?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  promotionMethods?: string[];

  @ApiPropertyOptional({ enum: PayoutSchedule })
  @IsOptional()
  @IsEnum(PayoutSchedule)
  payoutSchedule?: PayoutSchedule;
}
