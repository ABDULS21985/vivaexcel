import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { TeamPlan } from '../entities/team.entity';

export class CreateTeamDto {
  @ApiProperty({ example: 'Engineering Team' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'engineering-team' })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiPropertyOptional({ example: 'Our engineering department workspace' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ enum: TeamPlan, default: TeamPlan.TEAM_STARTER })
  @IsOptional()
  @IsEnum(TeamPlan)
  plan?: TeamPlan;

  @ApiPropertyOptional({ example: 'billing@company.com' })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;
}
