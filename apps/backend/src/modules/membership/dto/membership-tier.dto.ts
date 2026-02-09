import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMembershipTierDto {
  @ApiProperty({ example: 'Pro' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'pro' })
  @IsString()
  @MaxLength(100)
  slug: string;

  @ApiProperty({ example: 'Access to all pro features and exclusive content' })
  @IsString()
  description: string;

  @ApiProperty({ example: 9.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualPrice: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['Unlimited reading', 'Access to premium posts'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMembershipTierDto {
  @ApiPropertyOptional({ example: 'Pro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Access to all pro features and exclusive content' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 9.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyPrice?: number;

  @ApiPropertyOptional({ example: 99.99 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  annualPrice?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}

export class MembershipTierResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  monthlyPrice: number;

  @ApiProperty()
  annualPrice: number;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  sortOrder: number;
}

export class SubscriptionStatusResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ type: MembershipTierResponseDto })
  tier: MembershipTierResponseDto;

  @ApiProperty()
  currentPeriodStart: Date;

  @ApiProperty()
  currentPeriodEnd: Date;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;
}
