import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsEmail,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TeamPlan } from '../entities/team.entity';

export class UpdateTeamDto {
  @ApiPropertyOptional({ example: 'Engineering Team' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 'Our engineering department workspace' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ enum: TeamPlan })
  @IsOptional()
  @IsEnum(TeamPlan)
  plan?: TeamPlan;

  @ApiPropertyOptional({ example: 'billing@company.com' })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({ example: { street: '123 Main St', city: 'NYC' } })
  @IsOptional()
  billingAddress?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  sharedLibraryEnabled?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  purchaseApprovalRequired?: boolean;

  @ApiPropertyOptional({ example: 5000.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monthlyBudget?: number | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  invoicingEnabled?: boolean;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxMembers?: number;
}
