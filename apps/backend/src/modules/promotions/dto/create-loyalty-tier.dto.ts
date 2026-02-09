import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoyaltyTierName } from '../enums/promotion.enums';

export class CreateLoyaltyTierDto {
  @ApiProperty({
    enum: LoyaltyTierName,
    description: 'Loyalty tier name',
    example: LoyaltyTierName.GOLD,
  })
  @IsEnum(LoyaltyTierName)
  name: LoyaltyTierName;

  @ApiProperty({ description: 'Minimum spend to qualify for this tier', example: 500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumSpend: number;

  @ApiProperty({ description: 'Discount percentage for this tier', example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage: number;

  @ApiPropertyOptional({
    description: 'Additional perks for this tier',
    example: { freeShipping: true, prioritySupport: true },
  })
  @IsOptional()
  @IsObject()
  perks?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Icon URL for the tier' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Tier color hex code', example: '#FFD700' })
  @IsOptional()
  @IsString()
  @MaxLength(7)
  color?: string;
}
